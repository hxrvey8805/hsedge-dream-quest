import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Clock, Save } from "lucide-react";

interface CreatePlaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const sessions = ["Pre-Market", "Market Open", "Mid-Day", "Power Hour", "After Hours"];

export function CreatePlaybookDialog({ open, onOpenChange, onCreated }: CreatePlaybookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    entry_rules: "",
    exit_rules: "",
    time_window_start: "",
    time_window_end: "",
    session: "",
  });

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Playbook name is required");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("playbooks").insert({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        entry_rules: form.entry_rules.trim() || null,
        exit_rules: form.exit_rules.trim() || null,
        time_window_start: form.time_window_start || null,
        time_window_end: form.time_window_end || null,
        session: form.session || null,
      });

      if (error) throw error;

      toast.success("Playbook created!");
      setForm({ name: "", description: "", entry_rules: "", exit_rules: "", time_window_start: "", time_window_end: "", session: "" });
      onOpenChange(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.message || "Failed to create playbook");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Create New Playbook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Playbook Name *</Label>
            <Input
              placeholder="e.g. Morning Momentum Scalp"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Describe the overall strategy and when to use it..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-secondary/50 border-border min-h-[80px]"
            />
          </div>

          {/* Time & Session row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Window Start
              </Label>
              <Input
                type="time"
                value={form.time_window_start}
                onChange={(e) => setForm({ ...form, time_window_start: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Window End
              </Label>
              <Input
                type="time"
                value={form.time_window_end}
                onChange={(e) => setForm({ ...form, time_window_end: e.target.value })}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Session</Label>
              <Select value={form.session} onValueChange={(v) => setForm({ ...form, session: v })}>
                <SelectTrigger className="bg-secondary/50 border-border">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entry Rules */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-success">Entry Rules</Label>
            <Textarea
              placeholder="Define your entry conditions...&#10;• Price above VWAP&#10;• Volume spike > 2x average&#10;• Pullback to EMA 9"
              value={form.entry_rules}
              onChange={(e) => setForm({ ...form, entry_rules: e.target.value })}
              className="bg-secondary/50 border-border min-h-[100px] font-mono text-sm"
            />
          </div>

          {/* Exit Rules */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-destructive">Exit Rules</Label>
            <Textarea
              placeholder="Define your exit conditions...&#10;• Target: 2R&#10;• Stop: Below entry candle low&#10;• Trail stop after 1R"
              value={form.exit_rules}
              onChange={(e) => setForm({ ...form, exit_rules: e.target.value })}
              className="bg-secondary/50 border-border min-h-[100px] font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Playbook"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
