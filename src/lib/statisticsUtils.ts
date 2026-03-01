// Shared utility functions for Statistics page metrics

export interface Trade {
  id: string;
  trade_date: string;
  asset_class: string | null;
  symbol: string;
  session: string | null;
  entry_timeframe: string | null;
  strategy_type: string | null;
  outcome: string;
  pips: number | null;
  profit: number | null;
  time_opened: string | null;
  time_closed: string | null;
  buy_sell: string;
  account_id: string | null;
  account_type: string | null;
  fees: number | null;
  size: number | null;
  setup_id: string | null;
  max_drawdown_pips: number | null;
  total_pips_secured: number | null;
}

export interface CategoryStats {
  wins: number;
  losses: number;
  breakeven: number;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
}

export interface FullStats extends CategoryStats {
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  avgDailyGain: number;
  avgHoldTimeAll: number | null; // minutes
  avgHoldTimeWins: number | null;
  avgHoldTimeLosses: number | null;
  avgDailyVolume: number;
  totalCommissions: number;
  totalFees: number;
  tradePLStdDev: number;
  sqn: number | null;
  kellyPercent: number | null;
  kRatio: number | null;
  probRandomChance: number | null;
  avgMAE: number | null;
  avgMFE: number | null;
}

const getHoldTimeMinutes = (t: Trade): number | null => {
  if (!t.time_opened || !t.time_closed) return null;
  try {
    const [oh, om] = t.time_opened.split(':').map(Number);
    const [ch, cm] = t.time_closed.split(':').map(Number);
    let diff = (ch * 60 + cm) - (oh * 60 + om);
    if (diff < 0) diff += 24 * 60; // overnight
    return diff;
  } catch {
    return null;
  }
};

const avgOrNull = (arr: number[]): number | null => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

