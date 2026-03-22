import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Home, Car, Plane, Sparkles, TrendingUp, Target, Check, Clock, Timer } from "lucide-react";

const parseDeadline = (timescale: string | null, createdAt: string): Date | null => {
  if (!timescale) return null;
  const lower = timescale.toLowerCase().trim();
  
  // "By 2026", "By December 2026", "By Dec 2026"
  const byYearMatch = lower.match(/by\s+(\w+\s+)?(\d{4})/);
  if (byYearMatch) {
    const monthStr = byYearMatch[1]?.trim();
    const year = parseInt(byYearMatch[2]);
    if (monthStr) {
      const d = new Date(`${monthStr} 1, ${year}`);
      if (!isNaN(d.getTime())) return new Date(year, d.getMonth() + 1, 0); // end of that month
    }
    return new Date(year, 11, 31);
  }

  // "Within X years", "Next X years", "X years", "In X years"
  const yearsMatch = lower.match(/(\d+)\s*years?/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    const base = new Date(createdAt);
    return new Date(base.getFullYear() + years, base.getMonth(), base.getDate());
  }

  // "Within X months", "X months"
  const monthsMatch = lower.match(/(\d+)\s*months?/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1]);
    const base = new Date(createdAt);
    return new Date(base.getFullYear(), base.getMonth() + months, base.getDate());
  }

  return null;
};

const useCountdown = (deadline: Date | null) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) return null;

  const diff = deadline.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: false };
};

interface VisionModeDashboardProps {
  onClose: () => void;
}

interface DreamData {
  profile: any;
  purchases: any[];
  incomeSources: any[];
  monthlyProfit: number;
}

