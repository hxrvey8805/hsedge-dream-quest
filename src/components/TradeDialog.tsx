import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TradeDialogProps {
  selectedDate?: Date | null;
  onTradeAdded?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ASSET_CLASSES = ["Forex", "Stocks", "Futures", "Crypto"] as const;
const SESSIONS = ["Asia", "London", "New York", "NYSE", "FOMC/News"] as const;
const TIMEFRAMES = ["1M", "5M", "15M", "30M", "1H", "4H", "Daily"] as const;

export const TradeDialog = ({ selectedDate, onTradeAdded, open, onOpenChange }: TradeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [assetClass, setAssetClass] = useState<string>("Forex");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [fees, setFees] = useState<string>("");

  // Fix timezone issue by using local date components
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultDate = selectedDate
    ? getLocalDateString(selectedDate)
    : getLocalDateString(new Date());

  // Calculate R:R automatically
  const calculateRR = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const stop = parseFloat(stopLoss);
    
    if (!entry || !exit || !stop) return "N/A";
    
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(exit - entry);
    
    if (risk === 0) return "N/A";
    return `1:${(reward / risk).toFixed(2)}`;
  };

  // Calculate P&L based on asset class
  const calculatePnL = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const tradeSize = parseFloat(size);
    const tradeFees = parseFloat(fees) || 0;
    
    if (!entry || !exit || !tradeSize) return { pips: 0, profit: 0 };
    
    let pips = 0;
    let profit = 0;
    
    switch(assetClass) {
      case "Forex":
        pips = (exit - entry) * 10000; // Standard lot pip calculation
        profit = pips * tradeSize * 10 - tradeFees; // $10 per pip per lot
        break;
      case "Stocks":
        profit = (exit - entry) * tradeSize - tradeFees;
        break;
      case "Futures":
        const ticks = exit - entry;
        profit = ticks * tradeSize - tradeFees; // Size should include tick value
        pips = ticks; // Store ticks as pips for futures
        break;
      case "Crypto":
        profit = (exit - entry) * tradeSize - tradeFees;
        pips = exit - entry; // Store points as pips
        break;
    }
    
    return { pips: parseFloat(pips.toFixed(2)), profit: parseFloat(profit.toFixed(2)) };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const tradeDate = formData.get("trade_date") as string;
    const { pips: calculatedPips, profit: calculatedProfit } = calculatePnL();
    const rrRatio = calculateRR();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        trade_date: tradeDate,
        day_of_week: new Date(tradeDate).toLocaleDateString('en-US', { weekday: 'long' }),
        symbol: formData.get("symbol") as string,
        asset_class: assetClass,
        pair: formData.get("symbol") as string, // Keep for backward compatibility
        buy_sell: formData.get("buy_sell") as string,
        entry_price: parseFloat(entryPrice) || null,
        exit_price: parseFloat(exitPrice) || null,
        stop_loss: parseFloat(stopLoss) || null,
        size: parseFloat(size) || null,
        fees: parseFloat(fees) || null,
        time_opened: formData.get("time_opened") as string || null,
        time_closed: formData.get("time_closed") as string || null,
        duration: formData.get("duration") as string || null,
        session: formData.get("session") as string || null,
        strategy_type: formData.get("strategy_type") as string || null,
        entry_type: formData.get("entry_type") as string || null,
        entry_timeframe: formData.get("entry_timeframe") as string || null,
        risk_to_pay: formData.get("risk_to_pay") ? parseFloat(formData.get("risk_to_pay") as string) : null,
        total_pips_secured: formData.get("total_pips_secured") ? parseFloat(formData.get("total_pips_secured") as string) : null,
        max_drawdown_pips: formData.get("max_drawdown_pips") ? parseFloat(formData.get("max_drawdown_pips") as string) : null,
        pips: calculatedPips,
        profit: calculatedProfit,
        risk_reward_ratio: rrRatio,
        original_take_profit_percent: formData.get("original_take_profit_percent") ? parseFloat(formData.get("original_take_profit_percent") as string) : null,
        outcome: calculatedProfit > 0 ? "Win" : calculatedProfit < 0 ? "Loss" : "Break Even",
        notes: formData.get("notes") as string || null,
      });

      if (error) throw error;

      // Check achievements after successful trade
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const response = await supabase.functions.invoke('check-achievements', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (response.data) {
            const { newlyUnlocked, totalXPGained, leveledUp, newLevel } = response.data;
            
            // Show notifications for achievements
            if (newlyUnlocked && newlyUnlocked.length > 0) {
              newlyUnlocked.forEach((achievement: any) => {
                toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
                  description: `+${achievement.xp_reward} XP`,
                });
              });
            }
            
            // Show level up notification
            if (leveledUp) {
              toast.success(`⭐ Level Up! You're now Level ${newLevel}!`, {
                description: 'Keep up the great work!',
              });
            } else if (totalXPGained > 0) {
              toast.success(`+${totalXPGained} XP earned!`);
            }
          }
        }
      } catch (achievementError) {
        console.error('Error checking achievements:', achievementError);
        // Don't throw - we don't want to interrupt the trade logging flow
      }

      toast.success("Trade logged successfully!");
      onOpenChange(false);
      onTradeAdded?.();
      (e.target as HTMLFormElement).reset();
      setEntryPrice("");
      setExitPrice("");
      setStopLoss("");
      setSize("");
      setFees("");
    } catch (error: any) {
      toast.error(error.message || "Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  const { pips: previewPips, profit: previewProfit } = calculatePnL();
  const previewRR = calculateRR();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Trade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Essential Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="trade_date">Date *</Label>
              <Input id="trade_date" name="trade_date" type="date" defaultValue={defaultDate} required />
            </div>
            <div>
              <Label htmlFor="asset_class">Asset Class *</Label>
              <Select value={assetClass} onValueChange={setAssetClass} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CLASSES.map(ac => (
                    <SelectItem key={ac} value={ac}>{ac}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input 
                id="symbol" 
                name="symbol" 
                placeholder={assetClass === "Forex" ? "EUR/USD" : assetClass === "Stocks" ? "AAPL" : assetClass === "Futures" ? "ES" : "BTC"} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="buy_sell">Side *</Label>
              <Select name="buy_sell" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Buy">Long/Buy</SelectItem>
                  <SelectItem value="Sell">Short/Sell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Levels */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h3 className="font-medium text-sm">Price Levels *</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="entry_price">Entry Price</Label>
                <Input 
                  id="entry_price" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="exit_price">Exit Price</Label>
                <Input 
                  id="exit_price" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="stop_loss">Stop Loss</Label>
                <Input 
                  id="stop_loss" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="size">Size *</Label>
                <Input 
                  id="size" 
                  type="number" 
                  step="any" 
                  placeholder={assetClass === "Forex" ? "Lots" : assetClass === "Stocks" ? "Shares" : "Contracts"}
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fees">Fees/Comm</Label>
                <Input 
                  id="fees" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00"
                  value={fees}
                  onChange={(e) => setFees(e.target.value)}
                />
              </div>
            </div>
            
            {/* Auto-calculated preview */}
            {entryPrice && exitPrice && size && (
              <div className="mt-3 p-3 bg-background rounded border">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">R:R:</span>
                    <p className="font-semibold">{previewRR}</p>
                  </div>
                  {assetClass === "Forex" || assetClass === "Futures" ? (
                    <div>
                      <span className="text-muted-foreground text-xs">{assetClass === "Forex" ? "Pips" : "Ticks"}:</span>
                      <p className={`font-semibold ${previewPips >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {previewPips >= 0 ? '+' : ''}{previewPips.toFixed(1)}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <span className="text-muted-foreground text-xs">P&L:</span>
                    <p className={`font-semibold ${previewProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      ${previewProfit >= 0 ? '+' : ''}{previewProfit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trade Details */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="session">Session</Label>
              <Select name="session">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {SESSIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entry_timeframe">Entry Timeframe</Label>
              <Select name="entry_timeframe">
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map(tf => (
                    <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="strategy_type">Strategy</Label>
              <Input id="strategy_type" name="strategy_type" placeholder="e.g., Breakout" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="time_opened">Time Opened</Label>
              <Input id="time_opened" name="time_opened" type="time" />
            </div>
            <div>
              <Label htmlFor="time_closed">Time Closed</Label>
              <Input id="time_closed" name="time_closed" type="time" />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Trade notes and observations..." rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Trade"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
