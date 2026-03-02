import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BookOpen, Save, Plus, X, Crosshair } from "lucide-react";

interface InlineSetup {
  name: string;
  description: string;
}

interface CreatePlaybookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreatePlaybookDialog({ open, onOpenChange, onCreated }: CreatePlaybookDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [documentationNotes, setDocumentationNotes] = useState("");
  const [setups, setSetups] = useState<InlineSetup[]>([]);
  const [newSetupName, setNewSetupName] = useState("");
  const [newSetupDesc, setNewSetupDesc] = useState("");

  const addSetup = () => {
    if (!newSetupName.trim()) return;
    setSetups(prev => [...prev, { name: newSetupName.trim(), description: newSetupDesc.trim() }]);
    setNewSetupName("");
    setNewSetupDesc("");
  };

  const removeSetup = (index: number) => {
    setSetups(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Playbook name is required");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: playbook, error } = await supabase.from("playbooks").insert({
        user_id: user.id,
        name: name.trim(),
        documentation_notes: documentationNotes.trim() || null,
      }).select("id").single();

      if (error) throw error;

      // Insert inline setups
      if (setups.length > 0 && playbook) {
        const setupRows = setups.map(s => ({
          user_id: user.id,
          playbook_id: playbook.id,
          name: s.name,
          description: s.description || null,
        }));
        await supabase.from("playbook_setups").insert(setupRows);
      }

      toast.success("Playbook added!");
      setName("");
      setDocumentationNotes("");
      setSetups([]);
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
            Add Playbook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Playbook Name *</Label>
            <Input
              placeholder="e.g. Morning Momentum Strategy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border"
            />
          </div>

          {/* Documentation Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Documentation Notes</Label>
            <Textarea
              placeholder="Add your strategy documentation, rules, notes, observations..."
              value={documentationNotes}
              onChange={(e) => setDocumentationNotes(e.target.value)}
              className="bg-secondary/50 border-border min-h-[100px] font-mono text-sm"
            />
          </div>

          {/* Inline Setups */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Crosshair className="h-3.5 w-3.5 text-primary" />
              Setups
            </Label>

            {setups.length > 0 && (
              <div className="space-y-2">
                {setups.map((s, i) => (
                  <div key={i} className="flex items-start justify-between gap-2 p-2.5 rounded-lg bg-secondary/20 border border-border">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.name}</p>
                      {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => removeSetup(i)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Setup name"
                value={newSetupName}
                onChange={(e) => setNewSetupName(e.target.value)}
                className="bg-secondary/50 border-border text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSetup())}
              />
              <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1" onClick={addSetup} disabled={!newSetupName.trim()}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            <Input
              placeholder="Setup description (optional)"
              value={newSetupDesc}
              onChange={(e) => setNewSetupDesc(e.target.value)}
              className="bg-secondary/50 border-border text-sm"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-5"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Add Playbook"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
