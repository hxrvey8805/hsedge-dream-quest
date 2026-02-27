import { useMemo } from "react";
import { Target, Flame } from "lucide-react";
import type { Goal, HabitLog } from "@/pages/Goals";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
}

export const GoalsProgressHeader = ({ goals, habitLogs }: Props) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.is_completed).length;
  const progressPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Weekly streak calculation
  const trackedGoals = goals.filter(g => g.category === "Implement" || g.category === "Avoid");
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayLogs = habitLogs.filter(l => l.log_date === date && l.is_completed);
      const rate = trackedGoals.length > 0 ? Math.round((dayLogs.length / trackedGoals.length) * 100) : 0;
      data.push({ day: date, value: rate });
    }
    return data;
  }, [habitLogs, trackedGoals]);

  const avgStreak = weeklyData.length > 0
    ? Math.round(weeklyData.reduce((s, d) => s + d.value, 0) / weeklyData.length)
    : 0;

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="hud-glass rounded-xl p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Progress Ring */}
        <div className="relative shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.3" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 50 50)"
              style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))", transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary hud-neon-text">{progressPercent}%</span>
          </div>
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Goals Progress</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {completedGoals} / {totalGoals} <span className="text-muted-foreground text-lg font-normal">Active Goals</span>
          </h2>
          <div className="mt-3 h-2 rounded-full bg-muted/30 border border-muted-foreground/15 overflow-hidden max-w-md">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%`, boxShadow: "0 0 12px hsl(var(--primary) / 0.5)" }}
            />
          </div>
        </div>

        {/* Sparkline */}
        <div className="hidden sm:block w-32 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Streak */}
        <div className="text-center shrink-0">
          <div className="flex items-center gap-1 justify-center mb-1">
            <Flame className="h-4 w-4 text-success" />
          </div>
          <span className="text-3xl font-bold text-success hud-neon-text" style={{ textShadow: "0 0 10px hsl(var(--success) / 0.4)" }}>
            {avgStreak}%
          </span>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1">Streak</p>
        </div>
      </div>
    </div>
  );
};
