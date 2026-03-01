import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown, Target, Trophy } from "lucide-react";
import { Trade, calculateFullStats, formatCurrency, formatHoldTime } from "@/lib/statisticsUtils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Props {
  trades: Trade[];
  isPips: boolean;
}

interface SetupInfo {
  id: string;
  name: string;
}

interface SetupStats {
  name: string;
  trades: Trade[];
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  avgWinner: number;
  avgLoser: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgHoldTimeWins: number | null;
  avgHoldTimeLosses: number | null;
}

export const StrategyCards = ({ trades, isPips }: Props) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedSetup, setExpandedSetup] = useState<string | null>(null);
  const viewMode = isPips ? 'pips' as const : 'profit' as const;

  // Fetch playbook setups for name resolution
  const { data: setups = [] } = useQuery({
    queryKey: ['playbook-setups-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('playbook_setups').select('id, name').eq('user_id', user.id);
      return (data || []) as SetupInfo[];
    },
  });

  const setupNameMap = useMemo(() => {
    const m = new Map<string, string>();
    setups.forEach(s => m.set(s.id, s.name));
    return m;
  }, [setups]);

  const strategies = useMemo(() => {
    const map = new Map<string, Trade[]>();
    trades.forEach(t => {
      const key = t.strategy_type || 'Unknown';
      (map.get(key) || (() => { const a: Trade[] = []; map.set(key, a); return a; })()).push(t);
    });
    return Array.from(map.entries()).map(([name, tr]) => {
      const stats = calculateFullStats(tr, viewMode);
      // Group by setup_id
      const setupMap = new Map<string, Trade[]>();
      tr.forEach(t => {
        const key = t.setup_id || '__none__';
        (setupMap.get(key) || (() => { const a: Trade[] = []; setupMap.set(key, a); return a; })()).push(t);
      });
      const setupStats: SetupStats[] = Array.from(setupMap.entries()).map(([setupId, setupTrades]) => {
        const s = calculateFullStats(setupTrades, viewMode);
        return {
          name: setupId === '__none__' ? 'No Setup' : (setupNameMap.get(setupId) || setupId.slice(0, 8)),
          trades: setupTrades,
          totalTrades: s.totalTrades,
          wins: s.wins,
          losses: s.losses,
          winRate: s.winRate,
          profitFactor: s.profitFactor,
          totalProfit: s.totalProfit,
          avgWinner: s.avgWinningTrade,
          avgLoser: s.avgLosingTrade,
          largestWin: s.largestWin,
          largestLoss: s.largestLoss,
          maxConsecutiveWins: s.maxConsecutiveWins,
          maxConsecutiveLosses: s.maxConsecutiveLosses,
          avgHoldTimeWins: s.avgHoldTimeWins,
          avgHoldTimeLosses: s.avgHoldTimeLosses,
        };
      }).sort((a, b) => b.totalProfit - a.totalProfit);

      const setupCount = setupMap.size - (setupMap.has('__none__') ? 1 : 0);
      const bestSetup = setupStats.length > 0 ? setupStats[0] : null;

      return { name, trades: tr, stats, setupStats, setupCount, bestSetup };
    }).sort((a, b) => b.stats.totalProfit - a.stats.totalProfit);
  }, [trades, viewMode, setupNameMap]);

  const fmt = (v: number) => formatCurrency(v, isPips);

  if (strategies.length === 0) {
    return <p className="text-sm text-muted-foreground">No strategy data available.</p>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      {strategies.map(({ name, stats, setupStats, setupCount, bestSetup }) => {
        const isOpen = expanded === name;
        return (
          <div key={name} className={isOpen ? 'md:col-span-2 lg:col-span-3' : ''}>
            <Card
              className={`overflow-hidden transition-all duration-200 cursor-pointer border-border/50 bg-card ${isOpen ? 'ring-1 ring-primary/40 shadow-[0_0_15px_-3px_hsl(var(--primary)/0.15)]' : 'hover:border-border/80'}`}
              onClick={() => {
                setExpanded(isOpen ? null : name);
                setExpandedSetup(null);
              }}
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">{name}</h4>
                      <p className="text-[10px] text-muted-foreground">{setupCount} setup{setupCount !== 1 ? 's' : ''} · {stats.totalTrades} trades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-muted-foreground text-[10px]">Win %</span>
                        <p className={`font-bold ${stats.winRate >= 50 ? 'text-success' : 'text-destructive'}`}>{stats.winRate.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground text-[10px]">PF</span>
                        <p className={`font-bold ${stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>{stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground text-[10px]">{isPips ? 'Pips' : 'P&L'}</span>
                        <p className={`font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(stats.totalProfit)}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {/* Mobile summary */}
                <div className="flex sm:hidden items-center gap-3 mt-2 text-xs">
                  <span className={`font-bold ${stats.winRate >= 50 ? 'text-success' : 'text-destructive'}`}>{stats.winRate.toFixed(1)}%</span>
                  <span className="text-muted-foreground">·</span>
                  <span className={`font-bold ${stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>PF {stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(stats.totalProfit)}</span>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="border-t border-border/40">
                      {/* Setup Breakdown Table */}
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Setup Breakdown</p>
                      </div>

                      {setupStats.length === 0 || (setupStats.length === 1 && setupStats[0].name === 'No Setup') ? (
                        <p className="px-4 pb-4 text-xs text-muted-foreground">No setups recorded yet.</p>
                      ) : (
                        <div className="px-4 pb-2">
                          {/* Table Header */}
                          <div className="grid grid-cols-[1fr_60px_65px_55px_85px] gap-1 text-[10px] text-muted-foreground uppercase tracking-wider pb-1.5 border-b border-border/30">
                            <span>Setup</span>
                            <span className="text-right">Trades</span>
                            <span className="text-right">Win %</span>
                            <span className="text-right">PF</span>
                            <span className="text-right">{isPips ? 'Pips' : 'P&L'}</span>
                          </div>

                          {/* Setup Rows */}
                          {setupStats.map(setup => {
                            const isSetupOpen = expandedSetup === setup.name;
                            return (
                              <div key={setup.name}>
                                <div
                                  className={`grid grid-cols-[1fr_60px_65px_55px_85px] gap-1 py-2 text-xs items-center cursor-pointer transition-colors border-b border-border/20 ${isSetupOpen ? 'bg-muted/30' : 'hover:bg-muted/15'}`}
                                  onClick={() => setExpandedSetup(isSetupOpen ? null : setup.name)}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${setup.totalProfit >= 0 ? 'bg-success' : 'bg-destructive'}`} />
                                    <span className="truncate font-medium">{setup.name}</span>
                                    <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-150 ${isSetupOpen ? 'rotate-180' : ''}`} />
                                  </div>
                                  <span className="text-right tabular-nums">{setup.totalTrades}</span>
                                  <span className={`text-right font-medium tabular-nums ${setup.winRate >= 50 ? 'text-success' : 'text-destructive'}`}>{setup.winRate.toFixed(1)}%</span>
                                  <span className={`text-right font-medium tabular-nums ${setup.profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>{setup.profitFactor >= 999 ? '∞' : setup.profitFactor.toFixed(1)}</span>
                                  <span className={`text-right font-bold tabular-nums ${setup.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(setup.totalProfit)}</span>
                                </div>

                                {/* Expanded Setup Detail */}
                                <AnimatePresence>
                                  {isSetupOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                                      className="overflow-hidden"
                                    >
                                      <div className="py-2.5 px-3 bg-muted/10 border-b border-border/20">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-[11px]">
                                          {[
                                            { l: 'Avg Winner', v: fmt(setup.avgWinner), c: 'text-success' },
                                            { l: 'Avg Loser', v: fmt(setup.avgLoser), c: 'text-destructive' },
                                            { l: 'Largest Win', v: fmt(setup.largestWin), c: 'text-success' },
                                            { l: 'Largest Loss', v: setup.largestLoss !== 0 ? fmt(setup.largestLoss) : '$0.00', c: 'text-destructive' },
                                            { l: 'Max Consec. Wins', v: String(setup.maxConsecutiveWins), c: 'text-success' },
                                            { l: 'Max Consec. Losses', v: String(setup.maxConsecutiveLosses), c: 'text-destructive' },
                                            { l: 'Hold (Winners)', v: formatHoldTime(setup.avgHoldTimeWins) },
                                            { l: 'Hold (Losers)', v: formatHoldTime(setup.avgHoldTimeLosses) },
                                          ].map(({ l, v, c }) => (
                                            <div key={l} className="flex justify-between">
                                              <span className="text-muted-foreground">{l}</span>
                                              <span className={`font-medium tabular-nums ${c || ''}`}>{v}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-border/40 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          {bestSetup && bestSetup.name !== 'No Setup' && (
                            <>
                              <Trophy className="h-3 w-3 text-amber-500" />
                              <span>Best setup: <span className="text-foreground font-medium">{bestSetup.name}</span></span>
                            </>
                          )}
                        </div>
                        <span className={`font-bold text-base tabular-nums ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {fmt(stats.totalProfit)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
