import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Users, Key, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreateRoomDialog } from "@/components/rooms/CreateRoomDialog";
import { JoinRoomDialog } from "@/components/rooms/JoinRoomDialog";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomDetailView } from "@/components/rooms/RoomDetailView";

export interface TradingRoom {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  privacy_level: string;
  access_mode: string;
  invite_code: string;
  is_active: boolean;
  created_at: string;
}

export interface RoomMember {
  id: string;
  room_id: string;
  user_id: string;
  status: string;
  joined_at: string;
}

export interface RoomRace {
  id: string;
  room_id: string;
  created_by: string;
  name: string;
  target_amount: number;
  start_date: string;
  is_active: boolean;
}

const TradingRooms = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [rooms, setRooms] = useState<TradingRoom[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<TradingRoom | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
      else navigate("/auth");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchRooms = useCallback(async () => {
    if (!user) return;
    // Fetch rooms user created
    const { data: createdRooms } = await supabase
      .from("trading_rooms")
      .select("*")
      .eq("creator_id", user.id)
      .eq("is_active", true);

    // Fetch rooms user is a member of
    const { data: memberships } = await supabase
      .from("room_members")
      .select("room_id")
      .eq("user_id", user.id)
      .eq("status", "approved");

    let memberRooms: TradingRoom[] = [];
    if (memberships && memberships.length > 0) {
      const roomIds = memberships.map(m => m.room_id);
      const { data } = await supabase
        .from("trading_rooms")
        .select("*")
        .in("id", roomIds)
        .eq("is_active", true);
      if (data) memberRooms = data as TradingRoom[];
    }

    const allRooms = [...(createdRooms || []), ...memberRooms].filter(
      (room, index, self) => index === self.findIndex(r => r.id === room.id)
    ) as TradingRoom[];
    
    setRooms(allRooms);

    // Get member counts
    const counts: Record<string, number> = {};
    for (const room of allRooms) {
      const { count } = await supabase
        .from("room_members")
        .select("*", { count: "exact", head: true })
        .eq("room_id", room.id)
        .eq("status", "approved");
      counts[room.id] = (count || 0) + 1; // +1 for creator
    }
    setMemberCounts(counts);
  }, [user]);

  useEffect(() => {
    if (user) fetchRooms();
  }, [user, fetchRooms]);

  if (!user) return null;

  if (selectedRoom) {
    return (
      <RoomDetailView
        room={selectedRoom}
        userId={user.id}
        onBack={() => { setSelectedRoom(null); fetchRooms(); }}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="container mx-auto px-4 py-8 max-w-[1400px] relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Social Trading</p>
              <h1 className="text-3xl font-bold text-foreground">Trading Rooms</h1>
              <p className="text-sm text-muted-foreground mt-1">Connect with traders, track P&L, and race to targets</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setJoinOpen(true)}
                className="border-border/40 hover:bg-muted/20"
              >
                <Key className="h-4 w-4 mr-2" />
                Join Room
              </Button>
              <Button
                onClick={() => setCreateOpen(true)}
                className="premium-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Room
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hud-glass rounded-xl p-16 text-center"
          >
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Rooms Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Create a trading room to start competing with friends, or join one with an invite code.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setJoinOpen(true)} className="border-border/40">
                <Key className="h-4 w-4 mr-2" /> Join with Code
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="premium-button">
                <Plus className="h-4 w-4 mr-2" /> Create Room
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RoomCard
                  room={room}
                  memberCount={memberCounts[room.id] || 1}
                  isCreator={room.creator_id === user.id}
                  onClick={() => setSelectedRoom(room)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <CreateRoomDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={user.id}
        onCreated={fetchRooms}
      />
      <JoinRoomDialog
        open={joinOpen}
        onOpenChange={setJoinOpen}
        userId={user.id}
        onJoined={fetchRooms}
      />
    </div>
  );
};

export default TradingRooms;
