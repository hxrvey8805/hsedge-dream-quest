import { useMemo } from "react";
import { format, subDays } from "date-fns";
import type { Goal, HabitLog } from "@/pages/Goals";

interface Props {
  goals: Goal[];
  habitLogs: HabitLog[];
  onToggleHabit: (goalId: string, dateStr: string) => void;
}

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

export const WeeklyConsistencyCard = ({ goals, habitLogs, onToggleHabit }: Props) => {
  const trackedGoals = goals.filter(g => g.category === "Implement" || g.category === "Avoid");

  // Get last 5 weekdays + today
  const days = useMemo(() => {
    const result = [];
    let d = new Date();
    // Go back to find 5 weekdays
    for (let i = 5; i >= 0; i--) {
      result.push(subDays(new Date(), i));
    }
    return result.slice(-6);
  }, []);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const isChecked = (goalId: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return habitLogs.some(l => l.goal_id === goalId && l.log_date === dateStr && l.is_completed);
  };

  // Daily completion percentages
  const dailyRates = days.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const completed = trackedGoals.filter(g =>
      habitLogs.some(l => l.goal_id === g.id && l.log_date === dateStr && l.is_completed)
    ).length;
    return trackedGoals.length > 0 ? Math.round((completed / trackedGoals.length) * 100) : 0;
  });

  const avgRate = dailyRates.length > 0 ? Math.round(dailyRates.reduce((s, v) => s + v, 0) / dailyRates.length) : 0;

  return (
    <div className="hud-glass rounded-xl overflow-hidden">
      <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Weekly Consistency</h3>
        <span className="text-lg font-bold text-success hud-neon-text" style={{ textShadow: "0 0 8px hsl(var(--success) / 0.4)" }}>
          {avgRate}%
        </span>
      </div>

      <div className="p-4">
        {trackedGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Add Implement or Avoid goals to track consistency</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium pb-3 pr-3 min-w-[140px]" />
                  {days.map((day, i) => {
                    const isToday = format(day, "yyyy-MM-dd") === todayStr;
                    return (
                      <th key={i} className="text-center pb-3 px-1 min-w-[40px]">
                        <span className={`text-[10px] uppercase tracking-wider font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                          {isToday ? "TODAY" : format(day, "EEE").toUpperCase()}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {trackedGoals.map(goal => (
                  <tr key={goal.id} className="hover:bg-muted/10 transition-colors">
                    <td className="text-xs text-foreground/80 py-2.5 pr-3 truncate max-w-[160px]">{goal.text}</td>
                    {days.map((day, i) => {
                      const checked = isChecked(goal.id, day);
                      const isToday = format(day, "yyyy-MM-dd") === todayStr;
                      return (
                        <td key={i} className="text-center py-2.5 px-1">
                          <button
                            onClick={() => onToggleHabit(goal.id, format(day, "yyyy-MM-dd"))}
                            className="mx-auto block"
                          >
                            <div className={`w-3.5 h-3.5 rounded-full mx-auto transition-all ${
                              checked
                                ? "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]"
                                : isToday
                                  ? "bg-primary/30 shadow-[0_0_6px_hsl(var(--primary)/0.3)] hud-dot-pulse"
                                  : "bg-muted/30"
                            }`} />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Daily percentages */}
            <div className="flex items-center mt-3 pt-3 border-t border-border/15">
              <div className="min-w-[140px] pr-3" />
              {dailyRates.map((rate, i) => (
                <div key={i} className="flex-1 text-center">
                  <span className={`text-[10px] font-medium ${rate >= 70 ? "text-success" : rate >= 40 ? "text-warning" : "text-destructive"}`}>
                    {rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
