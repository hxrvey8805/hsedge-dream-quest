import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, YAxis, Area, XAxis } from "recharts";
import tlIcon from "@/assets/tp-logo.png";

interface DreamData {
  monthlyProfit: number;
  totalMonthlyCost: number;
  dreamTitle: string | null;
  dailyData: { date: string; cumulative: number }[];
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

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("primary_dream_id")
        .eq("user_id", user.id)
        .single();

      if (!profile?.primary_dream_id) {
        setLoading(false);
        return;
      }

      const { data: dreamProfile } = await supabase
        .from("dream_profiles")
        .select("title")
        .eq("id", profile.primary_dream_id)
        .single();

      const { data: purchases } = await supabase
        .from("dream_purchases")
        .select("*")
        .eq("dream_profile_id", profile.primary_dream_id)
        .eq("is_selected", true);

      // Get trades from last 30 days with dates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: trades } = await supabase
        .from("trades")
        .select("profit, trade_date")
        .eq("user_id", user.id)
        .gte("trade_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("trade_date", { ascending: true });

      const monthlyProfit = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;
      const totalMonthlyCost = purchases?.reduce((sum, p) => sum + calculateMonthlyCost(p), 0) || 0;

      // Build cumulative daily data
      const dailyMap: Record<string, number> = {};
      trades?.forEach(t => {
        const d = t.trade_date;
        dailyMap[d] = (dailyMap[d] || 0) + (t.profit || 0);
      });

      // Fill in all 30 days
      const dailyData: { date: string; cumulative: number }[] = [];
      let cumulative = 0;
      for (let i = 30; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        cumulative += dailyMap[key] || 0;
        dailyData.push({
          date: key.slice(5), // MM-DD
          cumulative,
        });
      }

      setDreamData({
        monthlyProfit,
        totalMonthlyCost,
        dreamTitle: dreamProfile?.title || null,
        dailyData,
      });
      setLoading(false);
    };

    fetchDreamProgress();

    const tradesChannel = supabase
      .channel('trades-progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trades' }, () => fetchDreamProgress())
      .subscribe();

    const purchasesChannel = supabase
      .channel('purchases-progress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dream_purchases' }, () => fetchDreamProgress())
      .subscribe();

    return () => {
      supabase.removeChannel(tradesChannel);
      supabase.removeChannel(purchasesChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="h-[80px] bg-muted/50 rounded-lg animate-pulse" />
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
        <div className="h-[80px] bg-muted/20 rounded-lg flex items-center justify-center">
          <span className="text-xs text-muted-foreground">No dream data yet</span>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min(100, (dreamData.monthlyProfit / dreamData.totalMonthlyCost) * 100);
  const remaining = Math.max(0, dreamData.totalMonthlyCost - dreamData.monthlyProfit);
  const goalValue = dreamData.totalMonthlyCost;
  const lineColor = progressPercent >= 100 ? "hsl(var(--success))" : "hsl(var(--primary))";

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <img src={tlIcon} alt="TL" className="w-5 h-5 object-contain" />
          <span className="text-muted-foreground">Dream Achievement</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            ${remaining.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo to goal
          </span>
          <span className="font-semibold text-primary">{Math.round(progressPercent)}%</span>
        </div>
      </div>
      <div className="h-[80px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dreamData.dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="dreamGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['auto', 'auto']} />
            <XAxis dataKey="date" hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Cumulative']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            {goalValue > 0 && (
              <ReferenceLine
                y={goalValue}
                stroke="hsl(var(--success))"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{ value: `Goal: $${goalValue.toFixed(0)}`, position: 'right', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="none"
              fill="url(#dreamGradient)"
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: lineColor }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
