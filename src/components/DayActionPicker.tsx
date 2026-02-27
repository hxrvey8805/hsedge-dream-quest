import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ClipboardList, Plus, XCircle, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DayActionPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onLogTrade: () => void;
  onGamePlan: () => void;
  onNoTradeDay: () => void;
  onViewGamePlan: () => void;
}

export const DayActionPicker = ({
  open,
  onOpenChange,
  date,
  onLogTrade,
  onGamePlan,
  onNoTradeDay,
  onViewGamePlan,
}: DayActionPickerProps) => {
  const [hasGamePlan, setHasGamePlan] = useState(false);

  useEffect(() => {
    if (open && date) {
      checkGamePlan();
    }
  }, [open, date]);

  const checkGamePlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("daily_game_plans")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan_date", format(date, "yyyy-MM-dd"))
      .maybeSingle();
    setHasGamePlan(!!data);
  };

  const actions = [
    {
      label: "Daily Game Plan",
      description: hasGamePlan ? "Edit your game plan for this day" : "Plan your trading day ahead",
      icon: ClipboardList,
      onClick: onGamePlan,
      color: "text-blue-400",
      bg: "hover:bg-blue-500/10 hover:border-blue-500/30",
    },
    {
      label: "Log a Trade",
      description: "Record a new trade entry",
      icon: Plus,
      onClick: onLogTrade,
      color: "text-emerald-400",
      bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30",
    },
    {
      label: "No Trade Day",
      description: "Add a review without trades",
      icon: XCircle,
      onClick: onNoTradeDay,
      color: "text-amber-400",
      bg: "hover:bg-amber-500/10 hover:border-amber-500/30",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-2">
          <h2 className="text-lg font-bold">{format(date, "EEEE, MMMM d, yyyy")}</h2>
          <p className="text-sm text-muted-foreground">What would you like to do?</p>
        </div>

        <div className="p-4 space-y-2">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                onOpenChange(false);
                action.onClick();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border border-border/50 transition-all ${action.bg} cursor-pointer text-left`}
            >
              <div className={`p-2 rounded-lg bg-muted/50 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}

          {hasGamePlan && (
            <button
              onClick={() => {
                onOpenChange(false);
                onViewGamePlan();
              }}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer text-left"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">View Game Plan</p>
                <p className="text-xs text-muted-foreground">See your plan for this day</p>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
