import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Dot } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";

interface Trade {
  trade_date: string;
  profit: number | null;
}

interface EquityPoint {
  date: string;
  cumulative: number;
  isToday: boolean;
  index?: number;
}

const chartConfig = {
  cumulative: {
    label: "Cumulative P&L",
    color: "hsl(var(--primary))",
  },
};

interface EquityCurveProps {
  refreshTrigger?: number;
}

export const EquityCurve = ({ refreshTrigger }: EquityCurveProps) => {
  const [data, setData] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquityData();
  }, [refreshTrigger]);

  const fetchEquityData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: trades, error } = await supabase
      .from("trades")
      .select("trade_date, profit")
      .eq("user_id", user.id)
      .order("trade_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch trades", error);
      setLoading(false);
      return;
    }

    if (trades && trades.length > 0) {
      let cumulative = 0;
      const equityPoints: EquityPoint[] = trades.map((trade: Trade, index: number) => {
        cumulative += trade.profit || 0;
        const date = parseISO(trade.trade_date);
        return {
          date: format(date, "MMM d"),
          cumulative: parseFloat(cumulative.toFixed(2)),
          isToday: isToday(date),
          index,
        };
      });

      setData(equityPoints);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Equity Curve</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Equity Curve</h3>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No trading data yet</p>
        </div>
      </Card>
    );
  }

  // Find today's point
  const todayIndex = data.findIndex((point) => point.isToday);
  const todayValue = todayIndex >= 0 ? data[todayIndex].cumulative : data[data.length - 1]?.cumulative || 0;

  // Custom dot component for today's point with glow effect
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        {/* Outer glow */}
        <circle
          cx={cx}
          cy={cy}
          r="8"
          fill="hsl(var(--primary))"
          opacity="0.2"
          className="animate-pulse"
        />
        {/* Middle glow */}
        <circle
          cx={cx}
          cy={cy}
          r="5"
          fill="hsl(var(--primary))"
          opacity="0.4"
        />
        {/* Main point */}
        <circle
          cx={cx}
          cy={cy}
          r="3"
          fill="hsl(var(--primary))"
          style={{
            filter: "drop-shadow(0 0 6px hsl(var(--primary)))",
          }}
        />
      </g>
    );
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Equity Curve</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className={`text-lg font-bold ${todayValue >= 0 ? 'text-success' : 'text-destructive'}`}>
            ${todayValue >= 0 ? '+' : ''}{todayValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="h-32 w-full">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const value = payload[0].value as number;
                    return (
                      <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm font-medium">
                            ${value >= 0 ? '+' : ''}{value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={(props: any) => {
                  // props.payload is the data point
                  if (props.payload?.isToday) {
                    return <CustomActiveDot {...props} />;
                  }
                  return null;
                }}
                activeDot={(props: any) => {
                  if (props.payload?.isToday) {
                    return <CustomActiveDot {...props} />;
                  }
                  return <Dot {...props} r={3} fill="hsl(var(--primary))" />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </Card>
  );
};

