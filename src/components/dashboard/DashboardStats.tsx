import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { startOfMonth, endOfMonth, format } from "date-fns";

interface Account {
  id: string;
  type: 'personal' | 'funded' | 'evaluation' | 'backtesting';
  running_pl: number;
}

interface DashboardStatsProps {
  accounts: Account[];
  selectedAccountId: string | null;
  monthSwitchEnabled: boolean;
  currentMonth: Date;
  refreshTrigger: number;
  viewMode?: 'pips' | 'profit';
}

interface Trade {
  id: string;
  profit: number;
  pips: number | null;
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
  const angle = normalizedValue * 90;
  
  return (
    <svg viewBox="0 0 100 55" className="w-20 h-12">
      <defs>
        <linearGradient id="lossGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(348 100% 50%)" />
          <stop offset="100%" stopColor="hsl(348 100% 65%)" />
        </linearGradient>
        <linearGradient id="profitGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(163 100% 40%)" />
          <stop offset="100%" stopColor="hsl(163 100% 55%)" />
        </linearGradient>
      </defs>
      {/* Loss arc (left) */}
      <path
        d="M 12 50 A 38 38 0 0 1 50 12"
        fill="none"
        stroke="url(#lossGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Profit arc (right) */}
      <path
        d="M 50 12 A 38 38 0 0 1 88 50"
        fill="none"
        stroke="url(#profitGradient)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Center pivot */}
      <circle cx="50" cy="50" r="3" fill="hsl(var(--foreground))" />
      {/* Needle */}
      <line
        x1="50"
        y1="50"
        x2={50 + Math.sin((angle * Math.PI) / 180) * 28}
        y2={50 - Math.cos((angle * Math.PI) / 180) * 28}
        stroke="hsl(var(--foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-500"
      />
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
    <svg viewBox="0 0 100 60" className="w-20 h-14">
      <defs>
        <linearGradient id="winArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(163 100% 45%)" />
          <stop offset="100%" stopColor="hsl(163 100% 55%)" />
        </linearGradient>
        <linearGradient id="lossArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(348 100% 55%)" />
          <stop offset="100%" stopColor="hsl(348 100% 65%)" />
        </linearGradient>
      </defs>
      {/* Win arc (green/success) */}
      {winAngle > 0 && (
        <path
          d={describeArc(50, 50, 32, 0, Math.max(winAngle, 1))}
          fill="none"
          stroke="url(#winArcGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      {/* Loss arc (red/destructive) */}
      {winAngle < 180 && (
        <path
          d={describeArc(50, 50, 32, Math.min(winAngle, 179), 180)}
          fill="none"
          stroke="url(#lossArcGradient)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
      {/* Win count - positioned lower */}
      <circle cx="18" cy="56" r="8" fill="hsl(var(--success))" className="drop-shadow-sm" />
      <text x="18" y="59" textAnchor="middle" fill="hsl(var(--success-foreground))" fontSize="8" fontWeight="600">{winCount}</text>
      {/* Loss count - positioned lower */}
      <circle cx="82" cy="56" r="8" fill="hsl(var(--destructive))" className="drop-shadow-sm" />
      <text x="82" y="59" textAnchor="middle" fill="hsl(var(--destructive-foreground))" fontSize="8" fontWeight="600">{lossCount}</text>
    </svg>
  );
};

// Circular progress for Profit Factor using primary blue
const ProfitFactorRing = ({ value }: { value: number }) => {
  const maxValue = 3;
  const percent = Math.min(value / maxValue, 1) * 100;
  const circumference = 2 * Math.PI * 22;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <svg viewBox="0 0 60 60" className="w-14 h-14">
      <defs>
        <linearGradient id="profitFactorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(212 98% 55%)" />
          <stop offset="100%" stopColor="hsl(163 100% 50%)" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle
        cx="30"
        cy="30"
        r="22"
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="5"
        opacity="0.5"
      />
      {/* Progress circle */}
      <circle
        cx="30"
        cy="30"
        r="22"
        fill="none"
        stroke="url(#profitFactorGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 30 30)"
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
    <div className="w-full mt-1">
      <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/30">
        <div 
          className="bg-gradient-to-r from-success/90 to-success transition-all duration-500 rounded-l-full"
          style={{ width: `${winWidth}%` }}
        />
        <div 
          className="bg-gradient-to-r from-destructive/90 to-destructive transition-all duration-500 rounded-r-full"
          style={{ width: `${100 - winWidth}%` }}
        />
      </div>
    </div>
  );
};

export const DashboardStats = ({
  accounts,
  selectedAccountId,
  monthSwitchEnabled,
  currentMonth,
  refreshTrigger,
  viewMode = 'profit'
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

      // Calculate Net P&L from accounts (manually entered running_pl)
      let accountPL = 0;
      if (selectedAccountId) {
        // If specific account selected, use that account's running_pl
        const selectedAccount = accounts.find(a => a.id === selectedAccountId);
        accountPL = selectedAccount?.running_pl || 0;
      } else {
        // When "All Accounts" is selected, sum personal and funded accounts only
        accountPL = accounts
          .filter(acc => acc.type === 'personal' || acc.type === 'funded')
          .reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
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
      } else {
        // When "All Accounts" is selected, exclude evaluation and backtesting
        query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
      }

      const { data: trades, error } = await query;

      if (error || !trades) {
        console.error("Error fetching trades:", error);
        return;
      }

      // Calculate trades value from filtered trades (pips or profit based on viewMode)
      const tradesValue = trades.reduce((sum, t) => {
        if (viewMode === 'pips') {
          return sum + (t.pips || 0);
        } else {
          return sum + (t.profit || 0);
        }
      }, 0);

      // Net P&L = Account running_pl (manually entered) + Trades value (from calendar)
      // Note: Account running_pl is always in dollars, so for pips mode we only show trades pips
      const netPL = viewMode === 'pips' ? tradesValue : accountPL + tradesValue;

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
  }, [accounts, selectedAccountId, monthSwitchEnabled, currentMonth, refreshTrigger, viewMode]);

  const maxPL = Math.max(Math.abs(stats.netPL), 10000);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-5 gap-4 w-full max-w-[1800px]">
        {/* Net P&L */}
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {viewMode === 'pips' ? 'Net Pips' : 'Net P&L'}
            </span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">
                  {viewMode === 'pips' 
                    ? 'Total pips from all trades. Account running P&L is not included in pips view.'
                    : 'Your total profit or loss. Includes manually entered account running P&L plus trades profit from calendar.'}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-2xl font-bold ${stats.netPL >= 0 ? 'text-success' : 'text-destructive'}`}>
              {viewMode === 'pips' 
                ? `${stats.netPL >= 0 ? '+' : ''}${stats.netPL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pips`
                : `${stats.netPL >= 0 ? '+' : ''}$${stats.netPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              }
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
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">The percentage of your trades that ended in profit. Calculated as (winning trades ÷ total trades) × 100. Higher is better.</p>
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
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">Measures profitability by dividing total gains by total losses. A value above 1.0 means you're profitable overall. Above 2.0 is excellent.</p>
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
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">The percentage of trading days that ended with a net profit. Groups all trades by date and checks if the day's total P&L was positive.</p>
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
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">Compares the average profit on winning trades vs the average loss on losing trades. A higher win average relative to loss average indicates better risk management.</p>
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