export const VisionModeDashboard = ({ onClose }: VisionModeDashboardProps) => {
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [loading, setLoading] = useState(true);

  const deadline = useMemo(() => {
    if (!dreamData?.profile) return null;
    return parseDeadline(dreamData.profile.timescale, dreamData.profile.created_at);
  }, [dreamData?.profile]);

  const countdown = useCountdown(deadline);

  useEffect(() => {
    fetchDreamData();
  }, []);

  const fetchDreamData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
...
    setLoading(false);
  };

  const calculateMonthlyCost = (purchase: any) => {
...
    return withBuffer / (years * 12);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading your vision...</div>
      </div>
    );
  }

  if (!dreamData?.profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Vision Created Yet</h2>
          <p className="text-muted-foreground mb-4">
            Create your dream vision in the Dream Builder to see your progress here.
          </p>
        </Card>
      </div>
    );
  }

  const selectedPurchases = dreamData.purchases.filter((p) => p.is_selected);
  const totalMonthlyCost = selectedPurchases.reduce((sum, p) => sum + calculateMonthlyCost(p), 0);
  const coveragePercent = totalMonthlyCost > 0 
    ? Math.min(100, (dreamData.monthlyProfit / totalMonthlyCost) * 100) 
    : 0;

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return "text-success";
    if (percent >= 75) return "text-emerald-400";
    if (percent >= 50) return "text-amber-400";
    if (percent >= 25) return "text-orange-400";
    return "text-destructive";
  };

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("house") || lower.includes("home") || lower.includes("apartment")) return Home;
    if (lower.includes("car") || lower.includes("vehicle")) return Car;
    if (lower.includes("travel") || lower.includes("trip") || lower.includes("vacation")) return Plane;
    return Sparkles;
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="ambient-orb w-[400px] h-[400px] bg-primary/20 -top-32 -right-32" />
        
        <div className="relative z-10 container mx-auto px-6 py-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <p className="text-primary font-medium mb-1">FUTURE REALITY</p>
              <h1 className="text-3xl md:text-4xl font-bold">
                {dreamData.profile.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {dreamData.profile.timescale || "Your dream life"}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Countdown Timer */}
              {countdown && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <Timer className={`w-5 h-5 ${countdown.expired ? "text-destructive" : "text-primary"}`} />
                  {countdown.expired ? (
                    <span className="text-destructive font-bold text-sm">DEADLINE PASSED</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {[
                        { value: countdown.days, label: "D" },
                        { value: countdown.hours, label: "H" },
                        { value: countdown.minutes, label: "M" },
                        { value: countdown.seconds, label: "S" },
                      ].map((unit) => (
                        <div key={unit.label} className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-mono text-lg font-bold ${
                            countdown.days < 30 ? "bg-destructive/20 text-destructive" : 
                            countdown.days < 90 ? "bg-amber-500/20 text-amber-400" : 
                            "bg-primary/20 text-primary"
                          }`}>
                            {String(unit.value).padStart(2, "0")}
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{unit.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Trading
              </button>
            </div>
          </motion.div>

          {/* Main Progress */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 premium-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-1">Dream Achievement Progress</h2>
                  <p className="text-muted-foreground">
                    Based on your actual trading performance vs dream costs
                  </p>
                </div>
                <div className={`text-5xl font-bold ${getProgressColor(coveragePercent)}`}>
                  {coveragePercent.toFixed(0)}%
                </div>
              </div>
              
              <Progress value={coveragePercent} className="h-4 mb-6" />
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Monthly Trading Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    ${dreamData.monthlyProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Required Monthly Income</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${totalMonthlyCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 mb-2">
                    {coveragePercent >= 100 ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="text-sm text-muted-foreground">Status</span>
                  </div>
                  <p className={`text-xl font-bold ${coveragePercent >= 100 ? "text-success" : "text-amber-400"}`}>
                    {coveragePercent >= 100 ? "Dream Achievable!" : `Need $${(totalMonthlyCost - dreamData.monthlyProfit).toFixed(0)} more/mo`}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Dream Items Progress */}
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Dream Items Progress</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedPurchases.map((purchase, idx) => {
            const monthlyCost = calculateMonthlyCost(purchase);
            const itemCoverage = dreamData.monthlyProfit > 0 
              ? Math.min(100, (dreamData.monthlyProfit / monthlyCost) * 100)
              : 0;
            const Icon = getCategoryIcon(purchase.item_name);
            
            return (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`p-5 transition-all ${
                  itemCoverage >= 100 
                    ? "border-success/50 bg-success/5" 
                    : "border-border"
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        itemCoverage >= 100 ? "bg-success/20" : "bg-primary/20"
                      }`}>
                        <Icon className={`w-5 h-5 ${itemCoverage >= 100 ? "text-success" : "text-primary"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{purchase.item_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${purchase.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {itemCoverage >= 100 && (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                        <Check className="w-4 h-4 text-success-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <Progress value={itemCoverage} className="h-2 mb-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ${monthlyCost.toFixed(0)}/mo needed
                    </span>
                    <span className={getProgressColor(itemCoverage)}>
                      {itemCoverage.toFixed(0)}% covered
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {selectedPurchases.length === 0 && (
          <Card className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No dream purchases selected. Add items in the Dream Builder to track progress.
            </p>
          </Card>
        )}

        {/* Life Aspects */}
        {(dreamData.profile.living_situation || dreamData.profile.vehicle || dreamData.profile.travel || dreamData.profile.style) && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6">Your Dream Life</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {dreamData.profile.living_situation && (
                <Card className="p-5 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Living Situation</h4>
                  </div>
                  <p className="text-muted-foreground">{dreamData.profile.living_situation}</p>
                </Card>
              )}
              {dreamData.profile.vehicle && (
                <Card className="p-5 bg-gradient-to-br from-success/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-success" />
                    <h4 className="font-semibold">Dream Vehicle</h4>
                  </div>
                  <p className="text-muted-foreground">{dreamData.profile.vehicle}</p>
                </Card>
              )}
              {dreamData.profile.travel && (
                <Card className="p-5 bg-gradient-to-br from-amber-500/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold">Travel Goals</h4>
                  </div>
                  <p className="text-muted-foreground">{dreamData.profile.travel}</p>
                </Card>
              )}
              {dreamData.profile.style && (
                <Card className="p-5 bg-gradient-to-br from-purple-500/5 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold">Lifestyle & Style</h4>
                  </div>
                  <p className="text-muted-foreground">{dreamData.profile.style}</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