export const calculateFullStats = (trades: Trade[], viewMode: 'pips' | 'profit'): FullStats => {
  const isPips = viewMode === 'pips';
  const getValue = (t: Trade) => isPips ? (t.pips || 0) : (t.profit || 0);

  const wins = trades.filter(t => t.outcome === "Win");
  const losses = trades.filter(t => t.outcome === "Loss");
  const breakeven = trades.filter(t => t.outcome === "Break Even");
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
  const totalProfit = trades.reduce((s, t) => s + getValue(t), 0);
  const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

  const grossProfit = wins.reduce((s, t) => s + Math.abs(getValue(t)), 0);
  const grossLoss = losses.reduce((s, t) => s + Math.abs(getValue(t)), 0);
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

  const winValues = wins.map(getValue);
  const lossValues = losses.map(getValue);
  const largestWin = winValues.length > 0 ? Math.max(...winValues) : 0;
  const largestLoss = lossValues.length > 0 ? Math.min(...lossValues) : 0;

  const avgWinningTrade = winValues.length > 0 ? winValues.reduce((a, b) => a + b, 0) / winValues.length : 0;
  const avgLosingTrade = lossValues.length > 0 ? lossValues.reduce((a, b) => a + b, 0) / lossValues.length : 0;

  // Max consecutive wins/losses
  let maxConsW = 0, maxConsL = 0, curW = 0, curL = 0;
  for (const t of trades) {
    if (t.outcome === "Win") { curW++; curL = 0; maxConsW = Math.max(maxConsW, curW); }
    else if (t.outcome === "Loss") { curL++; curW = 0; maxConsL = Math.max(maxConsL, curL); }
    else { curW = 0; curL = 0; }
  }

  // Daily metrics
  const byDay: Record<string, Trade[]> = {};
  trades.forEach(t => { (byDay[t.trade_date] ||= []).push(t); });
  const dailyPLs = Object.values(byDay).map(dt => dt.reduce((s, t) => s + getValue(t), 0));
  const avgDailyGain = dailyPLs.length > 0 ? dailyPLs.reduce((a, b) => a + b, 0) / dailyPLs.length : 0;
  const avgDailyVolume = Object.keys(byDay).length > 0 ? totalTrades / Object.keys(byDay).length : 0;

  // Hold times
  const allHold = trades.map(getHoldTimeMinutes).filter((v): v is number => v !== null);
  const winHold = wins.map(getHoldTimeMinutes).filter((v): v is number => v !== null);
  const lossHold = losses.map(getHoldTimeMinutes).filter((v): v is number => v !== null);

  // Fees / commissions
  const totalFees = trades.reduce((s, t) => s + (t.fees || 0), 0);

  // Advanced metrics
  const plValues = trades.map(getValue);
  const mean = totalTrades > 0 ? plValues.reduce((a, b) => a + b, 0) / totalTrades : 0;
  const variance = totalTrades > 1 ? plValues.reduce((s, v) => s + (v - mean) ** 2, 0) / (totalTrades - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // SQN = (mean / stdDev) * sqrt(N) — needs >= 30 trades
  const sqn = totalTrades >= 30 && stdDev > 0 ? (mean / stdDev) * Math.sqrt(Math.min(totalTrades, 100)) : null;

  // Kelly % = W - ((1-W) / R) where W = win rate, R = avg win / avg loss
  const W = totalTrades > 0 ? wins.length / totalTrades : 0;
  const R = Math.abs(avgLosingTrade) > 0 ? avgWinningTrade / Math.abs(avgLosingTrade) : 0;
  const kellyPercent = totalTrades >= 20 && R > 0 ? (W - (1 - W) / R) * 100 : null;

  // K-Ratio (simplified): slope of cumulative P&L / std error of slope
  let kRatio: number | null = null;
  if (totalTrades >= 20) {
    const cumPL = plValues.reduce((acc: number[], v, i) => { acc.push((acc[i - 1] || 0) + v); return acc; }, []);
    const n = cumPL.length;
    const xMean = (n - 1) / 2;
    const yMean = cumPL.reduce((a, b) => a + b, 0) / n;
    let ssXY = 0, ssXX = 0;
    for (let i = 0; i < n; i++) { ssXY += (i - xMean) * (cumPL[i] - yMean); ssXX += (i - xMean) ** 2; }
    const slope = ssXX > 0 ? ssXY / ssXX : 0;
    const residuals = cumPL.map((y, i) => y - (yMean + slope * (i - xMean)));
    const sse = residuals.reduce((s, r) => s + r * r, 0);
    const se = ssXX > 0 && n > 2 ? Math.sqrt(sse / ((n - 2) * ssXX)) : 0;
    kRatio = se > 0 ? slope / se : null;
  }

  // Probability of random chance (z-test approximation)
  const probRandomChance = totalTrades >= 30 && stdDev > 0
    ? (1 - cdf(Math.abs(mean) / (stdDev / Math.sqrt(totalTrades)))) * 2
    : null;

  // MAE / MFE from max_drawdown_pips / total_pips_secured
  const maeValues = trades.filter(t => t.max_drawdown_pips !== null).map(t => t.max_drawdown_pips!);
  const mfeValues = trades.filter(t => t.total_pips_secured !== null).map(t => t.total_pips_secured!);

  return {
    wins: wins.length, losses: losses.length, breakeven: breakeven.length,
    totalTrades, winRate: Math.round(winRate * 10) / 10, totalProfit, avgProfit,
    profitFactor, largestWin, largestLoss,
    maxConsecutiveWins: maxConsW, maxConsecutiveLosses: maxConsL,
    avgWinningTrade, avgLosingTrade,
    avgDailyGain,
    avgHoldTimeAll: avgOrNull(allHold),
    avgHoldTimeWins: avgOrNull(winHold),
    avgHoldTimeLosses: avgOrNull(lossHold),
    avgDailyVolume,
    totalCommissions: 0, // no separate commissions column
    totalFees,
    tradePLStdDev: stdDev,
    sqn, kellyPercent, kRatio, probRandomChance,
    avgMAE: avgOrNull(maeValues),
    avgMFE: avgOrNull(mfeValues),
  };
};

// Standard normal CDF approximation
function cdf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

export const formatCurrency = (v: number, isPips: boolean): string => {
  if (isPips) return `${v >= 0 ? '+' : ''}${v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
  return `${v >= 0 ? '+' : '-'}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatHoldTime = (minutes: number | null): string => {
  if (minutes === null) return 'N/A';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
