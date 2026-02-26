import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { format, subDays } from "date-fns";
import type { Goal, HabitLog } from "@/pages/Goals";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
}

export const GoalPerformanceChart = ({ goals, habitLogs }: Props) => {
  const trackedGoals = goals.filter(g => g.category === "Implement" || g.category === "Avoid");

  const data = useMemo(() => {
    const points = [];
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayLogs = habitLogs.filter(l => l.log_date === date && l.is_completed);
      const rate = trackedGoals.length > 0 ? Math.round((dayLogs.length / trackedGoals.length) * 100) : 0;
      points.push({ day: format(subDays(new Date(), i), "MMM d"), score: rate });
    }
    return points;
  }, [habitLogs, trackedGoals]);

  const currentScore = data.length > 0 ? data[data.length - 1].score : 0;

  return (
    <div className="hud-glass rounded-xl overflow-hidden">
      <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Goal Performance Analysis</h3>
        <span className="text-lg font-bold text-success hud-neon-text" style={{ textShadow: "0 0 8px hsl(var(--success) / 0.4)" }}>
          {currentScore}%
        </span>
      </div>

      <div className="p-4">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3, fill: "hsl(var(--primary))", stroke: "hsl(var(--primary))", strokeWidth: 1 }}
                activeDot={{ r: 5, fill: "hsl(var(--primary))", stroke: "hsl(var(--primary-foreground))", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
