import { format } from "date-fns";
import { CalendarDays, TrendingUp, TrendingDown } from "lucide-react";

interface DaySummarySlideProps {
  date: Date;
  totalPL: number;
  tradesCount: number;
}

export const DaySummarySlide = ({ date, totalPL, tradesCount }: DaySummarySlideProps) => {
  const isProfit = totalPL >= 0;
  
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-8">
      {/* Date */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <CalendarDays className="w-6 h-6" />
        <span className="text-xl">{format(date, 'EEEE, MMMM d, yyyy')}</span>
      </div>

      {/* Main P&L Display */}
      <div className="space-y-4">
        <div className="text-6xl font-bold flex items-center justify-center gap-3">
          {isProfit ? (
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          ) : (
            <TrendingDown className="w-16 h-16 text-destructive" />
          )}
          <span className={isProfit ? 'text-emerald-500' : 'text-destructive'}>
            {isProfit ? '+' : ''}{totalPL.toFixed(2)}
          </span>
        </div>
        <p className="text-2xl text-muted-foreground">
          {isProfit ? 'Profit' : 'Loss'} Today
        </p>
      </div>

      {/* Trades Count */}
      <div className="bg-card border rounded-xl p-6 min-w-[200px]">
        <div className="text-4xl font-bold text-primary">{tradesCount}</div>
        <div className="text-muted-foreground">
          {tradesCount === 1 ? 'Trade' : 'Trades'} Taken
        </div>
      </div>
    </div>
  );
};
