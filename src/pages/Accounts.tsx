import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Pencil, Check, X, Target, DollarSign, Building2, Briefcase, Trash2, AlertTriangle, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { TPLogo } from "@/components/TPLogo";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AddAccountDialog } from "@/components/accounts/AddAccountDialog";
import { AccountDetailDialog } from "@/components/accounts/AccountDetailDialog";

interface PersonalAccount {
  id: string;
  account_name: string;
  account_size: number;
  broker: string | null;
  running_pl: number;
}

interface FundedAccount {
  id: string;
  company: string;
  account_size: string;
  funded_accounts_count: number;
  funded_accounts_goal: number;
  running_pl: number;
  max_loss: number;
}

interface Evaluation {
  id: string;
  company: string;
  account_size: string;
  profit_target: number;
  running_pl: number;
  max_loss: number;
}

interface BacktestingSession {
  id: string;
  session_name: string;
  description: string | null;
  starting_balance: number;
  running_pl: number;
}

type EditingState = {
  id: string;
  type: 'personal' | 'funded' | 'evaluation' | 'backtesting';
} | null;

type SelectedAccount = {
  id: string;
  type: 'funded' | 'evaluation';
  company: string;
  account_size: string;
  running_pl: number;
  max_loss: number;
  profit_target?: number;
} | null;

