import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trophy, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/hs-logo.png";
import { TradingCalendar } from "@/components/TradingCalendar";
import { TradeDialog } from "@/components/TradeDialog";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPnL: 0,
    winRate: 0,
    totalTrades: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchStats();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchStats();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, refreshKey]);

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("pips, outcome");

    if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    const totalPnL = data?.reduce((sum, trade) => sum + (trade.pips || 0), 0) || 0;
    const wins = data?.filter((trade) => trade.outcome === "Win").length || 0;
    const totalTrades = data?.length || 0;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    setStats({ totalPnL, winRate, totalTrades });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="HS-Edge" className="h-10 w-10" />
            <h1 className="text-xl font-bold">HS-Edge</h1>
          </div>
          <nav className="flex items-center gap-4">
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pips</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? "text-success" : "text-destructive"}`}>
                  {stats.totalPnL >= 0 ? "+" : ""}{stats.totalPnL.toFixed(1)}
                </p>
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
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
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
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trading Calendar</h2>
            <TradeDialog onTradeAdded={() => setRefreshKey((prev) => prev + 1)} />
          </div>
          <TradingCalendar key={refreshKey} />
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
