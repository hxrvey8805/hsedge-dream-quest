import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Target, Clock, DollarSign, ArrowUpDown, Loader2 } from "lucide-react";
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm border-b border-primary/30 p-6 pb-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Log New Trade
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Capture your trading performance
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Trade Information */}
          <Card className="p-6 bg-gradient-to-br from-card via-card/95 to-card/80 border-primary/10 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Trade Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trade_date">Date *</Label>
                <Input 
                  id="trade_date" 
                  name="trade_date" 
                  type="date" 
                  defaultValue={defaultDate} 
                  required
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="asset_class">Asset Class *</Label>
                <Select value={assetClass} onValueChange={setAssetClass} required>
                  <SelectTrigger className="transition-all duration-200">
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
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <Label htmlFor="symbol">Symbol *</Label>
                <Input 
                  id="symbol" 
                  name="symbol" 
                  placeholder={assetClass === "Forex" ? "EUR/USD" : assetClass === "Stocks" ? "AAPL" : assetClass === "Futures" ? "ES" : "BTC"} 
                  required
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="buy_sell">Side *</Label>
                <Select name="buy_sell" required>
                  <SelectTrigger className="transition-all duration-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Buy">Long/Buy</SelectItem>
                    <SelectItem value="Sell">Short/Sell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Section 2: Price & Risk Management */}
          <Card className="p-6 bg-gradient-to-br from-card via-card/95 to-card/80 border-primary/10 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Price & Risk Management</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="entry_price">Entry Price *</Label>
                <Input 
                  id="entry_price" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="exit_price">Exit Price *</Label>
                <Input 
                  id="exit_price" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  required
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div>
                <Label htmlFor="stop_loss">Stop Loss</Label>
                <Input 
                  id="stop_loss" 
                  type="number" 
                  step="any" 
                  placeholder="0.00"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
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
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
          </Card>

          {/* Live Trade Preview */}
          {entryPrice && exitPrice && size && (
            <Card 
              className={`p-6 border-2 shadow-lg animate-in fade-in-0 zoom-in-95 duration-300 ${
                previewProfit >= 0 
                  ? 'bg-gradient-to-br from-success/20 via-success/10 to-success/5 border-success/30' 
                  : previewProfit < 0
                  ? 'bg-gradient-to-br from-destructive/20 via-destructive/10 to-destructive/5 border-destructive/30'
                  : 'bg-gradient-to-br from-card via-card/95 to-card/80 border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${previewProfit >= 0 ? 'bg-success/20' : previewProfit < 0 ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                  <TrendingUp className={`h-5 w-5 ${previewProfit >= 0 ? 'text-success' : previewProfit < 0 ? 'text-destructive' : 'text-primary'}`} />
                </div>
                <h3 className="text-lg font-semibold">Live Trade Preview</h3>
              </div>
              <div className={`grid gap-4 ${(assetClass === "Forex" || assetClass === "Futures") ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Risk:Reward</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{previewRR}</p>
                </div>
                {(assetClass === "Forex" || assetClass === "Futures") && (
                  <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-medium">
                        {assetClass === "Forex" ? "Pips" : "Ticks"}
                      </span>
                    </div>
                    <p className={`text-2xl font-bold ${previewPips >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {previewPips >= 0 ? '+' : ''}{previewPips.toFixed(1)}
                    </p>
                  </div>
                )}
                <div className="text-center p-4 rounded-lg bg-background/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">Profit & Loss</span>
                  </div>
                  <p className={`text-3xl font-bold ${previewProfit >= 0 ? 'text-success' : previewProfit < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    ${previewProfit >= 0 ? '+' : ''}{previewProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Section 3: Trade Details & Timing */}
          <Card className="p-6 bg-gradient-to-br from-card via-card/95 to-card/80 border-primary/10 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Trade Details & Timing</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="session">Session</Label>
                <Select name="session">
                  <SelectTrigger className="transition-all duration-200">
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
                  <SelectTrigger className="transition-all duration-200">
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
                <Input 
                  id="strategy_type" 
                  name="strategy_type" 
                  placeholder="e.g., Breakout"
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <Label htmlFor="time_opened">Time Opened</Label>
                <Input 
                  id="time_opened" 
                  name="time_opened" 
                  type="time"
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
              <div>
                <Label htmlFor="time_closed">Time Closed</Label>
                <Input 
                  id="time_closed" 
                  name="time_closed" 
                  type="time"
                  className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Trade notes and observations..." 
                rows={4}
                className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary resize-none"
              />
            </div>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300 min-w-[140px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Save Trade
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
