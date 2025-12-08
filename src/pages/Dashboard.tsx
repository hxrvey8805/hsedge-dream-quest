import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trophy, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/hs-logo.png";
import { TradeDialog } from "@/components/TradeDialog";
import { TradingCalendar } from "@/components/TradingCalendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinimalProgressBar } from "@/components/gamification/MinimalProgressBar";
import { RiskManagement } from "@/components/RiskManagement";
import { StrategyChecklist } from "@/components/StrategyChecklist";
import { EquityCurve } from "@/components/EquityCurve";
import { startOfMonth, endOfMonth } from "date-fns";
const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPL: 0,
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0
  });
  const [viewMode, setViewMode] = useState<'pips' | 'profit'>('pips');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthSwitchEnabled, setMonthSwitchEnabled] = useState(false);
  const [accountSwitchEnabled, setAccountSwitchEnabled] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthStats, setMonthStats] = useState({
    totalPL: 0,
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0
  });
  const [strategies, setStrategies] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const fetchStats = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("trades").select("*").eq("user_id", user.id);
    if (!error && data) {
      const totalPips = data.reduce((sum, trade) => sum + (trade.pips || 0), 0);
      const totalProfit = data.reduce((sum, trade) => sum + (trade.profit || 0), 0);
      const wins = data.filter(t => t.outcome === "Win").length;
      const winRate = data.length > 0 ? wins / data.length * 100 : 0;
      setStats({
        totalPL: totalPips,
        totalProfit: totalProfit,
        winRate: Math.round(winRate),
        totalTrades: data.length
      });
    }
  };

  const fetchMonthStats = async (month: Date) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    let query = supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("trade_date", monthStart.toISOString().split('T')[0])
      .lte("trade_date", monthEnd.toISOString().split('T')[0]);

    if (selectedStrategy) {
      query = query.eq("strategy_type", selectedStrategy);
    }

    const { data, error } = await query;

    if (!error && data) {
      const totalPips = data.reduce((sum, trade) => sum + (trade.pips || 0), 0);
      const totalProfit = data.reduce((sum, trade) => sum + (trade.profit || 0), 0);
      const wins = data.filter(t => t.outcome === "Win").length;
      const winRate = data.length > 0 ? wins / data.length * 100 : 0;
      setMonthStats({
        totalPL: totalPips,
        totalProfit: totalProfit,
        winRate: Math.round(winRate),
        totalTrades: data.length
      });
    }
  };

  const fetchStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("strategies" as any)
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (!error && data) {
      setStrategies(data as unknown as { id: string; name: string }[]);
    }
  };
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };
  const handleTradeAdded = () => {
    fetchStats();
    setRefreshTrigger(prev => prev + 1);
  };
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  useEffect(() => {
    if (user) {
      fetchStats();
      fetchStrategies();
    }
  }, [user]);

  useEffect(() => {
    if (monthSwitchEnabled && user) {
      fetchMonthStats(currentMonth);
    }
  }, [currentMonth, monthSwitchEnabled, selectedStrategy, user]);

  useEffect(() => {
    if (!accountSwitchEnabled) {
      setSelectedStrategy(null);
    }
  }, [accountSwitchEnabled]);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };
  return <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <h1 className="text-xl font-bold">
          </h1>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/statistics")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Statistics
            </Button>
            <Button variant="ghost" onClick={() => navigate("/achievements")}>
              <Trophy className="mr-2 h-4 w-4" />
              Achievements
            </Button>
            <Button variant="ghost" onClick={() => navigate("/goals")}>
              <Trophy className="mr-2 h-4 w-4" />
              Goals
            </Button>
            <Button variant="ghost" onClick={() => navigate("/dream-builder")}>
              <Trophy className="mr-2 h-4 w-4" />
              Dream Builder
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      <main className="w-full px-6 py-8">
        {/* Minimal Progress Bar - Above Stats */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-[1800px]">
            <MinimalProgressBar />
          </div>
        </div>

        {/* Stats Cards - Matching width with calendar + risk management */}
        <div className="flex justify-center mb-8">
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-[1800px]">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total P&L</p>
                  {monthSwitchEnabled ? (
                    <p className={`text-2xl font-bold ${(viewMode === 'pips' ? monthStats.totalPL : monthStats.totalProfit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {viewMode === 'pips' ? <>{monthStats.totalPL >= 0 ? '+' : ''}{monthStats.totalPL.toFixed(1)} pips</> : <>${monthStats.totalProfit >= 0 ? '+' : ''}{monthStats.totalProfit.toFixed(2)}</>}
                    </p>
                  ) : (
                    <p className={`text-2xl font-bold ${(viewMode === 'pips' ? stats.totalPL : stats.totalProfit) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {viewMode === 'pips' ? <>{stats.totalPL >= 0 ? '+' : ''}{stats.totalPL.toFixed(1)} pips</> : <>${stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}</>}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{monthSwitchEnabled ? monthStats.winRate : stats.winRate}%</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{monthSwitchEnabled ? monthStats.totalTrades : stats.totalTrades}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content - Two Column Layout with larger calendar */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 max-w-[1800px] mx-auto">
          {/* Left Column - Trading Calendar */}
          <Card className="p-8 bg-card border-border">
            <div className="flex items-start justify-between mb-6">
              <h2 className={`text-2xl font-bold transition-all duration-300 ${accountSwitchEnabled ? 'mr-4' : ''}`}>
                Trading Calendar
              </h2>
              <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${accountSwitchEnabled ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-2 w-full justify-end">
                  <Label htmlFor="view-toggle" className={`text-sm font-medium transition-colors ${viewMode === 'pips' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    Pips
                  </Label>
                  <Switch 
                    id="view-toggle" 
                    checked={viewMode === 'profit'} 
                    onCheckedChange={checked => setViewMode(checked ? 'profit' : 'pips')}
                    className="data-[state=unchecked]:bg-primary data-[state=checked]:bg-emerald-500"
                  />
                  <Label htmlFor="view-toggle" className={`text-sm font-medium transition-colors ${viewMode === 'profit' ? 'text-emerald-500 font-bold' : 'text-muted-foreground'}`}>
                    P&L ($)
                  </Label>
                </div>
                <div className="flex items-center gap-2 w-full justify-end">
                  <Label htmlFor="month-toggle" className={`text-sm font-medium transition-colors ${monthSwitchEnabled ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    Month
                  </Label>
                  <Switch 
                    id="month-toggle" 
                    checked={monthSwitchEnabled} 
                    onCheckedChange={setMonthSwitchEnabled}
                    className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center gap-2 w-full justify-end">
                  <Label htmlFor="account-toggle" className={`text-sm font-medium transition-colors ${accountSwitchEnabled ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    Account
                  </Label>
                  <Switch 
                    id="account-toggle" 
                    checked={accountSwitchEnabled} 
                    onCheckedChange={setAccountSwitchEnabled}
                    className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary"
                  />
                </div>
                {accountSwitchEnabled && (
                  <div className="w-full flex justify-end">
                    <Select value={selectedStrategy || ""} onValueChange={(value) => setSelectedStrategy(value || null)}>
                      <SelectTrigger className="w-[200px] bg-secondary/50">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Strategies</SelectItem>
                        {strategies.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.name}>{strategy.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
            
            <TradingCalendar 
              onDaySelect={handleDaySelect} 
              viewMode={viewMode} 
              refreshTrigger={refreshTrigger} 
              onRefresh={() => {
                fetchStats();
                if (monthSwitchEnabled) {
                  fetchMonthStats(currentMonth);
                }
              }}
              selectedStrategy={accountSwitchEnabled ? selectedStrategy : null}
              onMonthChange={setCurrentMonth}
            />
          </Card>

          {/* Right Column - Risk Management, Strategy Checklist, and Equity Curve */}
          <div className="space-y-6 flex flex-col">
            <RiskManagement />
            <StrategyChecklist />
            <EquityCurve refreshTrigger={refreshTrigger} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <TradeDialog onTradeAdded={handleTradeAdded} selectedDate={selectedDate} open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>;
};
export default Dashboard;