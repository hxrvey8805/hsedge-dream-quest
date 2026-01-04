import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface Account {
  id: string;
  type: 'personal' | 'funded' | 'evaluation';
  running_pl: number;
}

interface DashboardStatsProps {
  accounts: Account[];
  selectedAccountId: string | null;
  monthSwitchEnabled: boolean;
  currentMonth: Date;
  refreshTrigger: number;
}

interface Trade {
  id: string;
  profit: number;
  outcome: string;
  trade_date: string;
  account_id?: string;
}

interface Stats {
  netPL: number;
  tradeWinPercent: number;
  profitFactor: number;
  dayWinPercent: number;
  avgWinTrade: number;
  avgLossTrade: number;
  winCount: number;
  lossCount: number;
  winDays: number;
  lossDays: number;
}

// Semi-circular gauge for Net P&L
const NetPLGauge = ({ value, max }: { value: number; max: number }) => {
  const normalizedValue = Math.max(-1, Math.min(1, value / (max || 1)));
  const angle = normalizedValue * 90; // -90 to +90 degrees
  
  return (
    <svg viewBox="0 0 100 60" className="w-24 h-14">
      {/* Background arc */}
      <path
        d="M 10 55 A 40 40 0 0 1 90 55"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* Red zone (left) */}
      <path
        d="M 10 55 A 40 40 0 0 1 50 15"
        fill="none"
        stroke="hsl(var(--destructive))"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Green zone (right) */}
      <path
        d="M 50 15 A 40 40 0 0 1 90 55"
        fill="none"
        stroke="hsl(var(--success))"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Needle */}
      <line
        x1="50"
        y1="55"
        x2={50 + Math.sin((angle * Math.PI) / 180) * 30}
        y2={55 - Math.cos((angle * Math.PI) / 180) * 30}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="50" cy="55" r="4" fill="hsl(var(--foreground))" />
    </svg>
  );
};

// Arc diagram for win/loss percentages
const WinLossArc = ({ winPercent, winCount, lossCount }: { winPercent: number; winCount: number; lossCount: number }) => {
  const winAngle = (winPercent / 100) * 180;
  
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 180) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <svg viewBox="0 0 100 60" className="w-24 h-14">
      {/* Win arc (green) */}
      {winAngle > 0 && (
        <path
          d={describeArc(50, 55, 35, 0, winAngle)}
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
      {/* Loss arc (red) */}
      {winAngle < 180 && (
        <path
          d={describeArc(50, 55, 35, winAngle, 180)}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
      {/* Win count marker */}
      <circle cx="20" cy="50" r="6" fill="hsl(var(--success))" />
      <text x="20" y="53" textAnchor="middle" className="text-[8px] fill-success-foreground font-bold">{winCount}</text>
      {/* Loss count marker */}
      <circle cx="80" cy="50" r="6" fill="hsl(var(--destructive))" />
      <text x="80" y="53" textAnchor="middle" className="text-[8px] fill-destructive-foreground font-bold">{lossCount}</text>
    </svg>
  );
};

// Circular progress for Profit Factor
const ProfitFactorRing = ({ value }: { value: number }) => {
  const maxValue = 3; // Cap display at 3.0
  const percent = Math.min(value / maxValue, 1) * 100;
  const circumference = 2 * Math.PI * 25;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <svg viewBox="0 0 70 70" className="w-16 h-16">
      {/* Background circle */}
      <circle
        cx="35"
        cy="35"
        r="25"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="6"
      />
      {/* Progress circle */}
      <circle
        cx="35"
        cy="35"
        r="25"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 35 35)"
        className="transition-all duration-500"
      />
    </svg>
  );
};

