/**
 * Calculate R Multiple for a trade, falling back to default 1R if trade has no risk_to_pay set.
 */
export function calculateRMultiple(
  profit: number | null | undefined,
  riskToPay: number | null | undefined,
  defaultRiskAmount: number | null | undefined
): number {
  if (profit === null || profit === undefined) return 0;
  
  const risk = (riskToPay && riskToPay > 0) ? riskToPay : (defaultRiskAmount && defaultRiskAmount > 0 ? defaultRiskAmount : null);
  
  if (!risk) return 0;
  return profit / risk;
}
