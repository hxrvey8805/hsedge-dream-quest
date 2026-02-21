import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Trophy, TrendingUp, BarChart3, Sparkles, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/tp-logo.png";
import { TradeDialog } from "@/components/TradeDialog";
import { TradingCalendar } from "@/components/TradingCalendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinimalProgressBar } from "@/components/gamification/MinimalProgressBar";
import { EquityCurve } from "@/components/EquityCurve";
import { VisionModeDashboard } from "@/components/dashboard/VisionModeDashboard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { CSVTradeUpload } from "@/components/trades/CSVTradeUpload";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { startOfMonth, endOfMonth } from "date-fns";
import { useAccounts } from "@/hooks/useAccounts";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalPL: 0,
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0
  });
  // Load persisted state from localStorage
  const loadPersistedState = () => {
    try {
      const savedMonthSwitch = localStorage.getItem('dashboard_monthSwitchEnabled');
      const savedAccountSwitch = localStorage.getItem('dashboard_accountSwitchEnabled');
      const savedSelectedAccount = localStorage.getItem('dashboard_selectedAccount');
      const savedCurrentMonth = localStorage.getItem('dashboard_currentMonth');
      const savedViewMode = localStorage.getItem('dashboard_viewMode');

      return {
        monthSwitchEnabled: savedMonthSwitch === 'true',
        accountSwitchEnabled: savedAccountSwitch === 'true',
        selectedAccount: savedSelectedAccount || null,
        currentMonth: savedCurrentMonth ? new Date(savedCurrentMonth) : new Date(),
        viewMode: (savedViewMode as 'pips' | 'profit') || 'pips',
      };
    } catch (error) {
      return {
        monthSwitchEnabled: false,
        accountSwitchEnabled: false,
        selectedAccount: null,
        currentMonth: new Date(),
        viewMode: 'pips' as const,
      };
    }
  };

  const persistedState = loadPersistedState();
  const [viewMode, setViewMode] = useState<'pips' | 'profit'>(persistedState.viewMode);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [monthSwitchEnabled, setMonthSwitchEnabled] = useState(persistedState.monthSwitchEnabled);
  const [accountSwitchEnabled, setAccountSwitchEnabled] = useState(persistedState.accountSwitchEnabled);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(persistedState.selectedAccount);
  const [currentMonth, setCurrentMonth] = useState(persistedState.currentMonth);
  const [monthStats, setMonthStats] = useState({
    totalPL: 0,
    totalProfit: 0,
    winRate: 0,
    totalTrades: 0
  });
  const [showVisionMode, setShowVisionMode] = useState(false);
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [clearTradesOpen, setClearTradesOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClearLastImport = async () => {
    setIsClearing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find the most recent import batch
      let query = supabase
        .from("trades")
        .select("import_batch_id, created_at")
        .eq("user_id", user.id)
        .not("import_batch_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1);

      // If an account is selected, filter by that account
      if (selectedAccount) {
        query = query.eq("account_id", selectedAccount);
      }

      const { data: latestImport, error: fetchError } = await query.maybeSingle();

      if (fetchError) throw fetchError;

      if (!latestImport || !latestImport.import_batch_id) {
        toast.error("No CSV imports found to clear");
        setClearTradesOpen(false);
        setIsClearing(false);
        return;
      }

      // Delete all trades with this batch ID
      const { error: deleteError } = await supabase
        .from("trades")
        .delete()
        .eq("user_id", user.id)
        .eq("import_batch_id", latestImport.import_batch_id);

      if (deleteError) throw deleteError;

      toast.success("Last CSV import cleared successfully");
      setClearTradesOpen(false);
      setRefreshTrigger(prev => prev + 1);
      fetchStats();
    } catch (error: any) {
      console.error("Error clearing last import:", error);
      toast.error("Failed to clear last import");
    } finally {
      setIsClearing(false);
    }
  };
  const fetchStats = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    
    let query = supabase.from("trades").select("*").eq("user_id", user.id);
    
    // Filter by account if selected
    if (selectedAccount) {
      query = query.eq("account_id", selectedAccount);
    } else {
      // When "All Accounts" is selected, exclude evaluation and backtesting
      query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
    }
    
    const {
      data,
      error
    } = await query;
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

    // Filter by account if selected
    if (selectedAccount) {
      query = query.eq("account_id", selectedAccount);
    } else {
      // When "All Accounts" is selected, exclude evaluation and backtesting
      query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
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
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };
  const handleTradeAdded = () => {
    fetchStats();
    setRefreshTrigger(prev => prev + 1);
  };
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        // Check onboarding status
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("user_id", session.user.id)
          .single();
        
        if (profile && !profile.onboarding_completed) {
          navigate("/onboarding");
        }
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
    }
  }, [user, selectedAccount]);

  useEffect(() => {
    if (monthSwitchEnabled && user) {
      fetchMonthStats(currentMonth);
    }
  }, [currentMonth, monthSwitchEnabled, user, selectedAccount]);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboard_monthSwitchEnabled', String(monthSwitchEnabled));
  }, [monthSwitchEnabled]);

  useEffect(() => {
    localStorage.setItem('dashboard_accountSwitchEnabled', String(accountSwitchEnabled));
  }, [accountSwitchEnabled]);

  useEffect(() => {
    if (selectedAccount) {
      localStorage.setItem('dashboard_selectedAccount', selectedAccount);
    } else {
      localStorage.removeItem('dashboard_selectedAccount');
    }
  }, [selectedAccount]);

  useEffect(() => {
    localStorage.setItem('dashboard_currentMonth', currentMonth.toISOString());
  }, [currentMonth]);

  useEffect(() => {
    localStorage.setItem('dashboard_viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!accountSwitchEnabled) {
      setSelectedAccount(null);
    }
  }, [accountSwitchEnabled]);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  // Vision Mode Dashboard
  if (showVisionMode) {
    return <VisionModeDashboard onClose={() => setShowVisionMode(false)} />;
  };
  return <div className="bg-background">
      <div className="w-full px-6 py-8">
        {/* Minimal Progress Bar - Clickable for Vision Mode */}
        <div className="mb-8 flex justify-center">
          <div 
            className="w-full max-w-[1800px] cursor-pointer group"
            onClick={() => setShowVisionMode(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                CURRENT REALITY
              </span>
              <span className="text-sm text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-4 h-4" />
                Click to see Vision Mode
              </span>
            </div>
            <MinimalProgressBar />
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 max-w-[1800px] mx-auto">
          {/* Left Column - Trading Calendar */}
          <Card className="p-8 bg-card border-border">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-bold transition-all duration-300 ${accountSwitchEnabled ? 'mr-4' : ''}`}>
                  Trading Calendar
                </h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCsvUploadOpen(true)}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setClearTradesOpen(true)}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                  Undo Last Import
                </Button>
              </div>
              <div className="relative flex flex-col items-end gap-3 transition-all duration-300">
                <div className="grid grid-cols-[auto_auto_auto] gap-x-2 gap-y-3 items-center justify-end">
                  <Label htmlFor="view-toggle" className={`text-sm font-medium transition-colors text-right ${viewMode === 'pips' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
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

                  <Label htmlFor="month-toggle" className={`text-sm font-medium transition-colors text-right ${monthSwitchEnabled ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    Month
                  </Label>
                  <Switch 
                    id="month-toggle" 
                    checked={monthSwitchEnabled} 
                    onCheckedChange={setMonthSwitchEnabled}
                    className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary"
                  />
                  <span></span>

                  <Label htmlFor="account-toggle" className={`text-sm font-medium transition-colors text-right ${accountSwitchEnabled ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    Account
                  </Label>
                  <Switch 
                    id="account-toggle" 
                    checked={accountSwitchEnabled} 
                    onCheckedChange={setAccountSwitchEnabled}
                    className="data-[state=unchecked]:bg-muted data-[state=checked]:bg-primary"
                  />
                  <span></span>
                </div>
                {accountSwitchEnabled && (
                  <div className="absolute right-0 top-full mt-2 z-50">
                    <Select value={selectedAccount || "all"} onValueChange={(value) => setSelectedAccount(value === "all" ? null : value)}>
                      <SelectTrigger className="w-[220px] bg-secondary/50">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts
                          .filter(account => account.type === 'personal' || account.type === 'funded')
                          .map((account) => (
                            <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                          ))}
                        {accounts.filter(account => account.type === 'evaluation' || account.type === 'backtesting').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Evaluations & Backtests</div>
                            {accounts
                              .filter(account => account.type === 'evaluation' || account.type === 'backtesting')
                              .map((account) => (
                                <SelectItem key={account.id} value={account.id}>{account.displayName}</SelectItem>
                              ))}
                          </>
                        )}
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
              selectedStrategy={null}
              onMonthChange={setCurrentMonth}
              selectedAccountId={selectedAccount}
            />
          </Card>

          {/* Right Column - Stats + Equity Curve */}
          <div className="space-y-6 flex flex-col">
            <DashboardStats
              accounts={accounts}
              selectedAccountId={selectedAccount}
              monthSwitchEnabled={monthSwitchEnabled}
              currentMonth={currentMonth}
              refreshTrigger={refreshTrigger}
              viewMode={viewMode}
            />
            <EquityCurve 
              refreshTrigger={refreshTrigger} 
              viewMode={viewMode}
              monthSwitchEnabled={monthSwitchEnabled}
              currentMonth={currentMonth}
              selectedAccountId={selectedAccount}
            />
          </div>
        </div>
      </div>

      <TradeDialog 
        onTradeAdded={handleTradeAdded} 
        selectedDate={selectedDate} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        selectedAccountId={selectedAccount}
      />

      <CSVTradeUpload
        open={csvUploadOpen}
        onOpenChange={setCsvUploadOpen}
        selectedAccountId={selectedAccount}
        accountType={selectedAccount ? accounts.find(a => a.id === selectedAccount)?.type : null}
        onSuccess={handleTradeAdded}
      />

      <AlertDialog open={clearTradesOpen} onOpenChange={setClearTradesOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Last CSV Import?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all trades from your most recent CSV import. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLastImport}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Undo Import"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Dashboard;