import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface Trade {
  id: string;
  trade_date: string;
  pips: number | null;
  profit: number | null;
  outcome: string;
  pair: string;
  buy_sell: string;
  risk_to_pay: number | null;
  total_pips_secured: number | null;
  notes: string | null;
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
}

export const TradingCalendar = ({ onDaySelect, viewMode, refreshTrigger }: TradingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTrades();
  }, [currentMonth, refreshTrigger]);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("trade_date", monthStart.toISOString().split('T')[0])
      .lte("trade_date", monthEnd.toISOString().split('T')[0])
      .order("trade_date", { ascending: true });

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
    if (!trade.risk_to_pay || !trade.total_pips_secured) return 'N/A';
    const reward = trade.total_pips_secured;
    const risk = trade.risk_to_pay;
    return `1:${(reward / risk).toFixed(2)}`;
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
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-4 mb-8">
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

      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground/80 py-3 uppercase tracking-wider">
            {day}
          </div>
        ))}
        
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[120px]" />
        ))}
        
        {daysInMonth.map(day => {
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
          
          return (
            <div
              key={day.toISOString()}
              onClick={() => handleDayClick(day, dayStats)}
              className={`min-h-[120px] p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-primary/60 ${dayClass} ${
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
        })}
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Trades for {selectedDay && format(selectedDay, 'MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedDay && getDayStats(selectedDay).trades.map((trade) => (
              <div key={trade.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{trade.pair}</h4>
                    <p className="text-sm text-muted-foreground">{trade.buy_sell}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xl font-bold ${
                      trade.outcome === 'Win' ? 'text-success' : 'text-destructive'
                    }`}>
                      {trade.outcome}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(trade.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pips: </span>
                    <span className="font-semibold">{trade.pips?.toFixed(1) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profit: </span>
                    <span className="font-semibold">${trade.profit?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">R:R Ratio: </span>
                    <span className="font-semibold">{calculateRiskReward(trade)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk to Pay: </span>
                    <span className="font-semibold">{trade.risk_to_pay?.toFixed(2) || 'N/A'}</span>
                  </div>
                </div>
                {trade.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes: </span>
                    <p className="mt-1">{trade.notes}</p>
                  </div>
                )}
              </div>
            ))}
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
    </div>
  );
};
