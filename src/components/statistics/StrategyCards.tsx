import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, Target } from "lucide-react";
import { Trade, calculateFullStats, formatCurrency, formatHoldTime } from "@/lib/statisticsUtils";

interface Props {
  trades: Trade[];
  isPips: boolean;
}

export const StrategyCards = ({ trades, isPips }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const viewMode = isPips ? 'pips' as const : 'profit' as const;

  const strategies = useMemo(() => {
    const map = new Map<string, Trade[]>();
    trades.forEach(t => {
      const key = t.strategy_type || 'Unknown';
      (map.get(key) || (() => { const a: Trade[] = []; map.set(key, a); return a; })()).push(t);
    });
    return Array.from(map.entries()).map(([name, tr]) => ({
      name,
      trades: tr,
      stats: calculateFullStats(tr, viewMode),
    }));
  }, [trades, viewMode]);

  const fmt = (v: number) => formatCurrency(v, isPips);

  if (strategies.length === 0) {
    return <p className="text-sm text-muted-foreground">No strategy data available.</p>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-3">
      {strategies.map(({ name, stats }) => {
        const isOpen = expanded === name;
        return (
          <div key={name} className={`${isOpen ? 'md:col-span-3' : ''}`}>
            <Card
              className={`p-4 bg-card border-border/50 cursor-pointer transition-all hover:border-border ${isOpen ? 'ring-1 ring-primary/30 bg-primary/[0.02]' : ''}`}
              onClick={() => setExpanded(isOpen ? null : name)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">{name}</h4>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Win Rate</span>
                  <p className="font-bold text-sm">{stats.winRate.toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">{isPips ? 'Pips' : 'P&L'}</span>
                  <p className={`font-bold text-sm ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(stats.totalProfit)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Trades</span>
                  <p className="font-bold text-sm">{stats.totalTrades}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">W/L</span>
                  <p className="font-bold text-sm"><span className="text-success">{stats.wins}</span>/<span className="text-destructive">{stats.losses}</span></p>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Setup Metrics</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {[
                      { l: 'Avg Winner', v: fmt(stats.avgWinningTrade), c: 'text-success' },
                      { l: 'Avg Loser', v: fmt(stats.avgLosingTrade), c: 'text-destructive' },
                      { l: 'Largest Win', v: fmt(stats.largestWin), c: 'text-success' },
                      { l: 'Largest Loss', v: stats.largestLoss !== 0 ? fmt(stats.largestLoss) : '$0.00', c: 'text-destructive' },
                      { l: 'Max Consec. Wins', v: String(stats.maxConsecutiveWins), c: 'text-success' },
                      { l: 'Max Consec. Losses', v: String(stats.maxConsecutiveLosses), c: 'text-destructive' },
                      { l: 'Hold Time (Winners)', v: formatHoldTime(stats.avgHoldTimeWins) },
                      { l: 'Hold Time (Losers)', v: formatHoldTime(stats.avgHoldTimeLosses) },
                      { l: 'Profit Factor', v: stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2), c: stats.profitFactor >= 1 ? 'text-success' : 'text-destructive' },
                      { l: 'Avg P&L/Trade', v: fmt(stats.avgProfit), c: stats.avgProfit >= 0 ? 'text-success' : 'text-destructive' },
                    ].map(({ l, v, c }) => (
                      <div key={l} className="p-2 bg-muted/20 rounded">
                        <span className="text-muted-foreground">{l}</span>
                        <p className={`font-bold ${c || ''}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );
      })}
    </div>
  );
};
