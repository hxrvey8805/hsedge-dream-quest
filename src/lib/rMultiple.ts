/**
 * Calculate R Multiple for a trade.
 * Priority for "1R" amount:
 *   1. Monthly override (matched by trade_date YYYY-MM)
 *   2. Global default risk amount from user settings
 *   3. Trade-specific risk_to_pay (legacy fallback)
 */
export type MonthlyRiskOverrides = Record<string, number>; // { "2026-04": 10 }

export function getEffectiveRiskAmount(
  tradeDate: string | Date | null | undefined,
  riskToPay: number | null | undefined,
  defaultRiskAmount: number | null | undefined,
  monthlyOverrides?: MonthlyRiskOverrides | null
): number | null {
  // Resolve trade month key (YYYY-MM). Parse string dates literally to avoid UTC->local off-by-one.
  let monthKey: string | null = null;
  if (tradeDate) {
    if (typeof tradeDate === "string") {
      const match = tradeDate.match(/^(\d{4})-(\d{2})/);
      if (match) monthKey = `${match[1]}-${match[2]}`;
    } else if (tradeDate instanceof Date && !isNaN(tradeDate.getTime())) {
      const y = tradeDate.getFullYear();
      const m = String(tradeDate.getMonth() + 1).padStart(2, "0");
      monthKey = `${y}-${m}`;
    }
  }

  const monthOverride =
    monthKey && monthlyOverrides && monthlyOverrides[monthKey] && monthlyOverrides[monthKey] > 0
      ? monthlyOverrides[monthKey]
      : null;
  const defaultRisk = defaultRiskAmount && defaultRiskAmount > 0 ? defaultRiskAmount : null;
  const tradeRisk = riskToPay && riskToPay > 0 ? riskToPay : null;

  return monthOverride ?? defaultRisk ?? tradeRisk;
}

export function calculateRMultiple(
  profit: number | null | undefined,
  riskToPay: number | null | undefined,
  defaultRiskAmount: number | null | undefined,
  tradeDate?: string | Date | null,
  monthlyOverrides?: MonthlyRiskOverrides | null
): number {
  if (profit === null || profit === undefined) return 0;
  const risk = getEffectiveRiskAmount(tradeDate, riskToPay, defaultRiskAmount, monthlyOverrides);
  if (!risk) return 0;
  return profit / risk;
}
