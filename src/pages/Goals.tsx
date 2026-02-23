import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Plus, X, ChevronDown, ChevronRight, Flame, TrendingUp, DollarSign, Trophy, Sparkles } from "lucide-react";
import { HabitTracker } from "@/components/goals/HabitTracker";
import { toast } from "sonner";
import logo from "@/assets/tp-logo.png";
import { motion, AnimatePresence } from "framer-motion";

interface Goal {
  id: string;
  category: string;
  text: string;
  is_completed: boolean;
}

const Goals = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Learn");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Learn", "Implement", "Backtest", "Avoid"]));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("goals_checklist")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) setGoals(data);
  };




  const toggleGoal = async (goalId: string, currentState: boolean) => {
    const { error } = await supabase
      .from("goals_checklist")
      .update({ is_completed: !currentState })
      .eq("id", goalId);

    if (!error) fetchGoals();
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    const { error } = await supabase
      .from("goals_checklist")
      .insert({ user_id: user.id, category: newGoalCategory, text: newGoalText });

    if (!error) {
      setNewGoalText("");
      fetchGoals();
      toast.success("Goal added!");
    }
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from("goals_checklist")
      .delete()
      .eq("id", goalId);

    if (!error) fetchGoals();
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categories = ["Learn", "Implement", "Backtest", "Avoid"];
  const goalsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat);
    return acc;
  }, {} as Record<string, Goal[]>);

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.is_completed).length;
  const overallProgress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;




  if (!user) return null;

  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-primary/20 via-card to-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-primary/20 backdrop-blur">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Goals Progress</p>
                  <h1 className="text-4xl font-bold text-foreground">
                    {completedGoals} / {totalGoals} Complete
                  </h1>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{overallProgress.toFixed(0)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3 bg-primary/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Goals Checklist */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  Trading Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((category, catIndex) => {
                  const categoryGoals = goalsByCategory[category];
                  const isExpanded = expandedCategories.has(category);
                  const completedCount = categoryGoals.filter(g => g.is_completed).length;
                  const categoryColors: Record<string, string> = {
                    "Learn": "blue",
                    "Implement": "emerald",
                    "Backtest": "purple",
                    "Avoid": "rose"
                  };
                  const color = categoryColors[category];
                  
                  return (
                    <motion.div 
                      key={category} 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: catIndex * 0.05 }}
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl bg-${color}-500/10 hover:bg-${color}-500/20 transition-all group`}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className={`h-4 w-4 text-${color}-500`} />
                          ) : (
                            <ChevronRight className={`h-4 w-4 text-${color}-500`} />
                          )}
                          <span className="font-semibold text-foreground">{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full bg-${color}-500/20 text-${color}-500`}>
                            {completedCount}/{categoryGoals.length}
                          </span>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 pl-4 overflow-hidden"
                          >
                            {categoryGoals.map((goal, index) => (
                              <motion.div 
                                key={goal.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="flex items-center gap-3 group p-3 rounded-lg hover:bg-accent/30 transition-all border border-transparent hover:border-border/50"
                              >
                                <Checkbox
                                  checked={goal.is_completed}
                                  onCheckedChange={() => toggleGoal(goal.id, goal.is_completed)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <span className={`flex-1 text-sm transition-all ${goal.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {goal.text}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => deleteGoal(goal.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            ))}
                            {categoryGoals.length === 0 && (
                              <p className="text-sm text-muted-foreground italic p-3">No goals in this category</p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
                
                <div className="flex gap-2 pt-4 border-t border-border/50">
                  <select
                    value={newGoalCategory}
                    onChange={(e) => setNewGoalCategory(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/50"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Add new goal..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGoal()}
                    className="text-sm"
                  />
                  <Button onClick={addGoal} size="icon" className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <HabitTracker goals={goals} />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Goals;
