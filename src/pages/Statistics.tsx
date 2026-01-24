import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, BarChart3, PieChart, Calendar as CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/hs-logo.png";

interface Trade {
  id: string;
  trade_date: string;
  asset_class: string | null;
  symbol: string;
  session: string | null;
  entry_timeframe: string | null;
  strategy_type: string | null;
  outcome: string;
  pips: number | null;
  profit: number | null;
  time_opened: string | null;
  time_closed: string | null;
  buy_sell: string;
}

interface CategoryStats {
  wins: number;
  losses: number;
  breakeven: number;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  avgDuration?: string;
}

const Statistics = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedAccountId = searchParams.get('accountId');

  useEffect(() => {
    fetchTrades();
  }, [selectedAccountId]);

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    let query = supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: false });

    // Filter by account if selected
    if (selectedAccountId) {
      query = query.eq("account_id", selectedAccountId);
    } else {
      // When no account is selected (All Accounts), exclude evaluation and backtesting
      query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }

    const { data, error } = await query;

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const calculateStats = (filteredTrades: Trade[]): CategoryStats => {
    const wins = filteredTrades.filter(t => t.outcome === "Win").length;
    const losses = filteredTrades.filter(t => t.outcome === "Loss").length;
    const breakeven = filteredTrades.filter(t => t.outcome === "Break Even").length;
    const totalTrades = filteredTrades.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    const totalProfit = filteredTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

    return {
      wins,
      losses,
      breakeven,
      totalTrades,
      winRate: Math.round(winRate),
      totalProfit,
      avgProfit,
    };
  };

  const getStatsByCategory = (category: keyof Trade, value: string) => {
    const filtered = trades.filter(t => t[category] === value);
    return calculateStats(filtered);
  };

  const getStatsByWeekday = (day: string) => {
    const filtered = trades.filter(t => {
      const date = new Date(t.trade_date);
      const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
      return weekday === day;
    });
    return calculateStats(filtered);
  };

  const getStatsByQuarter = (quarter: number) => {
    const filtered = trades.filter(t => {
      const date = new Date(t.trade_date);
      const month = date.getMonth() + 1;
      const q = Math.ceil(month / 3);
      return q === quarter;
    });
    return calculateStats(filtered);
  };

  const globalStats = calculateStats(trades);
  const sessions = [...new Set(trades.map(t => t.session).filter(Boolean))];
  const timeframes = [...new Set(trades.map(t => t.entry_timeframe).filter(Boolean))];
  const strategies = [...new Set(trades.map(t => t.strategy_type).filter(Boolean))];
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const quarters = [1, 2, 3, 4];

  const StatCard = ({ title, stats, icon: Icon }: { title: string; stats: CategoryStats; icon: any }) => (
    <Card className="p-4 bg-card border-border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-sm">{title}</h4>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Win Rate</span>
          <span className="font-bold text-lg">{stats.winRate}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">P&L</span>
          <span className={`font-bold ${stats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-success">{stats.wins}W</span>
          <span className="text-muted-foreground">{stats.breakeven}BE</span>
          <span className="text-destructive">{stats.losses}L</span>
        </div>
        <div className="text-xs text-muted-foreground pt-1 border-t">
          {stats.totalTrades} trades
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Global Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/20">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${globalStats.totalProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${globalStats.totalProfit >= 0 ? '+' : ''}{globalStats.totalProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold">{globalStats.winRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-2xl font-bold">{globalStats.totalTrades}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <PieChart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg P&L</p>
                <p className={`text-2xl font-bold ${globalStats.avgProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${globalStats.avgProfit >= 0 ? '+' : ''}{globalStats.avgProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Breakdowns */}
        <Tabs defaultValue="sessions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="timeframes">Timeframes</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="weekdays">Weekdays</TabsTrigger>
            <TabsTrigger value="quarters">Quarters</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Performance by Session</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {sessions.map(session => (
                <StatCard 
                  key={session} 
                  title={session || "Unknown"} 
                  stats={getStatsByCategory("session", session || "")}
                  icon={Clock}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timeframes" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Performance by Entry Timeframe</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {timeframes.map(tf => (
                <StatCard 
                  key={tf} 
                  title={tf || "Unknown"} 
                  stats={getStatsByCategory("entry_timeframe", tf || "")}
                  icon={BarChart3}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Performance by Strategy</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {strategies.map(strategy => (
                <StatCard 
                  key={strategy} 
                  title={strategy || "Unknown"} 
                  stats={getStatsByCategory("strategy_type", strategy || "")}
                  icon={Target}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekdays" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Performance by Weekday</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {weekdays.map(day => (
                <StatCard 
                  key={day} 
                  title={day} 
                  stats={getStatsByWeekday(day)}
                  icon={CalendarIcon}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="quarters" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Performance by Quarter</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {quarters.map(q => (
                <StatCard 
                  key={q} 
                  title={`Q${q}`} 
                  stats={getStatsByQuarter(q)}
                  icon={PieChart}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Statistics;
