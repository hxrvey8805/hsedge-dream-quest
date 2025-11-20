import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, DollarSign, TrendingUp, Flame } from "lucide-react";
import { toast } from "sonner";

interface Milestone {
  id: string;
  milestone_type: string;
  target_value: number;
  current_value: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case "profit_target": return DollarSign;
    case "trade_count": return Target;
    case "win_rate": return TrendingUp;
    case "streak": return Flame;
    default: return Target;
  }
};

const getMilestoneLabel = (type: string, value: number) => {
  switch (type) {
    case "profit_target": return `$${value} Profit`;
    case "trade_count": return `${value} Trades`;
    case "win_rate": return `${value}% Win Rate`;
    case "streak": return `${value} Day Streak`;
    default: return `${value}`;
  }
};

export const MilestonesTracker = () => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    const fetchMilestones = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("milestones")
        .select("*")
        .eq("user_id", user.id)
        .order("is_completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (data) {
        setMilestones(data);
      }
    };

    fetchMilestones();

    // Subscribe to milestone changes
    const channel = supabase
      .channel('milestones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'milestones'
        },
        () => fetchMilestones()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const activeMilestones = milestones.filter(m => !m.is_completed);
  const completedMilestones = milestones.filter(m => m.is_completed);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Milestones</h2>
          <p className="text-sm text-muted-foreground">
            {activeMilestones.length} active, {completedMilestones.length} completed
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Milestone
        </Button>
      </div>

      {activeMilestones.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Active Milestones
          </h3>
          {activeMilestones.map((milestone) => {
            const Icon = getMilestoneIcon(milestone.milestone_type);
            const progressPercent = (milestone.current_value / milestone.target_value) * 100;

            return (
              <Card key={milestone.id} className="p-4 bg-gradient-to-r from-card to-primary/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {getMilestoneLabel(milestone.milestone_type, milestone.target_value)}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {milestone.current_value.toFixed(0)}/{milestone.target_value}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(progressPercent)}% complete
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {completedMilestones.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Completed
          </h3>
          {completedMilestones.slice(0, 3).map((milestone) => {
            const Icon = getMilestoneIcon(milestone.milestone_type);

            return (
              <Card key={milestone.id} className="p-3 bg-success/5 border-success/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Icon className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {getMilestoneLabel(milestone.milestone_type, milestone.target_value)}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Completed {new Date(milestone.completed_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-success text-lg">✓</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {milestones.length === 0 && (
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No milestones yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first milestone to track your goals</p>
        </div>
      )}
    </Card>
  );
};
