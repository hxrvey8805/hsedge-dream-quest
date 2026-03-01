import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Clock, BarChart3, Calendar as CalendarIcon, PieChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useAccounts } from "@/hooks/useAccounts";
import { Trade, calculateFullStats, formatCurrency } from "@/lib/statisticsUtils";
import { PerformanceOverview } from "@/components/statistics/PerformanceOverview";
import { TradeBreakdown } from "@/components/statistics/TradeBreakdown";
import { AdvancedMetrics } from "@/components/statistics/AdvancedMetrics";
import { StrategyCards } from "@/components/statistics/StrategyCards";
import { SegmentGrid } from "@/components/statistics/SegmentGrid";

const loadDashboardFilters = () => {
  try {
    const monthSwitchEnabled = localStorage.getItem('dashboard_monthSwitchEnabled') === 'true';
    const accountSwitchEnabled = localStorage.getItem('dashboard_accountSwitchEnabled') === 'true';
    const savedAccount = localStorage.getItem('dashboard_selectedAccount');
    const savedMonth = localStorage.getItem('dashboard_currentMonth');
    const savedViewMode = localStorage.getItem('dashboard_viewMode');
    return {
      monthSwitchEnabled,
      accountSwitchEnabled,
      selectedAccountId: accountSwitchEnabled ? (savedAccount || null) : null,
      currentMonth: savedMonth ? new Date(savedMonth) : new Date(),
      viewMode: (savedViewMode as 'pips' | 'profit') || 'profit',
    };
  } catch {
    return { monthSwitchEnabled: false, accountSwitchEnabled: false, selectedAccountId: null, currentMonth: new Date(), viewMode: 'profit' as const };
  }
};

