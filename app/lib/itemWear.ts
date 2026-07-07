export const WEAR_TIERS = [
  'Factory New',
  'Minimal Wear',
  'Field-Tested',
  'Well-Worn',
  'Battle-Scarred',
] as const

export type WearTier = (typeof WEAR_TIERS)[number]

const WEAR_RANGES: Record<WearTier, [number, number]> = {
  'Factory New': [0, 0.07],
  'Minimal Wear': [0.07, 0.15],
  'Field-Tested': [0.15, 0.38],
  'Well-Worn': [0.38, 0.45],
  'Battle-Scarred': [0.45, 1],
}

function hashSeed(input: string): number {
  let hash = 0

  for (let index = 0; index < input.length; index++) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0
  }

  return hash
}

export function parseWearTier(marketName: string | null): WearTier | null {
  if (!marketName) {
    return null
  }

  for (const tier of WEAR_TIERS) {
    if (marketName.includes(`(${tier})`)) {
      return tier
    }
  }

  return null
}

export function stripWearFromName(marketName: string | null, fallback = ''): string {
  if (!marketName) {
    return fallback
  }

  return marketName
    .replace(/\s*\((Factory New|Minimal Wear|Field-Tested|Well-Worn|Battle-Scarred)\)\s*$/, '')
    .trim()
}

export function placeholderFloat(assetId: string, tier: WearTier): number {
  const [min, max] = WEAR_RANGES[tier]
  const ratio = (hashSeed(assetId) % 10000) / 10000

  return min + ratio * (max - min)
}

export function placeholderPattern(assetId: string): number {
  return (hashSeed(`${assetId}:pattern`) % 1000) + 1
}

export function formatWearFloat(value: number): string {
  return value.toFixed(12)
}

export function wearMarkerPercent(floatValue: number): number {
  return Math.min(100, Math.max(0, floatValue * 100))
}
