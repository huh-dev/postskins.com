const RARITY_GRADES = [
  'Contraband',
  'Extraordinary',
  'Covert',
  'Classified',
  'Restricted',
  'Mil-Spec Grade',
  'Industrial Grade',
  'Consumer Grade',
  'Distinguished',
  'Exceptional',
  'Superior',
  'Master',
  'Base Grade',
  'High Grade',
  'Remarkable',
  'Exotic',
] as const

export type ItemRarity = (typeof RARITY_GRADES)[number]

const RARITY_GLOW_COLORS: Record<ItemRarity, string> = {
  'Consumer Grade': '176 195 217',
  'Industrial Grade': '94 152 217',
  'Mil-Spec Grade': '75 105 255',
  Distinguished: '75 105 255',
  Restricted: '136 71 255',
  Classified: '211 44 230',
  Covert: '235 75 75',
  Contraband: '228 174 57',
  Extraordinary: '235 75 75',
  'Base Grade': '176 195 217',
  'High Grade': '75 105 255',
  Remarkable: '136 71 255',
  Exotic: '211 44 230',
  Exceptional: '136 71 255',
  Superior: '75 105 255',
  Master: '235 75 75',
}

const DEFAULT_GLOW = '0 0 0'

const RARITY_SORT_RANK: Record<ItemRarity, number> = {
  Contraband: 10,
  Extraordinary: 15,
  Covert: 20,
  Classified: 30,
  Exotic: 35,
  Restricted: 40,
  Remarkable: 45,
  'Mil-Spec Grade': 50,
  Distinguished: 52,
  Superior: 54,
  Exceptional: 56,
  'High Grade': 60,
  'Industrial Grade': 70,
  Master: 72,
  'Consumer Grade': 80,
  'Base Grade': 90,
}

const UNKNOWN_RARITY_RANK = 900
const KNIFE_GLOVE_RANK = 0

export function isKnifeOrGlove(type: string | null, name: string | null): boolean {
  if (name?.includes('★')) {
    return true
  }

  if (!type) {
    return false
  }

  return type.includes('Knife') || type.includes('Gloves')
}

export function itemRaritySortRank(type: string | null, name: string | null = null): number {
  if (isKnifeOrGlove(type, name)) {
    return KNIFE_GLOVE_RANK
  }

  const rarity = parseItemRarity(type)

  return rarity ? RARITY_SORT_RANK[rarity] : UNKNOWN_RARITY_RANK
}

export function compareItemsByRarity(
  a: { type: string | null, market_name?: string | null, name?: string | null },
  b: { type: string | null, market_name?: string | null, name?: string | null },
): number {
  const nameA = a.market_name ?? a.name ?? ''
  const nameB = b.market_name ?? b.name ?? ''
  const rankDiff = itemRaritySortRank(a.type, nameA) - itemRaritySortRank(b.type, nameB)

  if (rankDiff !== 0) {
    return rankDiff
  }

  return nameA.localeCompare(nameB)
}

export function parseItemRarity(type: string | null): ItemRarity | null {
  if (!type) {
    return null
  }

  for (const grade of RARITY_GRADES) {
    if (type.includes(grade)) {
      return grade
    }
  }

  return null
}

export function itemRarityGlowRgb(type: string | null): string {
  const rarity = parseItemRarity(type)
  return rarity ? RARITY_GLOW_COLORS[rarity] : DEFAULT_GLOW
}

export function itemRarityColor(type: string | null): string {
  const rgb = itemRarityGlowRgb(type)

  return rgb === DEFAULT_GLOW ? 'oklch(0.55 0.01 106)' : `rgb(${rgb})`
}

export function itemRarityGlowStyle(type: string | null): Record<string, string> {
  const rgb = itemRarityGlowRgb(type)

  return {
    background: `radial-gradient(circle, rgb(${rgb} / 0.42) 0%, rgb(${rgb} / 0.16) 42%, transparent 72%)`,
  }
}

export function itemIconGlowFilter(type: string | null): string {
  const rgb = itemRarityGlowRgb(type)

  if (rgb === DEFAULT_GLOW) {
    return 'drop-shadow(0 4px 14px oklch(0 0 0 / 0.3))'
  }

  return [
    `drop-shadow(0 0 10px rgb(${rgb} / 0.32))`,
    `drop-shadow(0 0 22px rgb(${rgb} / 0.18))`,
    `drop-shadow(0 6px 16px rgb(${rgb} / 0.12))`,
  ].join(' ')
}

export function itemIconDropShadow(type: string | null): string {
  const rgb = itemRarityGlowRgb(type)
  return `drop-shadow(0 6px 14px rgb(${rgb} / 0.42)) drop-shadow(0 2px 6px rgb(${rgb} / 0.28))`
}
