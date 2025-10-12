import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Trade {
  id: string;
  trade_date: string;
  pips: number | null;
  outcome: string;
  pair: string;
}

interface DayStats {
  date: Date;
  trades: Trade[];
  totalPips: number;
  outcome: 'profit' | 'loss' | 'neutral';
}

export const TradingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    fetchTrades();
  }, [currentMonth]);

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
    
    let outcome: 'profit' | 'loss' | 'neutral' = 'neutral';
    if (totalPips > 0) outcome = 'profit';
    else if (totalPips < 0) outcome = 'loss';
    
    return { date, trades: dayTrades, totalPips, outcome };
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
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={previousMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-xl font-semibold min-w-[200px] text-center">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[100px]" />
        ))}
        
        {daysInMonth.map(day => {
          const dayStats = getDayStats(day);
          const hasTradesClass = dayStats.trades.length > 0
            ? dayStats.outcome === 'profit'
              ? 'border-success/50 bg-success/10 shadow-success'
              : dayStats.outcome === 'loss'
              ? 'border-destructive/50 bg-destructive/10 shadow-danger'
              : 'border-primary/50 bg-primary/5'
            : '';
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-3 rounded-lg border border-border ${hasTradesClass} transition-all hover:shadow-lg hover:scale-[1.02]`}
            >
              <div className="text-sm font-medium text-muted-foreground mb-2">
                {format(day, 'd')}
              </div>
              {dayStats.trades.length > 0 && (
                <div className="space-y-1">
                  <div className={`text-lg font-bold ${
                    dayStats.outcome === 'profit' ? 'text-success' :
                    dayStats.outcome === 'loss' ? 'text-destructive' :
                    'text-foreground'
                  }`}>
                    {dayStats.totalPips >= 0 ? '+' : ''}{dayStats.totalPips.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dayStats.trades.length} trade{dayStats.trades.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs opacity-70">
                    {Math.round((dayStats.trades.filter(t => t.outcome === 'Win').length / dayStats.trades.length) * 100)}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
