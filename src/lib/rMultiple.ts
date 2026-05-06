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
  // Resolve trade month key
  let monthKey: string | null = null;
  if (tradeDate) {
    const d = typeof tradeDate === "string" ? new Date(tradeDate) : tradeDate;
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
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
