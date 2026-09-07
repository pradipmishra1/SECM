export function parsePrizeAmount(prize: string | null | undefined): number {
  if (!prize) return 0;
  const match = prize.replace(/,/g, "").match(/[\d.]+/);
  if (!match) return 0;
  return parseFloat(match[0]) || 0;
}