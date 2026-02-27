import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onJoined: () => void;
}

export const JoinRoomDialog = ({ open, onOpenChange, userId, onJoined }: Props) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);

    // Look up room by invite code
    const { data: rooms, error: lookupError } = await supabase
      .rpc("find_room_by_invite_code", { code: code.trim() });

    if (lookupError || !rooms || rooms.length === 0) {
      toast.error("Room not found. Check your invite code.");
      setLoading(false);
      return;
    }

    const room = rooms[0];

    // Check if already a member
    const { data: existing } = await supabase
      .from("room_members")
      .select("id")
      .eq("room_id", room.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      toast.info("You're already in this room!");
      setLoading(false);
      onOpenChange(false);
      return;
    }

    // Check if user is the creator
    if (room.creator_id === userId) {
      toast.info("You created this room!");
      setLoading(false);
      onOpenChange(false);
      return;
    }

    const status = room.access_mode === "approval" ? "pending" : "approved";
    const { error } = await supabase.from("room_members").insert({
      room_id: room.id,
      user_id: userId,
      status,
    });

    setLoading(false);
    if (error) {
      toast.error("Failed to join room");
    } else {
      toast.success(status === "pending" ? "Request sent! Waiting for approval." : `Joined "${room.name}"!`);
      setCode("");
      onOpenChange(false);
      onJoined();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/30 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">Join a Trading Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 block">Invite Code</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Enter invite code..."
                className="bg-muted/10 border-border/30 pl-10"
                onKeyDown={e => { if (e.key === "Enter") handleJoin(); }}
              />
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!code.trim() || loading}
            className="w-full premium-button"
          >
            {loading ? "Joining..." : "Join Room"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
