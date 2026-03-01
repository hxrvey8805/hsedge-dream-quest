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
      <path d="M 12 50 A 38 38 0 0 1 50 12" fill="none" stroke="url(#lossGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      <path d="M 50 12 A 38 38 0 0 1 88 50" fill="none" stroke="url(#profitGradient)" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
      <circle cx="50" cy="50" r="3" fill="hsl(var(--foreground))" />
      <line x1="50" y1="50" x2={50 + Math.sin((angle * Math.PI) / 180) * 28} y2={50 - Math.cos((angle * Math.PI) / 180) * 28} stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
};

// Arc diagram for win/loss percentages - LARGE version for cards
const WinLossArc = ({ winPercent, winCount, lossCount }: { winPercent: number; winCount: number; lossCount: number }) => {
  const winAngle = (winPercent / 100) * 180;
  
  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = ((angle - 180) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <svg viewBox="0 0 120 70" className="w-full max-w-[140px] h-auto">
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
      {winAngle > 0 && (
        <path d={describeArc(60, 55, 40, 0, Math.max(winAngle, 1))} fill="none" stroke="url(#winArcGradient)" strokeWidth="8" strokeLinecap="round" />
      )}
      {winAngle < 180 && (
        <path d={describeArc(60, 55, 40, Math.min(winAngle, 179), 180)} fill="none" stroke="url(#lossArcGradient)" strokeWidth="8" strokeLinecap="round" />
      )}
      <circle cx="22" cy="65" r="9" fill="hsl(var(--success))" className="drop-shadow-sm" />
      <text x="22" y="68.5" textAnchor="middle" fill="hsl(var(--success-foreground))" fontSize="9" fontWeight="700">{winCount}</text>
      <circle cx="98" cy="65" r="9" fill="hsl(var(--destructive))" className="drop-shadow-sm" />
      <text x="98" y="68.5" textAnchor="middle" fill="hsl(var(--destructive-foreground))" fontSize="9" fontWeight="700">{lossCount}</text>
    </svg>
  );
};

// Circular progress for Profit Factor - LARGE version
const ProfitFactorRing = ({ value }: { value: number }) => {
  const maxValue = 3;
  const percent = Math.min(value / maxValue, 1) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <svg viewBox="0 0 90 90" className="w-full max-w-[100px] h-auto">
      <defs>
        <linearGradient id="profitFactorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(212 98% 55%)" />
          <stop offset="100%" stopColor="hsl(163 100% 50%)" />
        </linearGradient>
      </defs>
      <circle cx="45" cy="45" r="36" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" opacity="0.4" />
      <circle cx="45" cy="45" r="36" fill="none" stroke="url(#profitFactorGradient)" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} transform="rotate(-90 45 45)" className="transition-all duration-500" />
      <text x="45" y="49" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="700">
        {value >= 999 ? '∞' : value.toFixed(1)}
      </text>
    </svg>
  );
};

// Horizontal bar for Avg Win/Loss - thicker
const AvgWinLossBar = ({ avgWin, avgLoss }: { avgWin: number; avgLoss: number }) => {
  const total = avgWin + Math.abs(avgLoss);
  const winWidth = total > 0 ? (avgWin / total) * 100 : 50;
  
  return (
    <div className="w-full mt-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
        <div className="bg-gradient-to-r from-success/90 to-success transition-all duration-500 rounded-l-full" style={{ width: `${winWidth}%` }} />
        <div className="bg-gradient-to-r from-destructive/90 to-destructive transition-all duration-500 rounded-r-full" style={{ width: `${100 - winWidth}%` }} />
      </div>
    </div>
  );
};

// Custom hook for shared stats logic
const useStats = (props: DashboardStatsProps) => {
  const { accounts, selectedAccountId, monthSwitchEnabled, currentMonth, refreshTrigger, viewMode = 'profit' } = props;
  const [stats, setStats] = useState<Stats>({
    netPL: 0, tradeWinPercent: 0, profitFactor: 0, dayWinPercent: 0,
    avgWinTrade: 0, avgLossTrade: 0, winCount: 0, lossCount: 0, winDays: 0, lossDays: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let accountPL = 0;
      if (!monthSwitchEnabled) {
        if (selectedAccountId) {
          const selectedAccount = accounts.find(a => a.id === selectedAccountId);
          accountPL = selectedAccount?.running_pl || 0;
        } else {
          accountPL = accounts
            .filter(acc => acc.type === 'personal' || acc.type === 'funded')
            .reduce((sum, acc) => sum + (acc.running_pl || 0), 0);
        }
      }

      let query = supabase.from("trades").select("*").eq("user_id", user.id).range(0, 9999);

      if (monthSwitchEnabled) {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        query = query
          .gte("trade_date", format(monthStart, 'yyyy-MM-dd'))
          .lte("trade_date", format(monthEnd, 'yyyy-MM-dd'));
      }

      if (selectedAccountId) {
        query = query.eq("account_id", selectedAccountId);
      } else {
        query = query.or("account_type.is.null,account_type.eq.personal,account_type.eq.funded");
      }

      const { data: trades, error } = await query;
      if (error || !trades) return;

      const tradesValue = trades.reduce((sum, t) => {
        return viewMode === 'pips' ? sum + (t.pips || 0) : sum + (t.profit || 0);
      }, 0);

      const netPL = viewMode === 'pips' ? tradesValue : accountPL + tradesValue;
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

      const tradesByDay = trades.reduce((acc, trade) => {
        const day = trade.trade_date;
        if (!acc[day]) acc[day] = [];
        acc[day].push(trade);
        return acc;
      }, {} as Record<string, Trade[]>);

      let winDays = 0;
      let lossDays = 0;
      Object.values(tradesByDay).forEach((dayTrades: Trade[]) => {
        const dayPL = dayTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
        if (dayPL > 0) winDays++;
        else if (dayPL < 0) lossDays++;
      });

      const totalDays = winDays + lossDays;
      const dayWinPercent = totalDays > 0 ? (winDays / totalDays) * 100 : 0;

      setStats({ netPL, tradeWinPercent, profitFactor, dayWinPercent, avgWinTrade, avgLossTrade, winCount, lossCount, winDays, lossDays });
    };

    fetchStats();
  }, [accounts, selectedAccountId, monthSwitchEnabled, currentMonth, refreshTrigger, viewMode]);

  return stats;
};

