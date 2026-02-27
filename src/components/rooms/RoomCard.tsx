import { Users, Crown, Lock, Globe, Eye, BarChart3, Shield } from "lucide-react";
import type { TradingRoom } from "@/pages/TradingRooms";

interface Props {
  room: TradingRoom;
  memberCount: number;
  isCreator: boolean;
  onClick: () => void;
}

const privacyIcons: Record<string, React.ElementType> = {
  pnl_only: Shield,
  pnl_winrate: Eye,
  full_transparency: BarChart3,
};

const privacyLabels: Record<string, string> = {
  pnl_only: "P&L Only",
  pnl_winrate: "P&L + Win Rate",
  full_transparency: "Full Transparency",
};

export const RoomCard = ({ room, memberCount, isCreator, onClick }: Props) => {
  const PrivacyIcon = privacyIcons[room.privacy_level] || Shield;

  return (
    <button
      onClick={onClick}
      className="hud-glass rounded-xl p-5 text-left w-full hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCreator && <Crown className="h-4 w-4 text-warning" />}
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {room.name}
          </h3>
        </div>
        {room.access_mode === "approval" ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {room.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{room.description}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {memberCount} {memberCount === 1 ? "trader" : "traders"}
        </span>
        <span className="flex items-center gap-1">
          <PrivacyIcon className="h-3.5 w-3.5" />
          {privacyLabels[room.privacy_level]}
        </span>
      </div>
    </button>
  );
};
