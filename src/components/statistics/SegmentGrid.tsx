import { Card } from "@/components/ui/card";
import { Trade, formatCurrency } from "@/lib/statisticsUtils";
import { useMemo } from "react";

interface Props {
  trades: Trade[];
  isPips: boolean;
  category: 'session' | 'entry_timeframe';
  icon: React.ElementType;
}

interface StatSummary {
  name: string;
  wins: number;
  losses: number;
  breakeven: number;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
}

export const SegmentGrid = ({ trades, isPips, category, icon: Icon }: Props) => {
  const viewMode = isPips ? 'pips' as const : 'profit' as const;

  const segments = useMemo(() => {
    const map = new Map<string, Trade[]>();
    trades.forEach(t => {
      const key = t[category] || 'Unknown';
      (map.get(key) || (() => { const a: Trade[] = []; map.set(key, a); return a; })()).push(t);
    });
    return Array.from(map.entries()).map(([name, tr]): StatSummary => {
      const wins = tr.filter(t => t.outcome === "Win").length;
      const losses = tr.filter(t => t.outcome === "Loss").length;
      const breakeven = tr.filter(t => t.outcome === "Break Even").length;
      const totalProfit = tr.reduce((s, t) => s + (isPips ? (t.pips || 0) : (t.profit || 0)), 0);
      return { name, wins, losses, breakeven, totalTrades: tr.length, winRate: tr.length > 0 ? (wins / tr.length) * 100 : 0, totalProfit };
    });
  }, [trades, category, viewMode]);

  const fmt = (v: number) => formatCurrency(v, isPips);

  if (segments.length === 0) return <p className="text-sm text-muted-foreground">No data available.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {segments.map(s => (
        <Card key={s.name} className="p-4 bg-card border-border/50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">{s.name}</h4>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">Win Rate</span>
              <span className="font-bold text-sm">{s.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">{isPips ? 'Pips' : 'P&L'}</span>
              <span className={`font-bold text-sm ${s.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(s.totalProfit)}</span>
            </div>
            <div className="flex justify-between text-[10px] pt-1 border-t border-border/30">
              <span className="text-success">{s.wins}W</span>
              <span className="text-muted-foreground">{s.breakeven}BE</span>
              <span className="text-destructive">{s.losses}L</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{s.totalTrades} trades</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
