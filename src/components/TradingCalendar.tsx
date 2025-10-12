import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

interface Trade {
  id: string;
  trade_date: string;
  pips: number;
  outcome: string;
}

interface DayData {
  date: Date;
  trades: Trade[];
  totalPips: number;
  winRate: number;
}

export const TradingCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayData, setDayData] = useState<Map<string, DayData>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades();
  }, [currentMonth]);

  const fetchTrades = async () => {
    setLoading(true);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .gte("trade_date", format(start, "yyyy-MM-dd"))
      .lte("trade_date", format(end, "yyyy-MM-dd"))
      .order("trade_date", { ascending: true });

    if (error) {
      console.error("Error fetching trades:", error);
      setLoading(false);
      return;
    }

    const tradesByDay = new Map<string, DayData>();
    const daysInMonth = eachDayOfInterval({ start, end });

    daysInMonth.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      const dayTrades = data?.filter((t) => t.trade_date === dateKey) || [];
      const totalPips = dayTrades.reduce((sum, t) => sum + (t.pips || 0), 0);
      const wins = dayTrades.filter((t) => t.outcome === "Win").length;
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;

      tradesByDay.set(dateKey, {
        date: day,
        trades: dayTrades,
        totalPips,
        winRate,
      });
    });

    setDayData(tradesByDay);
    setLoading(false);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const getDayColor = (totalPips: number, tradesCount: number) => {
    if (tradesCount === 0) return "bg-card border-border";
    if (totalPips > 0) return "bg-success/10 border-success/30";
    if (totalPips < 0) return "bg-destructive/10 border-destructive/30";
    return "bg-primary/10 border-primary/30";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          ←
        </button>
        <h2 className="text-2xl font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {calendarDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const data = dayData.get(dateKey);
          const tradesCount = data?.trades.length || 0;
          const totalPips = data?.totalPips || 0;
          const winRate = data?.winRate || 0;

          return (
            <div
              key={dateKey}
              className={`aspect-square border rounded-lg p-2 transition-all hover:shadow-lg ${getDayColor(
                totalPips,
                tradesCount
              )}`}
            >
              <div className="flex flex-col h-full">
                <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                {tradesCount > 0 && (
                  <div className="flex-1 flex flex-col justify-center items-center text-xs">
                    <div className={`text-lg font-bold ${totalPips > 0 ? "text-success" : totalPips < 0 ? "text-destructive" : "text-primary"}`}>
                      {totalPips > 0 ? "+" : ""}{totalPips.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">
                      {tradesCount} trade{tradesCount !== 1 ? "s" : ""}
                    </div>
                    <div className="text-muted-foreground">
                      {winRate.toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
