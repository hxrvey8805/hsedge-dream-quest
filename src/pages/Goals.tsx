import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoalsProgressHeader } from "@/components/goals/GoalsProgressHeader";
import { GoalsCategoriesCard } from "@/components/goals/GoalsCategoriesCard";
import { WeeklyConsistencyCard } from "@/components/goals/WeeklyConsistencyCard";
import { GoalPerformanceChart } from "@/components/goals/GoalPerformanceChart";
import { GoalsAnalyticsRow } from "@/components/goals/GoalsAnalyticsRow";
import { motion } from "framer-motion";

export interface Goal {
  id: string;
  category: string;
  text: string;
  is_completed: boolean;
}

export interface HabitLog {
  id: string;
  goal_id: string;
  log_date: string;
  is_completed: boolean;
}

const Goals = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
      else navigate("/auth");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchHabitLogs();
    }
  }, [user]);

  const fetchGoals = async () => {
    const { data } = await supabase
      .from("goals_checklist")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setGoals(data);
  };

  const fetchHabitLogs = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const { data } = await supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("log_date", startDate.toISOString().split("T")[0]);
    if (data) setHabitLogs(data as HabitLog[]);
  };

  const toggleGoal = async (goalId: string, currentState: boolean) => {
    await supabase.from("goals_checklist").update({ is_completed: !currentState }).eq("id", goalId);
    fetchGoals();
  };

  const addGoal = async (category: string, text: string) => {
    if (!text.trim()) return;
    await supabase.from("goals_checklist").insert({ user_id: user.id, category, text });
    fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    await supabase.from("goals_checklist").delete().eq("id", goalId);
    fetchGoals();
  };

  const toggleHabit = async (goalId: string, dateStr: string) => {
    const existing = habitLogs.find(l => l.goal_id === goalId && l.log_date === dateStr);
    if (existing) {
      if (existing.is_completed) {
        await supabase.from("habit_logs").delete().eq("id", existing.id);
      } else {
        await supabase.from("habit_logs").update({ is_completed: true }).eq("id", existing.id);
      }
    } else {
      await supabase.from("habit_logs").insert({ user_id: user.id, goal_id: goalId, log_date: dateStr, is_completed: true });
    }
    fetchHabitLogs();
  };

  if (!user) return null;

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[200px] right-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px] pointer-events-none" />

      <main className="container mx-auto px-4 py-8 max-w-[1400px] relative z-10">
        <div className="flex flex-col gap-6">
          {/* Row 1: Progress Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GoalsProgressHeader goals={goals} habitLogs={habitLogs} />
          </motion.div>

          {/* Row 2: Categories + Weekly Consistency */}
          <div className="grid lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <GoalsCategoriesCard
                goals={goals}
                habitLogs={habitLogs}
                onToggle={toggleGoal}
                onAdd={addGoal}
                onDelete={deleteGoal}
              />
            </motion.div>

            <div className="flex flex-col gap-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <WeeklyConsistencyCard goals={goals} habitLogs={habitLogs} onToggleHabit={toggleHabit} />
              </motion.div>

              {/* Row 3: Performance Chart */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <GoalPerformanceChart goals={goals} habitLogs={habitLogs} />
              </motion.div>
            </div>
          </div>

          {/* Row 4: Analytics Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GoalsAnalyticsRow goals={goals} habitLogs={habitLogs} />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
