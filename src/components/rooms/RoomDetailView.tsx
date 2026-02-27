import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Copy, Users, Trophy, Plus, Crown, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { TradingRoom, RoomMember, RoomRace } from "@/pages/TradingRooms";
import { CreateRaceDialog } from "./CreateRaceDialog";
import { RaceCard } from "./RaceCard";

interface Props {
  room: TradingRoom;
  userId: string;
  onBack: () => void;
}

interface MemberWithPnl {
  user_id: string;
  email: string;
  status: string;
  total_pnl: number;
  win_rate: number;
  trade_count: number;
  is_creator: boolean;
}

export const RoomDetailView = ({ room, userId, onBack }: Props) => {
  const [members, setMembers] = useState<MemberWithPnl[]>([]);
  const [races, setRaces] = useState<RoomRace[]>([]);
  const [pendingMembers, setPendingMembers] = useState<RoomMember[]>([]);
  const [raceOpen, setRaceOpen] = useState(false);
  const isCreator = room.creator_id === userId;

  const fetchData = useCallback(async () => {
    // Fetch members
    const { data: memberData } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", room.id);

    const allMemberIds = [room.creator_id, ...(memberData || []).filter(m => m.status === "approved").map(m => m.user_id)];
    const uniqueIds = [...new Set(allMemberIds)];

    // Fetch P&L for each member from trades
    const membersWithPnl: MemberWithPnl[] = [];
    for (const uid of uniqueIds) {
      const { data: trades } = await supabase
        .from("trades")
        .select("profit, outcome")
        .eq("user_id", uid);

      const totalPnl = trades?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;
      const wins = trades?.filter(t => t.outcome === "Win").length || 0;
      const tradeCount = trades?.length || 0;
      const winRate = tradeCount > 0 ? Math.round((wins / tradeCount) * 100) : 0;

      membersWithPnl.push({
        user_id: uid,
        email: uid === userId ? "You" : `Trader ${uid.slice(0, 6)}`,
        status: "approved",
        total_pnl: totalPnl,
        win_rate: winRate,
        trade_count: tradeCount,
        is_creator: uid === room.creator_id,
      });
    }

    // Sort by P&L descending
    membersWithPnl.sort((a, b) => b.total_pnl - a.total_pnl);
    setMembers(membersWithPnl);

    // Pending members
    if (isCreator) {
      setPendingMembers((memberData || []).filter(m => m.status === "pending") as RoomMember[]);
    }

    // Fetch races
    const { data: raceData } = await supabase
      .from("room_races")
      .select("*")
      .eq("room_id", room.id)
      .eq("is_active", true);
    if (raceData) setRaces(raceData as RoomRace[]);
  }, [room.id, room.creator_id, userId, isCreator]);

  useEffect(() => {
    fetchData();

    // Realtime subscription for live updates
    const channel = supabase
      .channel(`room-${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "room_members", filter: `room_id=eq.${room.id}` }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchData, room.id]);

  const handleApprove = async (memberId: string) => {
    await supabase.from("room_members").update({ status: "approved" }).eq("id", memberId);
    toast.success("Member approved!");
    fetchData();
  };

  const handleReject = async (memberId: string) => {
    await supabase.from("room_members").delete().eq("id", memberId);
    toast.success("Request rejected");
    fetchData();
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(room.invite_code);
    toast.success("Invite code copied!");
  };

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="container mx-auto px-4 py-8 max-w-[1400px] relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Rooms
          </button>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isCreator && <Crown className="h-4 w-4 text-warning" />}
                <h1 className="text-2xl font-bold text-foreground">{room.name}</h1>
              </div>
              {room.description && <p className="text-sm text-muted-foreground">{room.description}</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyInviteCode} className="border-border/40 hover:bg-muted/20">
                <Copy className="h-4 w-4 mr-2" />
                {room.invite_code}
              </Button>
              {isCreator && (
                <Button onClick={() => setRaceOpen(true)} className="premium-button">
                  <Trophy className="h-4 w-4 mr-2" /> New Race
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="hud-glass rounded-xl overflow-hidden">
              <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">Leaderboard</h3>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {members.length} traders
                </span>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="text-left pb-3 font-medium">#</th>
                      <th className="text-left pb-3 font-medium">Trader</th>
                      <th className="text-right pb-3 font-medium">P&L</th>
                      {(room.privacy_level === "pnl_winrate" || room.privacy_level === "full_transparency") && (
                        <th className="text-right pb-3 font-medium">Win Rate</th>
                      )}
                      {room.privacy_level === "full_transparency" && (
                        <th className="text-right pb-3 font-medium">Trades</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, i) => (
                      <tr key={member.user_id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 pr-3">
                          <span className={`text-sm font-bold ${i === 0 ? "text-warning" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-[hsl(25,70%,50%)]" : "text-muted-foreground/60"}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              member.user_id === userId ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground"
                            }`}>
                              {member.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-foreground">{member.email}</span>
                              {member.is_creator && <Crown className="inline h-3 w-3 text-warning ml-1" />}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`text-sm font-bold ${member.total_pnl >= 0 ? "text-success" : "text-destructive"}`}>
                            {member.total_pnl >= 0 ? "+" : ""}${member.total_pnl.toFixed(2)}
                          </span>
                        </td>
                        {(room.privacy_level === "pnl_winrate" || room.privacy_level === "full_transparency") && (
                          <td className="py-3 text-right">
                            <span className="text-sm text-muted-foreground">{member.win_rate}%</span>
                          </td>
                        )}
                        {room.privacy_level === "full_transparency" && (
                          <td className="py-3 text-right">
                            <span className="text-sm text-muted-foreground">{member.trade_count}</span>
                          </td>
                        )}
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-sm text-muted-foreground">No members yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Active Races */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <div className="hud-glass rounded-xl overflow-hidden">
                <div className="p-5 pb-3 border-b border-border/20 flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-warning" /> Active Races
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {races.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No active races</p>
                  ) : (
                    races.map(race => (
                      <RaceCard key={race.id} race={race} members={members} />
                    ))
                  )}
                </div>
              </div>
            </motion.div>

            {/* Pending Approvals */}
            {isCreator && pendingMembers.length > 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="hud-glass rounded-xl overflow-hidden">
                  <div className="p-5 pb-3 border-b border-border/20">
                    <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-warning" /> Pending Requests ({pendingMembers.length})
                    </h3>
                  </div>
                  <div className="p-4 space-y-2">
                    {pendingMembers.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                        <span className="text-sm text-foreground">Trader {m.user_id.slice(0, 6)}</span>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:bg-success/10" onClick={() => handleApprove(m.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleReject(m.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <CreateRaceDialog
        open={raceOpen}
        onOpenChange={setRaceOpen}
        roomId={room.id}
        onCreated={fetchData}
      />
    </div>
  );
};
