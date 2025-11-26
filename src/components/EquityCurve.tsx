import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Dot } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";

interface Trade {
  trade_date: string;
  profit: number | null;
  pips: number | null;
}

interface EquityPoint {
  date: string;
  cumulative: number;
  isToday: boolean;
  index?: number;
}

interface EquityCurveProps {
  refreshTrigger?: number;
  viewMode?: 'pips' | 'profit';
}

export const EquityCurve = ({ refreshTrigger, viewMode = 'profit' }: EquityCurveProps) => {
  const [data, setData] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const chartConfig = {
    cumulative: {
      label: viewMode === 'pips' ? "Cumulative Pips" : "Cumulative P&L",
      color: "hsl(var(--primary))",
    },
  };

  useEffect(() => {
    fetchEquityData();
  }, [refreshTrigger, viewMode]);

  const fetchEquityData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: trades, error } = await supabase
      .from("trades")
      .select("trade_date, profit, pips")
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
        const value = viewMode === 'pips' ? (trade.pips || 0) : (trade.profit || 0);
        cumulative += value;
        const date = parseISO(trade.trade_date);
        return {
          date: format(date, "MMM d"),
          cumulative: viewMode === 'pips' 
            ? parseFloat(cumulative.toFixed(1)) 
            : parseFloat(cumulative.toFixed(2)),
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
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Equity Curve</h3>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Equity Curve</h3>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">No trading data yet</p>
        </div>
      </div>
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
    <div className="flex-1 mt-auto pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Equity Curve</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current</p>
          <p className={`text-sm font-bold ${todayValue >= 0 ? 'text-success' : 'text-destructive'}`}>
            {viewMode === 'pips' 
              ? `${todayValue >= 0 ? '+' : ''}${todayValue.toFixed(1)} pips`
              : `$${todayValue >= 0 ? '+' : ''}${todayValue.toFixed(2)}`
            }
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
                            {viewMode === 'pips'
                              ? `${value >= 0 ? '+' : ''}${value.toFixed(1)} pips`
                              : `$${value >= 0 ? '+' : ''}${value.toFixed(2)}`
                            }
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
    </div>
  );
};

