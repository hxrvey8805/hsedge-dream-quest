import { useMemo } from "react";
import { Trophy, AlertTriangle, TrendingDown, Activity } from "lucide-react";
import { format, subDays } from "date-fns";
import type { Goal, HabitLog } from "@/pages/Goals";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
}

export const GoalsAnalyticsRow = ({ goals, habitLogs }: Props) => {
  const analytics = useMemo(() => {
    const categories = ["Learn", "Implement", "Backtest", "Avoid"];
    const catStats = categories.map(cat => {
      const catGoals = goals.filter(g => g.category === cat);
      const completed = catGoals.filter(g => g.is_completed).length;
      const pct = catGoals.length > 0 ? Math.round((completed / catGoals.length) * 100) : 0;
      return { name: cat, pct, completed, total: catGoals.length };
    });

    const strongest = catStats.filter(c => c.total > 0).sort((a, b) => b.pct - a.pct)[0];
    const weakest = catStats.filter(c => c.total > 0).sort((a, b) => a.pct - b.pct)[0];

    // Most broken avoid rule
    const avoidGoals = goals.filter(g => g.category === "Avoid");
    let mostBroken = { text: "None", count: 0 };
    if (avoidGoals.length > 0) {
      // Check which avoid goal has fewest habit completions (most broken)
      const avoidStats = avoidGoals.map(g => {
        const completions = habitLogs.filter(l => l.goal_id === g.id && l.is_completed).length;
        return { text: g.text, incomplete: 7 - completions };
      });
      const worst = avoidStats.sort((a, b) => b.incomplete - a.incomplete)[0];
      if (worst) mostBroken = { text: worst.text, count: worst.incomplete };
    }

    // 30-day heatmap
    const heatmap = Array.from({ length: 30 }, (_, i) => {
      const date = format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
      const trackedGoals = goals.filter(g => g.category === "Implement" || g.category === "Avoid");
      const dayLogs = habitLogs.filter(l => l.log_date === date && l.is_completed);
      const rate = trackedGoals.length > 0 ? Math.round((dayLogs.length / trackedGoals.length) * 100) : 0;
      return rate;
    });

    const avgTrend = heatmap.length > 0 ? Math.round(heatmap.reduce((s, v) => s + v, 0) / heatmap.length) : 0;

    return { strongest, weakest, mostBroken, heatmap, avgTrend };
  }, [goals, habitLogs]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Strongest Area */}
      <AnalyticCard
        icon={<Trophy className="h-5 w-5 text-success" />}
        title="Strongest Area"
        value={analytics.strongest?.name ?? "—"}
        metric={`${analytics.strongest?.pct ?? 0}%`}
        metricColor="text-success"
        subtitle={`Completed Goals ${analytics.strongest?.pct ?? 0}%`}
        glowColor="success"
      />

      {/* Weakest Area */}
      <AnalyticCard
        icon={<TrendingDown className="h-5 w-5 text-destructive" />}
        title="Weakest Area"
        value={analytics.weakest?.name ?? "—"}
        metric={`${analytics.weakest?.pct ?? 0}%`}
        metricColor="text-destructive"
        subtitle={`Rules Followed ${analytics.weakest?.pct ?? 0}%`}
        glowColor="destructive"
      />

      {/* Most Broken Rule */}
      <AnalyticCard
        icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        title="Most Broken Rule"
        value={analytics.mostBroken.text.length > 20 ? analytics.mostBroken.text.slice(0, 20) + "…" : analytics.mostBroken.text}
        metric={`${analytics.mostBroken.count} times`}
        metricColor="text-destructive"
        subtitle=""
        glowColor="destructive"
      />

      {/* 30-Day Trend */}
      <div className="hud-glass rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">30 Day Trend</span>
        </div>
        <div className="flex gap-[2px] items-end h-8 mb-2">
          {analytics.heatmap.map((v, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-colors ${
                v >= 70 ? "bg-success/80" : v >= 40 ? "bg-warning/60" : v > 0 ? "bg-destructive/50" : "bg-muted/20"
              }`}
              style={{ height: `${Math.max(v, 8)}%` }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Avg</span>
          <span className="text-lg font-bold text-success hud-neon-text">{analytics.avgTrend}%</span>
        </div>
      </div>
    </div>
  );
};

const AnalyticCard = ({
  icon, title, value, metric, metricColor, subtitle, glowColor,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  metric: string;
  metricColor: string;
  subtitle: string;
  glowColor: string;
}) => (
  <div className="hud-glass rounded-xl p-4 relative overflow-hidden">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">{title}</span>
    </div>
    <p className="text-sm font-semibold text-foreground mb-1">{value}</p>
    <p className={`text-xl font-bold ${metricColor}`}>{metric}</p>
    {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);