/** Net P&L card - displayed beside the progress line chart */
export const NetPLCard = (props: DashboardStatsProps) => {
  const stats = useStats(props);
  const maxPL = Math.max(Math.abs(stats.netPL), 10000);
  const { viewMode = 'profit' } = props;

  return (
    <TooltipProvider>
      <Card className="relative overflow-hidden p-5 bg-card border-border flex flex-col justify-between h-full">
        {/* Dreamy ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20 blur-[60px]"
            style={{ background: stats.netPL >= 0 ? 'hsl(163 100% 50%)' : 'hsl(348 100% 60%)' }}
          />
          <div 
            className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-15 blur-[50px]"
            style={{ background: 'hsl(212 98% 62%)' }}
          />
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full opacity-10 blur-[40px] lucid-orb-slow"
            style={{ background: stats.netPL >= 0 ? 'hsl(163 100% 50%)' : 'hsl(348 100% 60%)' }}
          />
        </div>

        {/* Top label */}
        <div className="relative flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium">
            {viewMode === 'pips' ? 'Net Pips' : 'Net P&L'}
          </span>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground/60" />
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

        {/* Large P&L value - centered */}
        <div className="relative flex flex-col items-center justify-center flex-1 py-2">
          <p className={`text-4xl font-black tracking-tight leading-none ${stats.netPL >= 0 ? 'text-success' : 'text-destructive'}`}
             style={{ 
               textShadow: stats.netPL >= 0 
                 ? '0 0 30px hsl(163 100% 50% / 0.3)' 
                 : '0 0 30px hsl(348 100% 60% / 0.3)' 
             }}
          >
            {viewMode === 'pips' 
              ? `${stats.netPL >= 0 ? '+' : ''}${stats.netPL.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
              : `${stats.netPL >= 0 ? '+' : ''}$${stats.netPL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
          </p>
          {viewMode === 'pips' && (
            <span className="text-xs text-muted-foreground/50 uppercase tracking-widest mt-1">pips</span>
          )}
        </div>

        {/* Gauge at bottom */}
        <div className="relative flex justify-center">
          <NetPLGauge value={stats.netPL} max={maxPL} />
        </div>
      </Card>
    </TooltipProvider>
  );
};

/** 4 stat cards in a 2x2 grid - displayed beside the calendar */
export const FourStatsGrid = (props: DashboardStatsProps) => {
  const stats = useStats(props);

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-3 h-full">
        {/* Trade Win % */}
        <Card className="p-5 bg-card border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Trade Win %</span>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">The percentage of your trades that ended in profit.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <p className="text-3xl font-extrabold tracking-tight">{stats.tradeWinPercent.toFixed(1)}%</p>
            <WinLossArc winPercent={stats.tradeWinPercent} winCount={stats.winCount} lossCount={stats.lossCount} />
          </div>
        </Card>

        {/* Profit Factor */}
        <Card className="p-5 bg-card border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Profit Factor</span>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">Total gains divided by total losses. Above 1.0 is profitable.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <p className={`text-3xl font-extrabold tracking-tight ${stats.profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>
              {stats.profitFactor >= 999 ? '∞' : stats.profitFactor.toFixed(2)}
            </p>
            <ProfitFactorRing value={stats.profitFactor} />
          </div>
        </Card>

        {/* Day Win % */}
        <Card className="p-5 bg-card border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Day Win %</span>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">Percentage of trading days that ended with net profit.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <p className="text-3xl font-extrabold tracking-tight">{stats.dayWinPercent.toFixed(1)}%</p>
            <WinLossArc winPercent={stats.dayWinPercent} winCount={stats.winDays} lossCount={stats.lossDays} />
          </div>
        </Card>

        {/* Avg Win/Loss */}
        <Card className="p-5 bg-card border-border flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Avg Win/Loss</span>
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="text-sm">Average profit on wins vs average loss on losses.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col mt-auto">
            <p className="text-2xl font-extrabold tracking-tight mb-2">
              <span className="text-success">${stats.avgWinTrade.toFixed(0)}</span>
              <span className="text-muted-foreground mx-1.5 text-lg">/</span>
              <span className="text-destructive">-${stats.avgLossTrade.toFixed(0)}</span>
            </p>
            <AvgWinLossBar avgWin={stats.avgWinTrade} avgLoss={stats.avgLossTrade} />
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
};

/** @deprecated Use NetPLCard and FourStatsGrid instead */
export const DashboardStats = (props: DashboardStatsProps) => {
  return (
    <div className="space-y-4">
      <NetPLCard {...props} />
      <FourStatsGrid {...props} />
    </div>
  );
};