const Accounts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [personalAccounts, setPersonalAccounts] = useState<PersonalAccount[]>([]);
  const [fundedAccounts, setFundedAccounts] = useState<FundedAccount[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [backtestingSessions, setBacktestingSessions] = useState<BacktestingSession[]>([]);
  const [editing, setEditing] = useState<EditingState>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchAllAccounts();
    }
  }, [user]);

  const fetchAllAccounts = async () => {
    const { data: personal } = await supabase
      .from("personal_accounts")
      .select("*")
      .eq("user_id", user.id);
    
    const { data: funded } = await supabase
      .from("funded_accounts")
      .select("*")
      .eq("user_id", user.id);
    
    const { data: evals } = await supabase
      .from("evaluations")
      .select("*")
      .eq("user_id", user.id);

    const { data: backtests } = await supabase
      .from("backtesting_sessions")
      .select("*")
      .eq("user_id", user.id);

    if (personal) setPersonalAccounts(personal);
    if (funded) setFundedAccounts(funded);
    if (evals) setEvaluations(evals);
    if (backtests) setBacktestingSessions(backtests);
  };

  const updatePL = async (id: string, newPL: number, type: 'personal' | 'funded' | 'evaluation' | 'backtesting') => {
    const table = type === 'personal' ? 'personal_accounts' : type === 'funded' ? 'funded_accounts' : type === 'evaluation' ? 'evaluations' : 'backtesting_sessions';
    
    const { error } = await supabase
      .from(table)
      .update({ running_pl: newPL })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update P&L");
      return;
    }

    toast.success("P&L updated!");
    setEditing(null);
    fetchAllAccounts();
  };

  const deleteAccount = async (id: string, type: 'personal' | 'funded' | 'evaluation' | 'backtesting') => {
    const table = type === 'personal' ? 'personal_accounts' : type === 'funded' ? 'funded_accounts' : type === 'evaluation' ? 'evaluations' : 'backtesting_sessions';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete account");
      return;
    }

    toast.success("Account deleted!");
    fetchAllAccounts();
  };

  const getTotalValue = () => {
    const personalTotal = personalAccounts.reduce((sum, acc) => sum + acc.account_size, 0);
    const fundedTotal = fundedAccounts.reduce((sum, acc) => {
      const size = parseFloat(acc.account_size.replace(/[^0-9.-]+/g, "")) || 0;
      return sum + (size * acc.funded_accounts_count);
    }, 0);
    return personalTotal + fundedTotal;
  };

  const getTotalPL = () => {
    const personalPL = personalAccounts.reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
    const fundedPL = fundedAccounts.reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
    const evalPL = evaluations.reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
    // Note: Backtesting P&L is excluded from total as it's simulated
    return personalPL + fundedPL + evalPL;
  };

  const getEvaluationProgress = (evaluation: Evaluation) => {
    return Math.min((evaluation.running_pl / evaluation.profit_target) * 100, 100);
  };

  const openFundedDetail = (account: FundedAccount) => {
    setSelectedAccount({
      id: account.id,
      type: 'funded',
      company: account.company,
      account_size: account.account_size,
      running_pl: account.running_pl,
      max_loss: account.max_loss,
    });
    setDetailOpen(true);
  };

  const openEvaluationDetail = (evaluation: Evaluation) => {
    setSelectedAccount({
      id: evaluation.id,
      type: 'evaluation',
      company: evaluation.company,
      account_size: evaluation.account_size,
      running_pl: evaluation.running_pl,
      max_loss: evaluation.max_loss,
      profit_target: evaluation.profit_target,
    });
    setDetailOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TPLogo size={40} variant="icon" />
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/20 via-card to-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Account Value</p>
                  <h1 className="text-4xl font-bold text-foreground">
                    ${getTotalValue().toLocaleString()}
                  </h1>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Personal</span>
                  </div>
                  <p className="text-xl font-semibold">{personalAccounts.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Funded</span>
                  </div>
                  <p className="text-xl font-semibold">{fundedAccounts.reduce((sum, a) => sum + a.funded_accounts_count, 0)}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-amber-500" />
                    <span className="text-xs text-muted-foreground">Evaluations</span>
                  </div>
                  <p className="text-xl font-semibold">{evaluations.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    <FlaskConical className="h-4 w-4 text-violet-500" />
                    <span className="text-xs text-muted-foreground">Backtests</span>
                  </div>
                  <p className="text-xl font-semibold">{backtestingSessions.length}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/50 backdrop-blur">
                  <div className="flex items-center gap-2 mb-1">
                    {getTotalPL() >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">Total P&L</span>
                  </div>
                  <p className={`text-xl font-semibold ${getTotalPL() >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {getTotalPL() >= 0 ? '+' : ''}${getTotalPL().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              Personal Accounts
            </h2>
            <AddAccountDialog type="personal" userId={user.id} onSuccess={fetchAllAccounts} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {personalAccounts.map((account, index) => {
                const isEditing = editing?.id === account.id && editing?.type === 'personal';
                const isPositive = (account.running_pl || 0) >= 0;
                
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gradient-to-br from-blue-500/10 to-card border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5 group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{account.account_name}</h3>
                            {account.broker && (
                              <p className="text-sm text-muted-foreground">{account.broker}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{account.account_name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteAccount(account.id, 'personal')} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-blue-500 mb-3">
                          ${account.account_size.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Running P&L</span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-right"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updatePL(account.id, editValue, 'personal')}>
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                {isPositive ? '+' : ''}${(account.running_pl || 0).toFixed(2)}
                              </span>
                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => { setEditing({ id: account.id, type: 'personal' }); setEditValue(account.running_pl || 0); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {personalAccounts.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No personal accounts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Funded Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              Funded Accounts
            </h2>
            <AddAccountDialog type="funded" userId={user.id} onSuccess={fetchAllAccounts} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {fundedAccounts.map((account, index) => {
                const isPositive = (account.running_pl || 0) >= 0;
                const accountSizeNum = parseFloat(account.account_size.replace(/[^0-9.-]+/g, "")) || 0;
                const currentBalance = accountSizeNum + (account.running_pl || 0);
                const maxLossThreshold = accountSizeNum - (account.max_loss || 0);
                const isAtRisk = account.max_loss > 0 && currentBalance <= maxLossThreshold + ((account.max_loss || 0) * 0.2);
                
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="bg-gradient-to-br from-emerald-500/10 to-card border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group cursor-pointer"
                      onClick={() => openFundedDetail(account)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{account.company}</h3>
                            <p className="text-sm text-muted-foreground">{account.account_size}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isAtRisk && (
                              <div className="p-2 rounded-lg bg-destructive/10">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              </div>
                            )}
                            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this {account.company} account? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteAccount(account.id, 'funded')} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-bold text-emerald-500">{account.funded_accounts_count}</span>
                          <span className="text-muted-foreground">/ {account.funded_accounts_goal} goal</span>
                        </div>
                        <Progress 
                          value={(account.funded_accounts_count / account.funded_accounts_goal) * 100} 
                          className="h-2 mb-3 bg-emerald-500/20"
                        />
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Running P&L</span>
                          <span className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                            {isPositive ? '+' : ''}${(account.running_pl || 0).toFixed(2)}
                          </span>
                        </div>
                        {account.max_loss > 0 && (
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Max Loss
                            </span>
                            <span className="text-sm font-medium text-destructive">
                              ${account.max_loss.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {fundedAccounts.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No funded accounts yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Evaluations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Active Evaluations
            </h2>
            <AddAccountDialog type="evaluation" userId={user.id} onSuccess={fetchAllAccounts} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {evaluations.map((evaluation, index) => {
                const progress = getEvaluationProgress(evaluation);
                const isPositive = evaluation.running_pl >= 0;
                const accountSizeNum = parseFloat(evaluation.account_size.replace(/[^0-9.-]+/g, "")) || 0;
                const currentBalance = accountSizeNum + evaluation.running_pl;
                const maxLossThreshold = accountSizeNum - (evaluation.max_loss || 0);
                const isAtRisk = evaluation.max_loss > 0 && currentBalance <= maxLossThreshold + ((evaluation.max_loss || 0) * 0.2);
                const isCompleted = evaluation.running_pl >= evaluation.profit_target;
                
                return (
                  <motion.div
                    key={evaluation.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card 
                      className="bg-gradient-to-br from-amber-500/10 to-card border-amber-500/20 hover:border-amber-500/40 transition-all hover:shadow-lg hover:shadow-amber-500/5 overflow-hidden group cursor-pointer"
                      onClick={() => openEvaluationDetail(evaluation)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{evaluation.company}</h3>
                            <p className="text-sm text-muted-foreground">{evaluation.account_size} Account</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {isCompleted && (
                              <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                                Completed
                              </span>
                            )}
                            {isAtRisk && (
                              <div className="p-2 rounded-lg bg-destructive/10">
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              </div>
                            )}
                            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this {evaluation.company} evaluation? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteAccount(evaluation.id, 'evaluation')} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Running P&L</span>
                            <span className={`text-xl font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                              {isPositive ? '+' : ''}${evaluation.running_pl.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress to Target</span>
                              <span>${evaluation.profit_target.toLocaleString()}</span>
                            </div>
                            <Progress 
                              value={Math.max(0, progress)} 
                              className="h-3 bg-amber-500/20"
                            />
                            <p className="text-xs text-muted-foreground text-right">
                              {progress.toFixed(1)}% complete
                            </p>
                          </div>

                          {evaluation.max_loss > 0 && (
                            <div className="flex items-center justify-between pt-2 border-t border-border/50">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Max Loss
                              </span>
                              <span className="text-sm font-medium text-destructive">
                                ${evaluation.max_loss.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {evaluations.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active evaluations</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Backtesting Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-violet-500" />
              Backtesting Sessions
            </h2>
            <AddAccountDialog type="backtesting" userId={user.id} onSuccess={fetchAllAccounts} />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {backtestingSessions.map((session, index) => {
                const isEditing = editing?.id === session.id && editing?.type === 'backtesting';
                const isPositive = (session.running_pl || 0) >= 0;
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="bg-gradient-to-br from-violet-500/10 to-card border-violet-500/20 hover:border-violet-500/40 transition-all hover:shadow-lg hover:shadow-violet-500/5 group">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{session.session_name}</h3>
                            {session.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{session.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                              Backtest
                            </span>
                            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Backtesting Session</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{session.session_name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteAccount(session.id, 'backtesting')} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-violet-500 mb-3">
                          ${session.starting_balance.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">Running P&L</span>
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-right"
                                autoFocus
                              />
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => updatePL(session.id, editValue, 'backtesting')}>
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(null)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                {isPositive ? '+' : ''}${(session.running_pl || 0).toFixed(2)}
                              </span>
                              <Button size="icon" variant="ghost" className="h-7 w-7 opacity-50 hover:opacity-100" onClick={() => { setEditing({ id: session.id, type: 'backtesting' }); setEditValue(session.running_pl || 0); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {backtestingSessions.length === 0 && (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No backtesting sessions yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </main>

      {/* Account Detail Dialog */}
      <AccountDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        account={selectedAccount}
        onUpdate={fetchAllAccounts}
      />
    </div>
  );
};

export default Accounts;
