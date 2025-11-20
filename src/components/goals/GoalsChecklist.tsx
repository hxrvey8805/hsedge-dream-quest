import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Target, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  category: string;
  text: string;
  is_completed: boolean;
}

export const GoalsChecklist = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Learn");
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("goals_checklist")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      toast({ title: "Error fetching goals", variant: "destructive" });
      return;
    }

    setGoals(data || []);
  };

  const toggleGoal = async (goalId: string, currentState: boolean) => {
    const { error } = await supabase
      .from("goals_checklist")
      .update({ is_completed: !currentState })
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error updating goal", variant: "destructive" });
      return;
    }

    fetchGoals();
  };

  const addGoal = async () => {
    if (!newGoalText.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("goals_checklist")
      .insert({ user_id: user.id, category: newGoalCategory, text: newGoalText });

    if (error) {
      toast({ title: "Error adding goal", variant: "destructive" });
      return;
    }

    setNewGoalText("");
    fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from("goals_checklist")
      .delete()
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error deleting goal", variant: "destructive" });
      return;
    }

    fetchGoals();
  };

  const categories = ["Learn", "Implement", "Backtest", "Avoid"];
  const goalsByCategory = categories.reduce((acc, cat) => {
    acc[cat] = goals.filter(g => g.category === cat);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          GOALS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <span className="text-muted-foreground">≡</span> {category}
            </h3>
            <div className="space-y-2 pl-6">
              {goalsByCategory[category].map(goal => (
                <div key={goal.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={goal.is_completed}
                    onCheckedChange={() => toggleGoal(goal.id, goal.is_completed)}
                  />
                  <span className={goal.is_completed ? "line-through text-muted-foreground" : ""}>
                    {goal.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="flex gap-2 pt-4">
          <select
            value={newGoalCategory}
            onChange={(e) => setNewGoalCategory(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background"
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
          />
          <Button onClick={addGoal} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
