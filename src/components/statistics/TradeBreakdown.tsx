import { Card } from "@/components/ui/card";
import { FullStats, formatCurrency, formatHoldTime } from "@/lib/statisticsUtils";

interface Props {
  stats: FullStats;
  isPips: boolean;
}

const MiniCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) => (
  <Card className="p-3 bg-card border-border/40">
    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</p>
    <p className={`text-sm font-bold ${color || ''}`}>{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </Card>
);

export const TradeBreakdown = ({ stats, isPips }: Props) => {
  const fmt = (v: number) => formatCurrency(v, isPips);
  const pct = (n: number) => stats.totalTrades > 0 ? `${((n / stats.totalTrades) * 100).toFixed(1)}%` : '0%';

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Trade Breakdown</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MiniCard label="Avg Daily Gain/Loss" value={fmt(stats.avgDailyGain)} color={stats.avgDailyGain >= 0 ? 'text-success' : 'text-destructive'} />
        <MiniCard label="Avg Winning Trade" value={fmt(stats.avgWinningTrade)} color="text-success" />
        <MiniCard label="Avg Losing Trade" value={stats.avgLosingTrade !== 0 ? fmt(stats.avgLosingTrade) : '$0.00'} color="text-destructive" />
        <MiniCard label="Avg Per-share Gain" value={stats.avgDailyVolume > 0 && stats.totalTrades > 0 ? fmt(stats.totalProfit / stats.totalTrades) : 'N/A'} />
        <MiniCard label="Winning Trades" value={String(stats.wins)} sub={pct(stats.wins)} color="text-success" />
        <MiniCard label="Losing Trades" value={String(stats.losses)} sub={pct(stats.losses)} color="text-destructive" />
        <MiniCard label="Scratch Trades" value={String(stats.breakeven)} sub={pct(stats.breakeven)} />
        <MiniCard label="Avg Hold Time (All)" value={formatHoldTime(stats.avgHoldTimeAll)} />
        <MiniCard label="Hold Time (Winners)" value={formatHoldTime(stats.avgHoldTimeWins)} color="text-success" />
        <MiniCard label="Hold Time (Losers)" value={formatHoldTime(stats.avgHoldTimeLosses)} color="text-destructive" />
        <MiniCard label="Avg Daily Volume" value={stats.avgDailyVolume.toFixed(1)} sub="trades/day" />
        <MiniCard label="Total Fees" value={`$${Math.abs(stats.totalFees).toFixed(2)}`} />
      </div>
    </section>
  );
};