const Statistics = () => {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(loadDashboardFilters);
  const { accounts } = useAccounts();

  useEffect(() => {
    const handleFocus = () => setFilters(loadDashboardFilters());
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => { fetchTrades(); }, [filters.selectedAccountId, filters.monthSwitchEnabled, filters.currentMonth]);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    let query = supabase.from("trades").select("*").eq("user_id", user.id).order("trade_date", { ascending: true }).range(0, 9999);

    if (filters.monthSwitchEnabled) {
      const ms = startOfMonth(filters.currentMonth);
      const me = endOfMonth(filters.currentMonth);
      query = query.gte("trade_date", format(ms, 'yyyy-MM-dd')).lte("trade_date", format(me, 'yyyy-MM-dd'));
    }

    if (filters.selectedAccountId) {
      query = query.eq("account_id", filters.selectedAccountId);
    } else {
      query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }

    const { data, error } = await query;
    if (!error && data) setTrades(data as Trade[]);
    setLoading(false);
  };

  const isPips = filters.viewMode === 'pips';

  const accountPL = useMemo(() => {
    if (filters.monthSwitchEnabled || isPips) return 0;
    if (filters.selectedAccountId) {
      return accounts.find(a => a.id === filters.selectedAccountId)?.running_pl || 0;
    }
    return accounts.filter(a => a.type === 'personal' || a.type === 'funded').reduce((s, a) => s + (a.running_pl || 0), 0);
  }, [filters, accounts, isPips]);

  const fullStats = useMemo(() => calculateFullStats(trades, filters.viewMode), [trades, filters.viewMode]);
  const netPL = isPips ? fullStats.totalProfit : accountPL + fullStats.totalProfit;

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (isPips) parts.push('Pips mode');
    if (filters.monthSwitchEnabled) parts.push(format(filters.currentMonth, 'MMMM yyyy'));
    if (filters.selectedAccountId) {
      const acct = accounts.find(a => a.id === filters.selectedAccountId);
      parts.push(acct ? acct.displayName : 'Filtered account');
    }
    return parts.length > 0 ? parts.join(' · ') : 'All time · All accounts';
  }, [filters, accounts, isPips]);

  // Weekday/Quarter segment helpers
  const fmt = (v: number) => formatCurrency(v, isPips);

  const weekdayStats = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return days.map(day => {
      const filtered = trades.filter(t => {
        const d = new Date(t.trade_date);
        return d.toLocaleDateString('en-US', { weekday: 'long' }) === day;
      });
      const wins = filtered.filter(t => t.outcome === "Win").length;
      const losses = filtered.filter(t => t.outcome === "Loss").length;
      const be = filtered.filter(t => t.outcome === "Break Even").length;
      const total = filtered.length;
      const profit = filtered.reduce((s, t) => s + (isPips ? (t.pips || 0) : (t.profit || 0)), 0);
      return { name: day, wins, losses, breakeven: be, totalTrades: total, winRate: total > 0 ? (wins / total) * 100 : 0, totalProfit: profit };
    });
  }, [trades, isPips]);

  const quarterStats = useMemo(() => {
    return [1, 2, 3, 4].map(q => {
      const filtered = trades.filter(t => { const m = new Date(t.trade_date).getMonth() + 1; return Math.ceil(m / 3) === q; });
      const wins = filtered.filter(t => t.outcome === "Win").length;
      const losses = filtered.filter(t => t.outcome === "Loss").length;
      const be = filtered.filter(t => t.outcome === "Break Even").length;
      const total = filtered.length;
      const profit = filtered.reduce((s, t) => s + (isPips ? (t.pips || 0) : (t.profit || 0)), 0);
      return { name: `Q${q}`, wins, losses, breakeven: be, totalTrades: total, winRate: total > 0 ? (wins / total) * 100 : 0, totalProfit: profit };
    });
  }, [trades, isPips]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Filter indicator */}
        <p className="text-xs text-muted-foreground mb-4">
          Showing: <span className="text-foreground font-medium">{filterLabel}</span>
          <span className="ml-2 text-muted-foreground/50">(synced from Dashboard)</span>
        </p>

        {/* Performance Overview */}
        <PerformanceOverview stats={fullStats} isPips={isPips} netPL={netPL} accountPL={accountPL} />

        {/* Trade Breakdown */}
        <div className="mt-6">
          <TradeBreakdown stats={fullStats} isPips={isPips} />
        </div>

        {/* Advanced Metrics */}
        <div className="mt-6">
          <AdvancedMetrics stats={fullStats} />
        </div>

        {/* Segmentation Tabs */}
        <div className="mt-6">
          <Tabs defaultValue="sessions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="timeframes">Timeframes</TabsTrigger>
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="weekdays">Weekdays</TabsTrigger>
              <TabsTrigger value="quarters">Quarters</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions">
              <SegmentGrid trades={trades} isPips={isPips} category="session" icon={Clock} />
            </TabsContent>

            <TabsContent value="timeframes">
              <SegmentGrid trades={trades} isPips={isPips} category="entry_timeframe" icon={BarChart3} />
            </TabsContent>

            <TabsContent value="strategies">
              <StrategyCards trades={trades} isPips={isPips} />
            </TabsContent>

            <TabsContent value="weekdays">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {weekdayStats.map(s => (
                  <Card key={s.name} className="p-4 bg-card border-border/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{s.name}</h4>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-[10px] text-muted-foreground">Win Rate</span><span className="font-bold text-sm">{s.winRate.toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-[10px] text-muted-foreground">{isPips ? 'Pips' : 'P&L'}</span><span className={`font-bold text-sm ${s.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(s.totalProfit)}</span></div>
                      <div className="flex justify-between text-[10px] pt-1 border-t border-border/30">
                        <span className="text-success">{s.wins}W</span><span className="text-muted-foreground">{s.breakeven}BE</span><span className="text-destructive">{s.losses}L</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.totalTrades} trades</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quarters">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quarterStats.map(s => (
                  <Card key={s.name} className="p-4 bg-card border-border/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{s.name}</h4>
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between"><span className="text-[10px] text-muted-foreground">Win Rate</span><span className="font-bold text-sm">{s.winRate.toFixed(1)}%</span></div>
                      <div className="flex justify-between"><span className="text-[10px] text-muted-foreground">{isPips ? 'Pips' : 'P&L'}</span><span className={`font-bold text-sm ${s.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>{fmt(s.totalProfit)}</span></div>
                      <div className="flex justify-between text-[10px] pt-1 border-t border-border/30">
                        <span className="text-success">{s.wins}W</span><span className="text-muted-foreground">{s.breakeven}BE</span><span className="text-destructive">{s.losses}L</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{s.totalTrades} trades</p>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Statistics;
