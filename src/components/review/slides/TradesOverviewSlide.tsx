import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

interface Trade {
  id: string;
  outcome: string;
  profit: number | null;
}

interface TradesOverviewSlideProps {
  trades: Trade[];
}

export const TradesOverviewSlide = ({ trades }: TradesOverviewSlideProps) => {
  const winningTrades = trades.filter(t => t.outcome === "Win").length;
  const losingTrades = trades.filter(t => t.outcome === "Loss").length;
  const breakEvenTrades = trades.filter(t => t.outcome === "Break Even").length;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : 0;

  const stats = [
    {
      label: "Total trades",
      value: totalTrades,
      icon: Target,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Winning trades",
      value: winningTrades,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Break even trades",
      value: breakEvenTrades,
      icon: Minus,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Losing trades",
      value: losingTrades,
      icon: TrendingDown,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8">
      <h3 className="text-3xl font-bold text-foreground">Trades Breakdown</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 max-w-lg w-full">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl p-6 flex flex-col items-center justify-center space-y-2`}
          >
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-muted-foreground text-center">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Win Rate */}
      <div className="bg-card border rounded-xl p-6 text-center min-w-[200px]">
        <div className="text-5xl font-bold text-primary">{winRate}%</div>
        <div className="text-muted-foreground">Win Rate</div>
      </div>
    </div>
  );
};
