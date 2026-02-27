import { Trophy, Flag } from "lucide-react";
import type { RoomRace } from "@/pages/TradingRooms";

interface MemberPnl {
  user_id: string;
  email: string;
  total_pnl: number;
}

interface Props {
  race: RoomRace;
  members: MemberPnl[];
}

export const RaceCard = ({ race, members }: Props) => {
  const target = race.target_amount;
  
  // Sort by who's closest to target
  const standings = members
    .map(m => ({
      ...m,
      progress: Math.min(100, Math.max(0, (m.total_pnl / target) * 100)),
    }))
    .sort((a, b) => b.progress - a.progress);

  const leader = standings[0];
  const hasWinner = leader && leader.total_pnl >= target;

  return (
    <div className="rounded-lg bg-muted/10 border border-border/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className={`h-4 w-4 ${hasWinner ? "text-warning" : "text-primary"}`} />
          <span className="text-sm font-semibold text-foreground">{race.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          <Flag className="h-3 w-3 inline mr-1" />${target.toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        {standings.slice(0, 5).map((s, i) => (
          <div key={s.user_id}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">
                <span className={`font-bold mr-1 ${i === 0 ? "text-warning" : "text-muted-foreground"}`}>{i + 1}.</span>
                {s.email}
              </span>
              <span className={`font-medium ${s.total_pnl >= 0 ? "text-success" : "text-destructive"}`}>
                ${s.total_pnl.toFixed(0)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/30 border border-muted-foreground/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  i === 0 ? "bg-warning shadow-[0_0_6px_hsl(var(--warning)/0.5)]"
                  : "bg-primary/60"
                }`}
                style={{ width: `${Math.max(0, s.progress)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {hasWinner && (
        <div className="mt-3 pt-3 border-t border-border/20 text-center">
          <span className="text-xs font-bold text-warning">🏆 {leader.email} wins!</span>
        </div>
      )}
    </div>
  );
};
