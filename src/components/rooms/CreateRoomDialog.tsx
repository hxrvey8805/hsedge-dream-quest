import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Shield, Eye, BarChart3 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onCreated: () => void;
}

const PRIVACY_OPTIONS = [
  { value: "pnl_only", label: "P&L Only", desc: "Members see daily profit/loss only", icon: Shield },
  { value: "pnl_winrate", label: "P&L + Win Rate", desc: "P&L, win rate, and trade count", icon: Eye },
  { value: "full_transparency", label: "Full Transparency", desc: "P&L, trades, symbols, and win rate", icon: BarChart3 },
];

const ACCESS_OPTIONS = [
  { value: "invite_code", label: "Invite Code", desc: "Anyone with the code can join instantly" },
  { value: "approval", label: "Approval Required", desc: "You approve or deny join requests" },
];

export const CreateRoomDialog = ({ open, onOpenChange, userId, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("pnl_only");
  const [access, setAccess] = useState("invite_code");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("trading_rooms").insert({
      creator_id: userId,
      name: name.trim(),
      description: description.trim() || null,
      privacy_level: privacy,
      access_mode: access,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to create room");
    } else {
      toast.success("Room created!");
      setName("");
      setDescription("");
      onOpenChange(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Create Trading Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Room Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Wolf Pack"
              className="bg-muted/10 border-border/30"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Description (optional)</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this room about?"
              className="bg-muted/10 border-border/30 resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 block">Privacy Level</label>
            <div className="grid gap-2">
              {PRIVACY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPrivacy(opt.value)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                    privacy === opt.value
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/20 hover:border-border/40 bg-muted/5"
                  }`}
                >
                  <opt.icon className={`h-4 w-4 shrink-0 ${privacy === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3 block">Access Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {ACCESS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setAccess(opt.value)}
                  className={`p-3 rounded-lg border transition-all text-left ${
                    access === opt.value
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/20 hover:border-border/40 bg-muted/5"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{opt.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreate}
            disabled={!name.trim() || loading}
            className="w-full premium-button"
          >
            {loading ? "Creating..." : "Create Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
