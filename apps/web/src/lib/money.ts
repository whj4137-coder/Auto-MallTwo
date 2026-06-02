// 金额显示：分 → ¥整数（无小数）。PRD §10.6。
export function yuan(priceCents: number | null | undefined): string {
  if (priceCents == null) return "服务展示";
  return `¥${Math.round(priceCents / 100)}`;
}