// Horizontal bar for Avg Win/Loss
const AvgWinLossBar = ({ avgWin, avgLoss }: { avgWin: number; avgLoss: number }) => {
  const total = avgWin + Math.abs(avgLoss);
  const winWidth = total > 0 ? (avgWin / total) * 100 : 50;
  
  return (
    <div className="w-full">
      <div className="flex h-4 rounded-full overflow-hidden">
        <div 
          className="bg-success transition-all duration-500"
          style={{ width: `${winWidth}%` }}
        />
        <div 
          className="bg-destructive transition-all duration-500"
          style={{ width: `${100 - winWidth}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-[10px]">
        <span className="text-success">${avgWin.toFixed(0)}</span>
        <span className="text-destructive">-${Math.abs(avgLoss).toFixed(0)}</span>
      </div>
    </div>
  );
};

export const DashboardStats = ({
  accounts,
  selectedAccountId,
  monthSwitchEnabled,
  currentMonth,
  refreshTrigger
}: DashboardStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    netPL: 0,
    tradeWinPercent: 0,
    profitFactor: 0,
    dayWinPercent: 0,
    avgWinTrade: 0,
    avgLossTrade: 0,
    winCount: 0,
    lossCount: 0,
    winDays: 0,
    lossDays: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Calculate Net P&L from accounts
      let netPL = 0;
      if (selectedAccountId) {
        const selectedAccount = accounts.find(a => a.id === selectedAccountId);
        netPL = selectedAccount?.running_pl || 0;
      } else {
        netPL = accounts.reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
      }

      // Build query for trades
      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id);

      // Filter by month if enabled
      if (monthSwitchEnabled) {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        query = query
          .gte("trade_date", format(monthStart, 'yyyy-MM-dd'))
          .lte("trade_date", format(monthEnd, 'yyyy-MM-dd'));
      }

      // Filter by account if selected
      if (selectedAccountId) {
        query = query.eq("account_id", selectedAccountId);
      }

      const { data: trades, error } = await query;

      if (error || !trades) {
        console.error("Error fetching trades:", error);
        return;
      }

      // Calculate stats
      const wins = trades.filter(t => t.outcome === "Win");
      const losses = trades.filter(t => t.outcome === "Loss");
      
      const totalTrades = trades.length;
      const winCount = wins.length;
      const lossCount = losses.length;
      const tradeWinPercent = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;

      const grossProfit = wins.reduce((sum, t) => sum + (t.profit || 0), 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.profit || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

      const avgWinTrade = winCount > 0 ? grossProfit / winCount : 0;
      const avgLossTrade = lossCount > 0 ? grossLoss / lossCount : 0;

      // Calculate day win percentage
      const tradesByDay = trades.reduce((acc, trade) => {
        const day = trade.trade_date;
        if (!acc[day]) acc[day] = [];
        acc[day].push(trade);
        return acc;
      }, {} as Record<string, typeof trades>);

      let winDays = 0;
      let lossDays = 0;
      Object.values(tradesByDay).forEach(dayTrades => {
        const dayPL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        if (dayPL > 0) winDays++;
        else if (dayPL < 0) lossDays++;
      });

      const totalDays = winDays + lossDays;
      const dayWinPercent = totalDays > 0 ? (winDays / totalDays) * 100 : 0;

      setStats({
        netPL,
        tradeWinPercent,
        profitFactor,
        dayWinPercent,
        avgWinTrade,
        avgLossTrade,
        winCount,
        lossCount,
        winDays,
        lossDays
      });
    };

    fetchStats();
  }, [accounts, selectedAccountId, monthSwitchEnabled, currentMonth, refreshTrigger]);

  const maxPL = Math.max(Math.abs(stats.netPL), 10000);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-5 gap-4 w-full max-w-[1800px]">
        {/* Net P&L */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Net P&L</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Total profit/loss from all accounts</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${stats.netPL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {stats.netPL >= 0 ? '+' : ''}${stats.netPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <NetPLGauge value={stats.netPL} max={maxPL} />
          </div>
        </Card>

        {/* Trade Win % */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Trade Win %</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of winning trades</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{stats.tradeWinPercent.toFixed(1)}%</p>
            <WinLossArc winPercent={stats.tradeWinPercent} winCount={stats.winCount} lossCount={stats.lossCount} />
          </div>
        </Card>

        {/* Profit Factor */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Profit Factor</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Gross profit divided by gross loss</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>
              {stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
            </p>
            <ProfitFactorRing value={stats.profitFactor} />
          </div>
        </Card>

        {/* Day Win % */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Day Win %</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Percentage of profitable trading days</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold">{stats.dayWinPercent.toFixed(1)}%</p>
            <WinLossArc winPercent={stats.dayWinPercent} winCount={stats.winDays} lossCount={stats.lossDays} />
          </div>
        </Card>

        {/* Avg Win/Loss Trade */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Avg Win/Loss</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Average winning vs losing trade size</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-bold mb-2">
              <span className="text-success">${stats.avgWinTrade.toFixed(0)}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-destructive">-${stats.avgLossTrade.toFixed(0)}</span>
            </p>
            <AvgWinLossBar avgWin={stats.avgWinTrade} avgLoss={stats.avgLossTrade} />
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};
