import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, ClipboardList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface GamePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  viewOnly?: boolean;
}

interface GamePlanData {
  id?: string;
  market_bias: string;
  key_levels: string;
  watchlist: string;
  risk_notes: string;
  mental_notes: string;
}

export const GamePlanDialog = ({ open, onOpenChange, date, viewOnly = false }: GamePlanDialogProps) => {
  const [plan, setPlan] = useState<GamePlanData>({
    market_bias: "",
    key_levels: "",
    watchlist: "",
    risk_notes: "",
    mental_notes: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && date) {
      loadPlan();
    }
  }, [open, date]);

  const loadPlan = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("daily_game_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_date", format(date, "yyyy-MM-dd"))
      .maybeSingle();

    if (data) {
      setPlan({
        id: data.id,
        market_bias: data.market_bias || "",
        key_levels: data.key_levels || "",
        watchlist: data.watchlist || "",
        risk_notes: data.risk_notes || "",
        mental_notes: data.mental_notes || "",
      });
    } else {
      setPlan({ market_bias: "", key_levels: "", watchlist: "", risk_notes: "", mental_notes: "" });
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Not logged in"); setIsSaving(false); return; }

    try {
      const { error } = await supabase
        .from("daily_game_plans")
        .upsert({
          id: plan.id || undefined,
          user_id: user.id,
          plan_date: format(date, "yyyy-MM-dd"),
          market_bias: plan.market_bias || null,
          key_levels: plan.key_levels || null,
          watchlist: plan.watchlist || null,
          risk_notes: plan.risk_notes || null,
          mental_notes: plan.mental_notes || null,
        }, { onConflict: "user_id,plan_date" });

      if (error) throw error;
      toast.success("Game plan saved!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { key: "market_bias" as const, label: "Market Bias", placeholder: "Bullish / Bearish / Neutral — What's your read on the market today?" },
    { key: "watchlist" as const, label: "Watchlist", placeholder: "Symbols you're watching today (e.g. EURUSD, AAPL, NQ)" },
    { key: "key_levels" as const, label: "Key Levels", placeholder: "Support/resistance levels, POIs, zones to watch" },
    { key: "risk_notes" as const, label: "Risk Management", placeholder: "Max loss, position sizing rules, stop placement notes" },
    { key: "mental_notes" as const, label: "Mental Game", placeholder: "How are you feeling? Any rules to keep in mind today?" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {viewOnly ? "Game Plan" : "Daily Game Plan"}
              </h2>
              <p className="text-sm text-muted-foreground">{format(date, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>
          {!viewOnly && (
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {field.label}
                </Label>
                {viewOnly ? (
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-sm min-h-[60px] whitespace-pre-wrap">
                    {plan[field.key] || <span className="text-muted-foreground italic">Not set</span>}
                  </div>
                ) : (
                  <Textarea
                    value={plan[field.key]}
                    onChange={(e) => setPlan(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="min-h-[70px] resize-none"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
