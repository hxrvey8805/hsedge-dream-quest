import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Home, Car, Plane, Sparkles, TrendingUp, Target, Check, Clock } from "lucide-react";

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

  useEffect(() => {
    fetchDreamData();
  }, []);

  const fetchDreamData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user profile with primary dream
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("primary_dream_id")
      .eq("user_id", user.id)
      .single();

    if (!profile?.primary_dream_id) {
      setLoading(false);
      return;
    }

    // Get dream profile
    const { data: dreamProfile } = await supabase
      .from("dream_profiles")
      .select("*")
      .eq("id", profile.primary_dream_id)
      .single();

    // Get dream purchases
    const { data: purchases } = await supabase
      .from("dream_purchases")
      .select("*")
      .eq("dream_profile_id", profile.primary_dream_id);

    // Get trading income sources
    const { data: incomeSources } = await supabase
      .from("trading_income_sources")
      .select("*")
      .eq("dream_profile_id", profile.primary_dream_id);

    // Calculate actual monthly profit from trades (last 30 days average * 30)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: trades } = await supabase
      .from("trades")
      .select("profit, trade_date")
      .eq("user_id", user.id)
      .gte("trade_date", thirtyDaysAgo.toISOString().split("T")[0]);

    const monthlyProfit = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;

    setDreamData({
      profile: dreamProfile,
      purchases: purchases || [],
      incomeSources: incomeSources || [],
      monthlyProfit,
    });
    setLoading(false);
  };

  const calculateMonthlyCost = (purchase: any) => {
    const downPayment = purchase.down_payment || 0;
    const taxBuffer = purchase.tax_interest_buffer || 0;
    const years = purchase.payment_period_years || 1;
    const remaining = purchase.price - downPayment;
    const withBuffer = remaining * (1 + taxBuffer / 100);
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
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Trading
            </button>
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
