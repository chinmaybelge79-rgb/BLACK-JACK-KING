export const CHIP_DENOMINATIONS = [1000, 500, 100, 25, 5, 1] as const;
export type ChipDenomination = typeof CHIP_DENOMINATIONS[number];

export const CHIP_COLORS: Record<ChipDenomination, { bg: string; text: string; ring: string }> = {
  1: { bg: '#FFFFFF', text: '#0F172A', ring: '#E2E8F0' },
  5: { bg: '#EF4444', text: '#FFFFFF', ring: '#FCA5A5' },
  25: { bg: '#10B981', text: '#FFFFFF', ring: '#6EE7B7' },
  100: { bg: '#0F172A', text: '#F59E0B', ring: '#FBBF24' },
  500: { bg: '#8B5CF6', text: '#FFFFFF', ring: '#C4B5FD' },
  1000: { bg: '#F59E0B', text: '#0F172A', ring: '#FDE68A' },
};

export function formatChipValue(value: number): string {
  if (value >= 1000) return `${value / 1000}K`;
  return `$${value}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getChipsForAmount(amount: number): ChipDenomination[] {
  if (amount <= 0) return [];
  
  const chips: ChipDenomination[] = [];
  let remaining = amount;
  
  for (const denom of CHIP_DENOMINATIONS) {
    const count = Math.floor(remaining / denom);
    for (let i = 0; i < count; i++) {
      chips.push(denom);
    }
    remaining -= count * denom;
  }
  
  return chips;
}

export function getChipCountsForAmount(amount: number): Record<ChipDenomination, number> {
  const counts: Record<ChipDenomination, number> = {
    1000: 0,
    500: 0,
    100: 0,
    25: 0,
    5: 0,
    1: 0,
  };
  
  let remaining = amount;
  
  for (const denom of CHIP_DENOMINATIONS) {
    counts[denom] = Math.floor(remaining / denom);
    remaining -= counts[denom] * denom;
  }
  
  return counts;
}

export function getTotalChipCount(amount: number): number {
  let count = 0;
  let remaining = amount;
  
  for (const denom of CHIP_DENOMINATIONS) {
    count += Math.floor(remaining / denom);
    remaining %= denom;
  }
  
  return count;
}