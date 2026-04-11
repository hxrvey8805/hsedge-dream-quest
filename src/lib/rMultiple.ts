/**
 * Calculate R Multiple for a trade.
 * When a default 1R amount is configured, it becomes the source of truth app-wide.
 * Otherwise, fall back to the trade's saved risk amount.
 */
export function calculateRMultiple(
  profit: number | null | undefined,
  riskToPay: number | null | undefined,
  defaultRiskAmount: number | null | undefined
): number {
  if (profit === null || profit === undefined) return 0;

  const defaultRisk = defaultRiskAmount && defaultRiskAmount > 0 ? defaultRiskAmount : null;
  const tradeRisk = riskToPay && riskToPay > 0 ? riskToPay : null;
  const risk = defaultRisk ?? tradeRisk;

  if (!risk) return 0;
  return profit / risk;
}
