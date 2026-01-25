import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import tlIcon from "@/assets/tp-logo.png";

interface DreamData {
  monthlyProfit: number;
  totalMonthlyCost: number;
  dreamTitle: string | null;
}

const calculateMonthlyCost = (purchase: {
  price: number;
  down_payment?: number | null;
  payment_period_years?: number | null;
  tax_interest_buffer?: number | null;
}): number => {
  const downPayment = purchase.down_payment || 0;
  const years = purchase.payment_period_years || 5;
  const buffer = purchase.tax_interest_buffer || 30;
  const financed = Math.max(0, purchase.price - downPayment);
  const withBuffer = financed * (1 + buffer / 100);
  return withBuffer / (years * 12);
};

export const MinimalProgressBar = () => {
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDreamProgress = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

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
        .select("title")
        .eq("id", profile.primary_dream_id)
        .single();

      // Get dream purchases
      const { data: purchases } = await supabase
        .from("dream_purchases")
        .select("*")
        .eq("dream_profile_id", profile.primary_dream_id)
        .eq("is_selected", true);

      // Calculate actual monthly profit from trades (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: trades } = await supabase
        .from("trades")
        .select("profit")
        .eq("user_id", user.id)
        .gte("trade_date", thirtyDaysAgo.toISOString().split("T")[0]);

      const monthlyProfit = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;
      const totalMonthlyCost = purchases?.reduce((sum, p) => sum + calculateMonthlyCost(p), 0) || 0;

      setDreamData({
        monthlyProfit,
        totalMonthlyCost,
        dreamTitle: dreamProfile?.title || null,
      });
      setLoading(false);
    };

    fetchDreamProgress();

    // Subscribe to trades and dream changes
    const tradesChannel = supabase
      .channel('trades-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades'
        },
        () => fetchDreamProgress()
      )
      .subscribe();

    const purchasesChannel = supabase
      .channel('purchases-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dream_purchases'
        },
        () => fetchDreamProgress()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(purchasesChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="h-2 bg-muted/50 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!dreamData || dreamData.totalMonthlyCost === 0) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <img src={tlIcon} alt="TL" className="w-5 h-5 object-contain" />
            <span className="text-muted-foreground">Dream Achievement</span>
          </div>
          <span className="text-xs text-muted-foreground">Set up your vision to track progress</span>
        </div>
        <Progress value={0} className="h-2 bg-muted/50" />
      </div>
    );
  }

  const progressPercent = Math.min(100, (dreamData.monthlyProfit / dreamData.totalMonthlyCost) * 100);
  const remaining = Math.max(0, dreamData.totalMonthlyCost - dreamData.monthlyProfit);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <img src={tlIcon} alt="TL" className="w-5 h-5 object-contain" />
          <span className="text-muted-foreground">Dream Achievement</span>
        </div>
        <span className="font-semibold text-primary">{Math.round(progressPercent)}%</span>
      </div>
      <Progress 
        value={progressPercent} 
        className="h-2 bg-muted/50"
      />
      <p className="text-xs text-center text-muted-foreground">
        ${remaining.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo to reach your dream
      </p>
    </div>
  );
};
