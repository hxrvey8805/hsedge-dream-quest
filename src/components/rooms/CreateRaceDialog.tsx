import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  onCreated: () => void;
}

export const CreateRaceDialog = ({ open, onOpenChange, roomId, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const amount = parseFloat(target);
    if (!name.trim() || isNaN(amount) || amount <= 0) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("room_races").insert({
      room_id: roomId,
      created_by: user!.id,
      name: name.trim(),
      target_amount: amount,
    });
    setLoading(false);

    if (error) {
      toast.error("Failed to create race");
    } else {
      toast.success("Race started! 🏁");
      setName("");
      setTarget("");
      onOpenChange(false);
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" /> Create a Race
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Race Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. First to $1,000"
              className="bg-muted/10 border-border/30"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Target Amount ($)</label>
            <Input
              type="number"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="1000"
              className="bg-muted/10 border-border/30"
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || !target || loading}
            className="w-full premium-button"
          >
            {loading ? "Starting..." : "Start Race 🏁"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
