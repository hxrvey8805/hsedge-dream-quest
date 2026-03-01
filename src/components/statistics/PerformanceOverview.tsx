import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { FullStats, formatCurrency, formatHoldTime } from "@/lib/statisticsUtils";

interface Props {
  stats: FullStats;
  isPips: boolean;
  netPL: number;
  accountPL: number;
}

const KPICard = ({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) => (
  <Card className="p-4 bg-card border-border/50 hover:border-border transition-colors">
    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-xl font-bold tracking-tight ${color || ''}`}>{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </Card>
);

export const PerformanceOverview = ({ stats, isPips, netPL, accountPL }: Props) => {
  const fmt = (v: number) => formatCurrency(v, isPips);

  return (
    <TooltipProvider>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Performance Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card className="p-4 bg-card border-border/50 col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{isPips ? 'Net Pips' : 'Net P&L'}</p>
              {!isPips && accountPL !== 0 && (
                <Tooltip>
                  <TooltipTrigger><Info className="w-3 h-3 text-muted-foreground/50" /></TooltipTrigger>
                  <TooltipContent className="max-w-[200px]"><p className="text-xs">Includes account running P&L (${accountPL.toFixed(2)}) + trade profits.</p></TooltipContent>
                </Tooltip>
              )}
            </div>
            <p className={`text-2xl font-black tracking-tight ${netPL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {fmt(netPL)}
            </p>
          </Card>

          <KPICard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.wins}W / ${stats.losses}L / ${stats.breakeven}BE`} />
          <KPICard label="Total Trades" value={stats.totalTrades.toLocaleString()} />
          <KPICard
            label="Profit Factor"
            value={stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
            color={stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'}
          />
          <KPICard label={isPips ? 'Avg Pips/Trade' : 'Avg Trade P&L'} value={fmt(stats.avgProfit)} color={stats.avgProfit >= 0 ? 'text-success' : 'text-destructive'} />
          <KPICard label="Largest Win" value={fmt(stats.largestWin)} color="text-success" />
          <KPICard label="Largest Loss" value={stats.largestLoss !== 0 ? fmt(stats.largestLoss) : '$0.00'} color="text-destructive" />
          <KPICard label="Max Consec. Wins" value={String(stats.maxConsecutiveWins)} color="text-success" />
          <KPICard label="Max Consec. Losses" value={String(stats.maxConsecutiveLosses)} color="text-destructive" />
        </div>
      </section>
    </TooltipProvider>
  );
};
