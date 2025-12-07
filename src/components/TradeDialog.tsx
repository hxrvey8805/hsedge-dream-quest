import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Zap,
  Trophy,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TradeDialogProps {
  selectedDate?: Date | null;
  onTradeAdded?: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ASSET_CLASSES = [
  { value: "Forex", icon: "💱", label: "Forex" },
  { value: "Stocks", icon: "📈", label: "Stocks" },
  { value: "Futures", icon: "📊", label: "Futures" },
  { value: "Crypto", icon: "₿", label: "Crypto" },
] as const;

const SESSIONS = ["Asia", "London", "New York", "NYSE", "FOMC/News"] as const;
const TIMEFRAMES = ["1M", "5M", "15M", "30M", "1H", "4H", "Daily"] as const;

export const TradeDialog = ({ selectedDate, onTradeAdded, open, onOpenChange }: TradeDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [assetClass, setAssetClass] = useState<string>("Forex");
  const [buySell, setBuySell] = useState<string>("");
  const [symbol, setSymbol] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [fees, setFees] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");
  const [strategy, setStrategy] = useState<string>("");
  const [timeOpened, setTimeOpened] = useState<string>("");
  const [timeClosed, setTimeClosed] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setStep(1);
      setAssetClass("Forex");
      setBuySell("");
      setSymbol("");
      setEntryPrice("");
      setExitPrice("");
      setStopLoss("");
      setSize("");
      setFees("");
      setSession("");
      setTimeframe("");
      setStrategy("");
      setTimeOpened("");
      setTimeClosed("");
      setNotes("");
    }
  }, [open]);

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const defaultDate = selectedDate
    ? getLocalDateString(selectedDate)
    : getLocalDateString(new Date());

  const [tradeDate, setTradeDate] = useState(defaultDate);

  useEffect(() => {
    if (selectedDate) {
      setTradeDate(getLocalDateString(selectedDate));
    }
  }, [selectedDate]);

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
        pips = (exit - entry) * 10000;
        profit = pips * tradeSize * 10 - tradeFees;
        break;
      case "Stocks":
        profit = (exit - entry) * tradeSize - tradeFees;
        break;
      case "Futures":
        const ticks = exit - entry;
        profit = ticks * tradeSize - tradeFees;
        pips = ticks;
        break;
      case "Crypto":
        profit = (exit - entry) * tradeSize - tradeFees;
        pips = exit - entry;
        break;
    }
    
    return { pips: parseFloat(pips.toFixed(2)), profit: parseFloat(profit.toFixed(2)) };
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { pips: calculatedPips, profit: calculatedProfit } = calculatePnL();
    const rrRatio = calculateRR();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        trade_date: tradeDate,
        day_of_week: new Date(tradeDate).toLocaleDateString('en-US', { weekday: 'long' }),
        symbol: symbol,
        asset_class: assetClass,
        pair: symbol,
        buy_sell: buySell,
        entry_price: parseFloat(entryPrice) || null,
        exit_price: parseFloat(exitPrice) || null,
        stop_loss: parseFloat(stopLoss) || null,
        size: parseFloat(size) || null,
        fees: parseFloat(fees) || null,
        time_opened: timeOpened || null,
        time_closed: timeClosed || null,
        session: session || null,
        strategy_type: strategy || null,
        entry_timeframe: timeframe || null,
        pips: calculatedPips,
        profit: calculatedProfit,
        risk_reward_ratio: rrRatio,
        outcome: calculatedProfit > 0 ? "Win" : calculatedProfit < 0 ? "Loss" : "Break Even",
        notes: notes || null,
      });

      if (error) throw error;

      // Check achievements
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        if (authSession) {
          const response = await supabase.functions.invoke('check-achievements', {
            headers: { Authorization: `Bearer ${authSession.access_token}` },
          });

          if (response.data) {
            const { newlyUnlocked, totalXPGained, leveledUp, newLevel } = response.data;
            
            if (newlyUnlocked && newlyUnlocked.length > 0) {
              newlyUnlocked.forEach((achievement: any) => {
                toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, {
                  description: `+${achievement.xp_reward} XP`,
                });
              });
            }
            
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
      }

      toast.success("Trade logged successfully! 🚀");
      onOpenChange(false);
      onTradeAdded?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to log trade");
    } finally {
      setLoading(false);
    }
  };

  const { pips: previewPips, profit: previewProfit } = calculatePnL();
  const previewRR = calculateRR();
  const isWin = previewProfit > 0;
  const isLoss = previewProfit < 0;

  const canProceedStep1 = assetClass && symbol && buySell;
  const canProceedStep2 = entryPrice && exitPrice && size;
  const canSubmit = canProceedStep1 && canProceedStep2;

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-0 bg-gradient-to-b from-card to-background">
        {/* Header with progress */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Log New Trade</h2>
                <p className="text-sm text-muted-foreground">Step {step} of 3 • {step === 1 ? "Setup" : step === 2 ? "Numbers" : "Details"}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    s <= step 
                      ? 'bg-gradient-to-r from-primary to-accent shadow-sm shadow-primary/50' 
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Trade Setup */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Date */}
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Trade Date</Label>
                  <Input 
                    type="date" 
                    value={tradeDate}
                    onChange={(e) => setTradeDate(e.target.value)}
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>

                {/* Asset Class Selection */}
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">What are you trading?</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {ASSET_CLASSES.map((ac) => (
                      <button
                        key={ac.value}
                        type="button"
                        onClick={() => setAssetClass(ac.value)}
                        className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1 ${
                          assetClass === ac.value
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105'
                            : 'border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50'
                        }`}
                      >
                        <span className="text-2xl">{ac.icon}</span>
                        <span className="text-xs font-medium">{ac.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symbol */}
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Symbol</Label>
                  <Input 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    placeholder={assetClass === "Forex" ? "EUR/USD" : assetClass === "Stocks" ? "AAPL" : assetClass === "Futures" ? "ES" : "BTC"}
                    className="bg-secondary/50 border-border/50 focus:border-primary text-lg font-semibold tracking-wide"
                  />
                </div>

                {/* Buy/Sell */}
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Direction</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBuySell("Buy")}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        buySell === "Buy"
                          ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
                          : 'border-border/50 bg-secondary/30 hover:border-emerald-500/50'
                      }`}
                    >
                      <ArrowUpRight className={`h-5 w-5 ${buySell === "Buy" ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold ${buySell === "Buy" ? 'text-emerald-500' : 'text-foreground'}`}>Long / Buy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuySell("Sell")}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                        buySell === "Sell"
                          ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20'
                          : 'border-border/50 bg-secondary/30 hover:border-rose-500/50'
                      }`}
                    >
                      <ArrowDownRight className={`h-5 w-5 ${buySell === "Sell" ? 'text-rose-500' : 'text-muted-foreground'}`} />
                      <span className={`font-semibold ${buySell === "Sell" ? 'text-rose-500' : 'text-foreground'}`}>Short / Sell</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Numbers */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Trade summary badge */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <span className="text-lg">{ASSET_CLASSES.find(ac => ac.value === assetClass)?.icon}</span>
                  <span className="font-bold">{symbol}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    buySell === "Buy" ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                  }`}>
                    {buySell}
                  </span>
                </div>

                {/* Price inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Entry Price</Label>
                    <Input 
                      type="number"
                      step="any"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-secondary/50 border-border/50 focus:border-primary text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Exit Price</Label>
                    <Input 
                      type="number"
                      step="any"
                      value={exitPrice}
                      onChange={(e) => setExitPrice(e.target.value)}
                      placeholder="0.00"
                      className="bg-secondary/50 border-border/50 focus:border-primary text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Stop Loss</Label>
                    <Input 
                      type="number"
                      step="any"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="0.00"
                      className="bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Size</Label>
                    <Input 
                      type="number"
                      step="any"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder={assetClass === "Forex" ? "Lots" : "Units"}
                      className="bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Fees</Label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={fees}
                      onChange={(e) => setFees(e.target.value)}
                      placeholder="0.00"
                      className="bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Live P&L Preview */}
                {entryPrice && exitPrice && size && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl border-2 ${
                      isWin 
                        ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30' 
                        : isLoss 
                        ? 'bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/30'
                        : 'bg-secondary/50 border-border/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className={`h-4 w-4 ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-muted-foreground'}`} />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Live Preview</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">R:R</p>
                        <p className="text-lg font-bold text-foreground">{previewRR}</p>
                      </div>
                      {(assetClass === "Forex" || assetClass === "Futures") && (
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">{assetClass === "Forex" ? "Pips" : "Ticks"}</p>
                          <p className={`text-lg font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>
                            {previewPips >= 0 ? '+' : ''}{previewPips.toFixed(1)}
                          </p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">P&L</p>
                        <p className={`text-xl font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>
                          ${previewProfit >= 0 ? '+' : ''}{previewProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Final trade summary */}
                <div className={`p-4 rounded-xl border-2 ${
                  isWin 
                    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30' 
                    : isLoss 
                    ? 'bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/30'
                    : 'bg-secondary/50 border-border/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{ASSET_CLASSES.find(ac => ac.value === assetClass)?.icon}</span>
                      <div>
                        <p className="font-bold text-lg">{symbol}</p>
                        <p className="text-xs text-muted-foreground">{buySell} • {tradeDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>
                        ${previewProfit >= 0 ? '+' : ''}{previewProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{previewRR} R:R</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Session</Label>
                    <Select value={session} onValueChange={setSession}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
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
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Timeframe</Label>
                    <Select value={timeframe} onValueChange={setTimeframe}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
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
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Strategy</Label>
                    <Input 
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      placeholder="e.g., Breakout"
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Time Opened</Label>
                    <Input 
                      type="time"
                      value={timeOpened}
                      onChange={(e) => setTimeOpened(e.target.value)}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Time Closed</Label>
                    <Input 
                      type="time"
                      value={timeClosed}
                      onChange={(e) => setTimeClosed(e.target.value)}
                      className="bg-secondary/50 border-border/50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Notes & Reflections</Label>
                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you learn from this trade? What would you do differently?"
                    rows={3}
                    className="bg-secondary/50 border-border/50 focus:border-primary resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            {step > 1 ? (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            )}
            
            {step < 3 ? (
              <Button 
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canSubmit}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity min-w-[140px]"
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Trophy className="h-4 w-4" />
                    Log Trade
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
