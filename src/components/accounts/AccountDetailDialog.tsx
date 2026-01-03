import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, TrendingDown, Target, AlertTriangle, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AccountDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: {
    id: string;
    type: 'funded' | 'evaluation';
    company: string;
    account_size: string;
    running_pl: number;
    max_loss: number;
    profit_target?: number;
  } | null;
  onUpdate: () => void;
}

export const AccountDetailDialog = ({ open, onOpenChange, account, onUpdate }: AccountDetailDialogProps) => {
  const [runningPL, setRunningPL] = useState(0);
  const [maxLoss, setMaxLoss] = useState(0);
  const [profitTarget, setProfitTarget] = useState(0);
  const [editingPL, setEditingPL] = useState(false);
  const [editPLValue, setEditPLValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setRunningPL(account.running_pl || 0);
      setMaxLoss(account.max_loss || 0);
      setProfitTarget(account.profit_target || 0);
    }
  }, [account]);

  if (!account) return null;

  const accountSizeNum = parseFloat(account.account_size.replace(/[^0-9.-]+/g, "")) || 0;
  const currentBalance = accountSizeNum + runningPL;

  // Calculate position for the visual bar
  const range = account.type === 'evaluation' 
    ? profitTarget + maxLoss 
    : maxLoss * 2; // For funded, show symmetric range

  const minValue = accountSizeNum - maxLoss;
  const maxValue = account.type === 'evaluation' 
    ? accountSizeNum + profitTarget 
    : accountSizeNum + maxLoss;

  // Calculate percentage position (0 = max loss, 100 = profit target/max gain)
  const position = range > 0 
    ? ((currentBalance - minValue) / (maxValue - minValue)) * 100 
    : 50;

  const clampedPosition = Math.max(0, Math.min(100, position));

  // Status
  const isAtRisk = currentBalance <= minValue + (maxLoss * 0.2);
  const isCompleted = account.type === 'evaluation' && currentBalance >= maxValue;

  const handleSliderChange = (value: number[]) => {
    const newBalance = minValue + (value[0] / 100) * (maxValue - minValue);
    setRunningPL(newBalance - accountSizeNum);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const table = account.type === 'funded' ? 'funded_accounts' : 'evaluations';
      const updateData: any = { 
        running_pl: runningPL,
        max_loss: maxLoss,
      };
      
      if (account.type === 'evaluation') {
        updateData.profit_target = profitTarget;
      }

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq("id", account.id);

      if (error) throw error;
      
      toast.success("Account updated!");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handlePLEdit = () => {
    if (editingPL) {
      const newPL = parseFloat(editPLValue) || 0;
      setRunningPL(newPL);
      setEditingPL(false);
    } else {
      setEditPLValue(runningPL.toString());
      setEditingPL(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{account.company}</span>
            <span className="text-muted-foreground font-normal text-sm">
              {account.account_size}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Visual Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {account.type === 'evaluation' && (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Target className="h-4 w-4" />
                    <span className="text-xs uppercase tracking-wide">Profit Target</span>
                  </div>
                  <p className="text-lg font-bold text-amber-500">${maxValue.toLocaleString()}</p>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
                      <Check className="h-3 w-3" /> Completed
                    </span>
                  )}
                </div>
              )}
              {account.type === 'funded' && (
                <div className="text-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Max Gain</span>
                  <p className="text-lg font-bold text-success">${maxValue.toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* The visual bar */}
            <div className="relative h-48 flex justify-center">
              <div className="relative w-16 h-full rounded-lg bg-gradient-to-b from-amber-500/20 via-muted to-destructive/20 overflow-hidden">
                {/* Current position indicator */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/50 transition-all duration-300"
                  style={{ bottom: `${clampedPosition}%`, transform: 'translateY(50%)' }}
                />
                {/* Fill from bottom to current position */}
                <div 
                  className={`absolute left-0 right-0 bottom-0 transition-all duration-300 ${
                    runningPL >= 0 ? 'bg-gradient-to-t from-amber-500/60 to-amber-500/20' : 'bg-gradient-to-t from-destructive/60 to-destructive/20'
                  }`}
                  style={{ height: `${clampedPosition}%` }}
                />
              </div>

              {/* Current balance label */}
              <div 
                className="absolute left-24 flex items-center gap-2 transition-all duration-300"
                style={{ bottom: `${clampedPosition}%`, transform: 'translateY(50%)' }}
              >
                <div className="w-3 h-0.5 bg-primary" />
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Current</span>
                  <span className={`font-bold ${runningPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${currentBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs uppercase tracking-wide">Max Loss</span>
              </div>
              <p className="text-lg font-bold text-destructive">${minValue.toLocaleString()}</p>
              {isAtRisk && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs">
                  <AlertTriangle className="h-3 w-3" /> At Risk
                </span>
              )}
            </div>
          </div>

          {/* Drag Slider */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">Drag to update your current P&L</p>
            <Slider
              value={[clampedPosition]}
              onValueChange={handleSliderChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Running P&L</span>
                {editingPL ? (
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handlePLEdit}>
                      <Check className="h-3 w-3 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditingPL(false)}>
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="h-5 px-1 text-xs" onClick={() => { setEditPLValue(runningPL.toString()); setEditingPL(true); }}>
                    Edit
                  </Button>
                )}
              </div>
              {editingPL ? (
                <Input
                  type="number"
                  value={editPLValue}
                  onChange={(e) => setEditPLValue(e.target.value)}
                  className="h-8"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') handlePLEdit(); }}
                />
              ) : (
                <p className={`text-lg font-bold ${runningPL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {runningPL >= 0 ? '+' : ''}${runningPL.toLocaleString()}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">Starting Balance</span>
              <p className="text-lg font-bold">${accountSizeNum.toLocaleString()}</p>
            </div>

            {account.type === 'evaluation' && (
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="text-xs text-muted-foreground">Target</span>
                <p className="text-lg font-bold text-amber-500">${profitTarget.toLocaleString()}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/50">
              <span className="text-xs text-muted-foreground">Limit (Max Loss)</span>
              <p className="text-lg font-bold text-destructive">${maxLoss.toLocaleString()}</p>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
