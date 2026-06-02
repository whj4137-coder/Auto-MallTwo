// 金额显示：分 → ¥整数（无小数）。PRD §10.6。
export function yuan(priceCents: number | null | undefined): string {
  if (priceCents == null) return "服务展示";
  return `¥${Math.round(priceCents / 100)}`;
}

export function centsToYuanInput(priceCents: number | null | undefined): string {
  if (priceCents == null) return "";
  return String(Math.round(priceCents / 100));
}

export function yuanInputToCents(value: unknown): number | undefined {
  if (value === "") return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.round(n * 100);
}
