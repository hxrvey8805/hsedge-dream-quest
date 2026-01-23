import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2, Edit2, Save, X, Globe, BarChart3, Activity, Zap, ArrowUpRight, ArrowDownRight, ArrowRight, Plus, LineChart, ClipboardList } from "lucide-react";
import { useAccounts } from "@/hooks/useAccounts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TradeChartDialog } from "@/components/TradeChartDialog";
import { DailyReviewDialog } from "@/components/review/DailyReviewDialog";

interface Trade {
  id: string;
  trade_date: string;
  pips: number | null;
  profit: number | null;
  outcome: string;
  pair: string | null;
  symbol: string | null;
  buy_sell: string;
  asset_class: string | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss: number | null;
  size: number | null;
  fees: number | null;
  session: string | null;
  entry_timeframe: string | null;
  strategy_type: string | null;
  time_opened: string | null;
  time_closed: string | null;
  risk_to_pay: number | null;
  total_pips_secured: number | null;
  risk_reward_ratio: string | null;
  notes: string | null;
  account_id: string | null;
  account_type: string | null;
}

interface DayStats {
  date: Date;
  trades: Trade[];
  totalPips: number;
  totalProfit: number;
  outcome: 'profit' | 'loss' | 'neutral';
}

interface TradingCalendarProps {
  onDaySelect: (date: Date) => void;
  viewMode: 'pips' | 'profit';
  refreshTrigger?: number;
  onRefresh?: () => void;
  selectedStrategy?: string | null;
  onMonthChange?: (month: Date) => void;
  selectedAccountId?: string | null;
}

const ASSET_CLASSES = [
  { value: "Forex", icon: Globe, iconString: "", label: "Forex", isString: false },
  { value: "Stocks", icon: BarChart3, iconString: "", label: "Stocks", isString: false },
  { value: "Futures", icon: Activity, iconString: "", label: "Futures", isString: false },
  { value: "Crypto", icon: null as any, iconString: "₿", label: "Crypto", isString: true },
];

const SESSIONS = ["Premarket", "Asia", "London", "New York", "NYSE", "FOMC/News"] as const;
const TIMEFRAMES = ["1M", "5M", "15M", "30M", "1H", "4H", "Daily"] as const;

export const TradingCalendar = ({ onDaySelect, viewMode, refreshTrigger, onRefresh, selectedStrategy, onMonthChange, selectedAccountId }: TradingCalendarProps) => {
  const { accounts } = useAccounts();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [moveAccountDialogOpen, setMoveAccountDialogOpen] = useState(false);
  const [tradeToMove, setTradeToMove] = useState<Trade | null>(null);
  const [selectedMoveAccountId, setSelectedMoveAccountId] = useState<string>("");
  const [chartDialogOpen, setChartDialogOpen] = useState(false);
  const [tradeForChart, setTradeForChart] = useState<Trade | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    symbol: "",
    asset_class: "",
    buy_sell: "",
    entry_price: "",
    exit_price: "",
    stop_loss: "",
    size: "",
    fees: "",
    session: "",
    entry_timeframe: "",
    strategy_type: "",
    time_opened: "",
    time_closed: "",
    notes: "",
    account_id: "",
  });

  useEffect(() => {
    fetchTrades();
  }, [currentMonth, refreshTrigger, selectedStrategy, selectedAccountId]);

  useEffect(() => {
    onMonthChange?.(currentMonth);
  }, [currentMonth, onMonthChange]);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    let query = supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("trade_date", monthStart.toISOString().split('T')[0])
      .lte("trade_date", monthEnd.toISOString().split('T')[0]);

    if (selectedStrategy) {
      query = query.eq("strategy_type", selectedStrategy);
    }

    if (selectedAccountId) {
      query = query.eq("account_id", selectedAccountId);
    } else {
      // When no account is selected (All Accounts), exclude evaluation and backtesting
      query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }

    const { data, error } = await query.order("trade_date", { ascending: true });

    if (!error && data) {
      setTrades(data);
    }
  };

  const getDayStats = (date: Date): DayStats => {
    const dayTrades = trades.filter(t => isSameDay(new Date(t.trade_date), date));
    const totalPips = dayTrades.reduce((sum, t) => sum + (t.pips || 0), 0);
    const totalProfit = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    
    const value = viewMode === 'pips' ? totalPips : totalProfit;
    let outcome: 'profit' | 'loss' | 'neutral' = 'neutral';
    if (value > 0) outcome = 'profit';
    else if (value < 0) outcome = 'loss';
    
    return { date, trades: dayTrades, totalPips, totalProfit, outcome };
  };

  const handleDayClick = (day: Date, dayStats: DayStats) => {
    if (dayStats.trades.length > 0) {
      setSelectedDay(day);
      setShowDetailsDialog(true);
    } else {
      onDaySelect(day);
    }
  };

  const calculateRiskReward = (trade: Trade) => {
    if (trade.risk_reward_ratio) return trade.risk_reward_ratio;
    if (!trade.risk_to_pay || !trade.total_pips_secured) return 'N/A';
    const reward = trade.total_pips_secured;
    const risk = trade.risk_to_pay;
    return `1:${(reward / risk).toFixed(2)}`;
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setEditForm({
      symbol: trade.symbol || trade.pair || "",
      asset_class: trade.asset_class || "Forex",
      buy_sell: trade.buy_sell || "",
      entry_price: trade.entry_price?.toString() || "",
      exit_price: trade.exit_price?.toString() || "",
      stop_loss: trade.stop_loss?.toString() || "",
      size: trade.size?.toString() || "",
      fees: trade.fees?.toString() || "",
      session: trade.session || "",
      entry_timeframe: trade.entry_timeframe || "",
      strategy_type: trade.strategy_type || "",
      time_opened: trade.time_opened || "",
      time_closed: trade.time_closed || "",
      notes: trade.notes || "",
      account_id: trade.account_id || "",
    });
  };

  const handleMoveAccount = (trade: Trade) => {
    setTradeToMove(trade);
    setSelectedMoveAccountId(trade.account_id || "");
    setMoveAccountDialogOpen(true);
  };

  const handleSaveMoveAccount = async () => {
    if (!tradeToMove) return;
    setIsSaving(true);

    try {
      // Determine account type from selected account
      let accountType: string | null = null;
      if (selectedMoveAccountId) {
        const selectedAccount = accounts.find(a => a.id === selectedMoveAccountId);
        accountType = selectedAccount?.type || null;
      }

      const { error } = await supabase
        .from("trades")
        .update({
          account_id: selectedMoveAccountId || null,
          account_type: accountType || null,
        })
        .eq("id", tradeToMove.id);

      if (error) throw error;

      toast.success("Trade moved to account successfully!");
      setMoveAccountDialogOpen(false);
      setTradeToMove(null);
      setSelectedMoveAccountId("");
      fetchTrades();
      onRefresh?.(); // Trigger stats refresh
    } catch (error: any) {
      toast.error(error.message || "Failed to move trade");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTrade = async () => {
    if (!editingTrade) return;
    setIsSaving(true);

    try {
      const entry = parseFloat(editForm.entry_price);
      const exit = parseFloat(editForm.exit_price);
      const stop = parseFloat(editForm.stop_loss);
      const tradeSize = parseFloat(editForm.size);
      const tradeFees = parseFloat(editForm.fees) || 0;

      // Check if financial fields have changed (only recalculate if they did)
      const financialFieldsChanged = 
        editForm.entry_price !== (editingTrade.entry_price?.toString() || "") ||
        editForm.exit_price !== (editingTrade.exit_price?.toString() || "") ||
        editForm.size !== (editingTrade.size?.toString() || "") ||
        editForm.fees !== (editingTrade.fees?.toString() || "") ||
        editForm.buy_sell !== (editingTrade.buy_sell || "") ||
        editForm.asset_class !== (editingTrade.asset_class || "Forex");

      // Preserve original values by default
      let rrRatio = editingTrade.risk_reward_ratio || "N/A";
      let pips = editingTrade.pips || 0;
      let profit = editingTrade.profit || 0;
      let outcome = editingTrade.outcome;

      // Only recalculate if financial fields changed
      if (financialFieldsChanged) {
        // Calculate R:R
        rrRatio = "N/A";
        if (entry && exit && stop) {
          const risk = Math.abs(entry - stop);
          const reward = Math.abs(exit - entry);
          if (risk > 0) {
            rrRatio = `1:${(reward / risk).toFixed(2)}`;
          }
        }

        // Calculate P&L
        pips = 0;
        profit = 0;
        if (entry && exit && tradeSize) {
          const assetClass = editForm.asset_class || "Forex";
          const priceDiff = editForm.buy_sell === "Sell" ? (entry - exit) : (exit - entry);
          
          switch(assetClass) {
            case "Forex":
              pips = priceDiff * 10000;
              profit = pips * tradeSize * 10 - tradeFees;
              break;
            case "Stocks":
              profit = priceDiff * tradeSize - tradeFees;
              break;
            case "Futures":
              profit = priceDiff * tradeSize - tradeFees;
              pips = priceDiff;
              break;
            case "Crypto":
              profit = priceDiff * tradeSize - tradeFees;
              pips = priceDiff;
              break;
          }
        }

        outcome = profit > 0 ? "Win" : profit < 0 ? "Loss" : "Break Even";
      }

      // Determine account type from selected account
      let accountType: string | null = null;
      if (editForm.account_id) {
        const selectedAccount = accounts.find(a => a.id === editForm.account_id);
        accountType = selectedAccount?.type || null;
      }

      const { error } = await supabase
        .from("trades")
        .update({
          symbol: editForm.symbol,
          pair: editForm.symbol,
          asset_class: editForm.asset_class,
          buy_sell: editForm.buy_sell,
          entry_price: entry || null,
          exit_price: exit || null,
          stop_loss: stop || null,
          size: tradeSize || null,
          fees: tradeFees || null,
          session: editForm.session || null,
          entry_timeframe: editForm.entry_timeframe || null,
          strategy_type: editForm.strategy_type || null,
          time_opened: editForm.time_opened || null,
          time_closed: editForm.time_closed || null,
          notes: editForm.notes || null,
          pips: parseFloat(pips.toFixed(2)),
          profit: parseFloat(profit.toFixed(2)),
          risk_reward_ratio: rrRatio,
          outcome: outcome,
          account_id: editForm.account_id || null,
          account_type: accountType || null,
        })
        .eq("id", editingTrade.id);

      if (error) throw error;

      toast.success("Trade updated successfully!");
      setEditingTrade(null);
      fetchTrades();
      onRefresh?.(); // Trigger stats refresh
    } catch (error: any) {
      toast.error(error.message || "Failed to update trade");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTrade = async () => {
    if (!tradeToDelete) return;

    try {
      const { error } = await supabase
        .from("trades")
        .delete()
        .eq("id", tradeToDelete);

      if (error) throw error;

      toast.success("Trade deleted successfully!");
      setDeleteDialogOpen(false);
      setTradeToDelete(null);
      fetchTrades(); // Refresh the calendar
      onRefresh?.(); // Trigger stats refresh
    } catch (error: any) {
      toast.error(error.message || "Failed to delete trade");
    }
  };

  const confirmDelete = (tradeId: string) => {
    setTradeToDelete(tradeId);
    setDeleteDialogOpen(true);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDaysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Filter out weekends (Saturday = 6, Sunday = 0)
  const daysInMonth = allDaysInMonth.filter(day => {
    const dayOfWeek = day.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude Sunday and Saturday
  });

  // Calculate week summaries for all Fridays in the month
  const getWeekSummary = (fridayDate: Date, weekNumber: number) => {
    const weekStart = startOfWeek(fridayDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(fridayDate, { weekStartsOn: 1 }); // Sunday
    
    const weekTrades = trades.filter(t => {
      const tradeDate = new Date(t.trade_date);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    });
    
    const weekPips = weekTrades.reduce((sum, t) => sum + (t.pips || 0), 0);
    const weekProfit = weekTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    
    // Count trading days (days with trades) in this week
    const weekDays = daysInMonth.filter(day => {
      return day >= weekStart && day <= weekEnd;
    });
    const tradingDays = weekDays.filter(day => {
      const dayTrades = trades.filter(t => isSameDay(new Date(t.trade_date), day));
      return dayTrades.length > 0;
    }).length;
    
    return {
      weekNumber,
      totalPips: weekPips,
      totalProfit: weekProfit,
      tradingDays,
      fridayDate
    };
  };

  // Pre-calculate week summaries for all Fridays
  const fridaysInMonth = daysInMonth.filter(day => day.getDay() === 5);
  const weekSummaries = new Map<string, ReturnType<typeof getWeekSummary>>();
  fridaysInMonth.forEach((friday, index) => {
    const summary = getWeekSummary(friday, index + 1);
    weekSummaries.set(friday.toISOString().split('T')[0], summary);
  });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="-mt-4">
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={previousMonth}
          className="hover:bg-primary/10 hover:border-primary/50 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-2xl font-bold min-w-[240px] text-center text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextMonth}
          className="hover:bg-primary/10 hover:border-primary/50 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-6 gap-3">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Week'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground/80 py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {(() => {
          const elements: JSX.Element[] = [];
          
          // Get all weeks that have at least one weekday in this month
          // A week is defined by its Monday's week number
          const getWeekKey = (date: Date) => {
            // Get the Monday of this date's week
            const dayOfWeek = date.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(date);
            monday.setDate(date.getDate() + mondayOffset);
            return monday.toISOString().split('T')[0];
          };
          
          // Group weekdays by their week (using Monday as the key)
          const weekMap = new Map<string, Date[]>();
          daysInMonth.forEach((day) => {
            const weekKey = getWeekKey(day);
            if (!weekMap.has(weekKey)) {
              weekMap.set(weekKey, []);
            }
            weekMap.get(weekKey)!.push(day);
          });
          
          // Sort weeks chronologically
          const sortedWeeks = Array.from(weekMap.entries()).sort(([a], [b]) => a.localeCompare(b));
          
          sortedWeeks.forEach(([weekKey, weekDays], rowIndex) => {
            // Render exactly 6 cells for each week row: Mon, Tue, Wed, Thu, Fri, Week
            for (let col = 1; col <= 5; col++) {
              const day = weekDays.find(d => d.getDay() === col);
              
              if (day) {
                const dayStats = getDayStats(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());
                const hasTrades = dayStats.trades.length > 0;
                const displayValue = viewMode === 'pips' ? dayStats.totalPips : dayStats.totalProfit;
                
                // Enhanced styling based on outcome
                let dayClass = 'border-border/30 bg-card/50';
                if (hasTrades) {
                  if (dayStats.outcome === 'profit') {
                    dayClass = 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 shadow-md shadow-emerald-500/10';
                  } else if (dayStats.outcome === 'loss') {
                    dayClass = 'border-rose-500/50 bg-gradient-to-br from-rose-500/15 to-rose-600/5 shadow-md shadow-rose-500/10';
                  } else {
                    dayClass = 'border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md shadow-primary/5';
                  }
                }
                
                if (isSelected) {
                  dayClass = 'border-primary bg-primary/20 shadow-lg shadow-primary/20 ring-2 ring-primary/30';
                }
                
                elements.push(
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day, dayStats)}
                    className={`min-h-[100px] p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/60 ${dayClass} ${
                      isToday && !hasTrades ? 'ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'd')}
                      {isToday && <span className="ml-1 text-xs">•</span>}
                    </div>
                    {hasTrades && (
                      <div className="space-y-1.5">
                        <div className={`text-xl font-bold ${
                          dayStats.outcome === 'profit' ? 'text-emerald-500' :
                          dayStats.outcome === 'loss' ? 'text-rose-500' :
                          'text-foreground'
                        }`}>
                          {displayValue >= 0 ? '+' : ''}{displayValue.toFixed(viewMode === 'pips' ? 1 : 2)}
                          {viewMode === 'profit' && '$'}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground/80 font-medium">
                            {dayStats.trades.length} trade{dayStats.trades.length !== 1 ? 's' : ''}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            dayStats.outcome === 'profit' 
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : dayStats.outcome === 'loss'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {Math.round((dayStats.trades.filter(t => t.outcome === 'Win').length / dayStats.trades.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              } else {
                // Empty cell for days outside this month in this week
                elements.push(<div key={`empty-${weekKey}-col-${col}`} className="min-h-[100px]" />);
              }
            }
            
            // Column 6: Week summary
            const friday = weekDays.find(d => d.getDay() === 5);
            if (friday) {
              const fridayKey = friday.toISOString().split('T')[0];
              const weekSummary = weekSummaries.get(fridayKey);
              if (weekSummary) {
                const weekValue = viewMode === 'pips' ? weekSummary.totalPips : weekSummary.totalProfit;
                const weekOutcome = weekValue > 0 ? 'profit' : weekValue < 0 ? 'loss' : 'neutral';
                
                elements.push(
                  <div
                    key={`week-${fridayKey}`}
                    className={`min-h-[100px] p-3 rounded-xl border-2 border-border/30 bg-card/50`}
                  >
                    <div className="text-sm font-semibold mb-2 text-muted-foreground">
                      Week {weekSummary.weekNumber}
                    </div>
                    <div className="space-y-2">
                      <div className={`text-xl font-bold ${
                        weekOutcome === 'profit' ? 'text-emerald-500' :
                        weekOutcome === 'loss' ? 'text-rose-500' :
                        'text-foreground'
                      }`}>
                        {weekValue >= 0 ? '+' : ''}{weekValue.toFixed(viewMode === 'pips' ? 1 : 2)}
                        {viewMode === 'profit' && '$'}
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                          {weekSummary.tradingDays} day{weekSummary.tradingDays !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Empty week cell if no summary
                elements.push(<div key={`week-empty-${fridayKey}`} className="min-h-[100px]" />);
              }
            } else {
              // No Friday in this week, add empty cell to maintain grid alignment
              elements.push(<div key={`week-empty-${weekKey}`} className="min-h-[100px]" />);
            }
          });
          
          return elements;
        })()}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-gradient-to-b from-card to-background">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                    <Zap className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {selectedDay && format(selectedDay, 'MMMM d, yyyy')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDay && getDayStats(selectedDay).trades.length} trade{selectedDay && getDayStats(selectedDay).trades.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-right px-4 py-2 rounded-lg ${
                    selectedDay && getDayStats(selectedDay).outcome === 'profit'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : selectedDay && getDayStats(selectedDay).outcome === 'loss'
                      ? 'bg-rose-500/20 text-rose-500'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    <p className="text-xs text-muted-foreground/80 mb-0.5">Total {viewMode === 'pips' ? 'Pips' : 'P&L'}</p>
                    <p className="text-2xl font-bold">
                      {selectedDay && viewMode === 'pips' 
                        ? `${getDayStats(selectedDay).totalPips >= 0 ? '+' : ''}${getDayStats(selectedDay).totalPips.toFixed(1)}`
                        : `$${getDayStats(selectedDay).totalProfit >= 0 ? '+' : ''}${getDayStats(selectedDay).totalProfit.toFixed(2)}`
                      }
                    </p>
                  </div>
                  {selectedDay && onDaySelect && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setReviewDialogOpen(true)}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Review Day
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDetailsDialog(false);
                          onDaySelect(selectedDay);
                        }}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        <Plus className="h-4 w-4" />
                        Log Trade
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="space-y-3 max-h-[65vh] overflow-y-auto pt-4">
              {selectedDay && [...getDayStats(selectedDay).trades].sort((a, b) => {
                // Sort by time_opened ascending (earliest first)
                if (a.time_opened && b.time_opened) {
                  return a.time_opened.localeCompare(b.time_opened);
                }
                if (a.time_opened && !b.time_opened) return -1;
                if (!a.time_opened && b.time_opened) return 1;
                return 0;
              }).map((trade) => {
                const isWin = trade.outcome === 'Win';
                const isLoss = trade.outcome === 'Loss';
                const asset = ASSET_CLASSES.find(ac => ac.value === (trade.asset_class || "Forex"));
                const IconComponent = asset && !asset.isString ? asset.icon : null;

                return editingTrade?.id === trade.id ? (
                  // Edit Mode
                  <div key={trade.id} className="p-5 rounded-xl border-2 border-primary/30 bg-card/50 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Edit Trade</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTrade(null)}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveTrade}
                          disabled={isSaving}
                          className="gap-2 bg-gradient-to-r from-primary to-accent"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Symbol</Label>
                        <Input
                          value={editForm.symbol}
                          onChange={(e) => setEditForm({...editForm, symbol: e.target.value.toUpperCase()})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Asset Class</Label>
                        <Select value={editForm.asset_class} onValueChange={(v) => setEditForm({...editForm, asset_class: v})}>
                          <SelectTrigger className="bg-secondary/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_CLASSES.map(ac => (
                              <SelectItem key={ac.value} value={ac.value}>{ac.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Direction</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            type="button"
                            variant={editForm.buy_sell === "Buy" ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, buy_sell: "Buy"})}
                            className={editForm.buy_sell === "Buy" ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Buy
                          </Button>
                          <Button
                            type="button"
                            variant={editForm.buy_sell === "Sell" ? "default" : "outline"}
                            onClick={() => setEditForm({...editForm, buy_sell: "Sell"})}
                            className={editForm.buy_sell === "Sell" ? "bg-rose-500 hover:bg-rose-600" : ""}
                          >
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                            Sell
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Entry Price</Label>
                        <Input
                          type="number"
                          step="any"
                          value={editForm.entry_price}
                          onChange={(e) => setEditForm({...editForm, entry_price: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Exit Price</Label>
                        <Input
                          type="number"
                          step="any"
                          value={editForm.exit_price}
                          onChange={(e) => setEditForm({...editForm, exit_price: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Stop Loss</Label>
                        <Input
                          type="number"
                          step="any"
                          value={editForm.stop_loss}
                          onChange={(e) => setEditForm({...editForm, stop_loss: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Size</Label>
                        <Input
                          type="number"
                          step="any"
                          value={editForm.size}
                          onChange={(e) => setEditForm({...editForm, size: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Fees</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editForm.fees}
                          onChange={(e) => setEditForm({...editForm, fees: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Session</Label>
                        <Select value={editForm.session} onValueChange={(v) => setEditForm({...editForm, session: v})}>
                          <SelectTrigger className="bg-secondary/50">
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
                        <Select value={editForm.entry_timeframe} onValueChange={(v) => setEditForm({...editForm, entry_timeframe: v})}>
                          <SelectTrigger className="bg-secondary/50">
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
                          value={editForm.strategy_type}
                          onChange={(e) => setEditForm({...editForm, strategy_type: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Time Opened</Label>
                        <Input
                          type="time"
                          value={editForm.time_opened}
                          onChange={(e) => setEditForm({...editForm, time_opened: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                      <div>
                        <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Time Closed</Label>
                        <Input
                          type="time"
                          value={editForm.time_closed}
                          onChange={(e) => setEditForm({...editForm, time_closed: e.target.value})}
                          className="bg-secondary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Account</Label>
                      <Select 
                        value={editForm.account_id || "none"} 
                        onValueChange={(value) => setEditForm({...editForm, account_id: value === "none" ? "" : value})}
                      >
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Account</SelectItem>
                          {accounts
                            .filter(account => account.type === 'personal' || account.type === 'funded')
                            .map((account) => (
                              <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                            ))}
                          {accounts.filter(account => account.type === 'evaluation' || account.type === 'backtesting').length > 0 && (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Evaluations & Backtests</div>
                              {accounts
                                .filter(account => account.type === 'evaluation' || account.type === 'backtesting')
                                .map((account) => (
                                  <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                                ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Notes</Label>
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        rows={3}
                        className="bg-secondary/50 resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode - Cleaner Design
                  <div
                    key={trade.id}
                    className={`group rounded-xl border transition-all hover:shadow-lg ${
                      isWin
                        ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/2 hover:border-emerald-500/40'
                        : isLoss
                        ? 'border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-rose-600/2 hover:border-rose-500/40'
                        : 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/2 hover:border-primary/40'
                    }`}
                  >
                    {/* Header Section */}
                    <div className="p-4 border-b border-border/30">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isWin ? 'bg-emerald-500/20' :
                            isLoss ? 'bg-rose-500/20' :
                            'bg-primary/20'
                          }`}>
                            {IconComponent ? (
                              <IconComponent className={`h-5 w-5 ${
                                isWin ? 'text-emerald-500' :
                                isLoss ? 'text-rose-500' :
                                'text-primary'
                              }`} />
                            ) : (
                              <span className="text-xl">{asset?.iconString}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold truncate">{trade.symbol || trade.pair}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                trade.buy_sell === "Buy" 
                                  ? 'bg-emerald-500/20 text-emerald-500' 
                                  : 'bg-rose-500/20 text-rose-500'
                              }`}>
                                {trade.buy_sell}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {trade.asset_class || 'Forex'} • {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                            isWin ? 'bg-emerald-500/20 text-emerald-500' :
                            isLoss ? 'bg-rose-500/20 text-rose-500' :
                            'bg-primary/20 text-primary'
                          }`}>
                            {trade.outcome}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTradeForChart(trade);
                              setChartDialogOpen(true);
                            }}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                            title="View Chart"
                          >
                            <LineChart className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMoveAccount(trade)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                            title="Move to Account"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTrade(trade)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(trade.id)}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-card/50">
                          <p className="text-xs text-muted-foreground mb-1">P&L</p>
                          <p className={`text-xl font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>
                            ${trade.profit?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        {(trade.asset_class === "Forex" || trade.asset_class === "Futures") && (
                          <div className="text-center p-3 rounded-lg bg-card/50">
                            <p className="text-xs text-muted-foreground mb-1">{trade.asset_class === "Forex" ? "Pips" : "Ticks"}</p>
                            <p className={`text-xl font-bold ${isWin ? 'text-emerald-500' : isLoss ? 'text-rose-500' : 'text-foreground'}`}>
                              {trade.pips ? (trade.pips >= 0 ? '+' : '') + trade.pips.toFixed(1) : 'N/A'}
                            </p>
                          </div>
                        )}
                        <div className="text-center p-3 rounded-lg bg-card/50">
                          <p className="text-xs text-muted-foreground mb-1">R:R</p>
                          <p className="text-xl font-bold">{calculateRiskReward(trade)}</p>
                        </div>
                      </div>

                      {/* Details Grid - Only show if there's data */}
                      {(trade.entry_price || trade.exit_price || trade.stop_loss || trade.size || trade.session || trade.entry_timeframe || trade.strategy_type || trade.time_opened || trade.time_closed || trade.fees) && (
                        <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-border/30">
                          {trade.entry_price && (
                            <div>
                              <span className="text-muted-foreground text-xs">Entry</span>
                              <p className="font-semibold">${trade.entry_price.toFixed(4)}</p>
                            </div>
                          )}
                          {trade.exit_price && (
                            <div>
                              <span className="text-muted-foreground text-xs">Exit</span>
                              <p className="font-semibold">${trade.exit_price.toFixed(4)}</p>
                            </div>
                          )}
                          {trade.stop_loss && (
                            <div>
                              <span className="text-muted-foreground text-xs">Stop Loss</span>
                              <p className="font-semibold">${trade.stop_loss.toFixed(4)}</p>
                            </div>
                          )}
                          {trade.size && (
                            <div>
                              <span className="text-muted-foreground text-xs">Size</span>
                              <p className="font-semibold">{trade.size.toFixed(2)}</p>
                            </div>
                          )}
                          {trade.session && (
                            <div>
                              <span className="text-muted-foreground text-xs">Session</span>
                              <p className="font-semibold">{trade.session}</p>
                            </div>
                          )}
                          {trade.entry_timeframe && (
                            <div>
                              <span className="text-muted-foreground text-xs">Timeframe</span>
                              <p className="font-semibold">{trade.entry_timeframe}</p>
                            </div>
                          )}
                          {trade.strategy_type && (
                            <div>
                              <span className="text-muted-foreground text-xs">Strategy</span>
                              <p className="font-semibold">{trade.strategy_type}</p>
                            </div>
                          )}
                          {(trade.time_opened || trade.time_closed) && (
                            <div>
                              <span className="text-muted-foreground text-xs">Time</span>
                              <p className="font-semibold">
                                {trade.time_opened && trade.time_closed 
                                  ? `${trade.time_opened} - ${trade.time_closed}`
                                  : trade.time_opened || trade.time_closed || 'N/A'
                                }
                              </p>
                            </div>
                          )}
                          {trade.fees && (
                            <div>
                              <span className="text-muted-foreground text-xs">Fees</span>
                              <p className="font-semibold">${trade.fees.toFixed(2)}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {trade.notes && (
                        <div className="mt-3 pt-3 border-t border-border/30">
                          <p className="text-xs text-muted-foreground mb-1.5">Notes</p>
                          <p className="text-sm leading-relaxed">{trade.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trade</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrade}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={moveAccountDialogOpen} onOpenChange={setMoveAccountDialogOpen}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold mb-2">Move Trade to Account</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the account you want to move this trade to.
              </p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Account</Label>
              <Select 
                value={selectedMoveAccountId || "none"} 
                onValueChange={(value) => setSelectedMoveAccountId(value === "none" ? "" : value)}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Account</SelectItem>
                  {accounts
                    .filter(account => account.type === 'personal' || account.type === 'funded')
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                    ))}
                  {accounts.filter(account => account.type === 'evaluation' || account.type === 'backtesting').length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Evaluations & Backtests</div>
                      {accounts
                        .filter(account => account.type === 'evaluation' || account.type === 'backtesting')
                        .map((account) => (
                          <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                        ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMoveAccountDialogOpen(false);
                  setTradeToMove(null);
                  setSelectedMoveAccountId("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMoveAccount}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {isSaving ? 'Moving...' : 'Move Trade'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Trade Chart Dialog */}
      <TradeChartDialog
        open={chartDialogOpen}
        onOpenChange={setChartDialogOpen}
        trade={tradeForChart}
      />

      {/* Daily Review Dialog */}
      {selectedDay && (
        <DailyReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          date={selectedDay}
          trades={[...getDayStats(selectedDay).trades].sort((a, b) => {
            if (a.time_opened && b.time_opened) return a.time_opened.localeCompare(b.time_opened);
            if (a.time_opened && !b.time_opened) return -1;
            if (!a.time_opened && b.time_opened) return 1;
            return 0;
          })}
          totalPL={getDayStats(selectedDay).totalProfit}
        />
      )}
    </div>
  );
};
