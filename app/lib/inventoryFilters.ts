import type { InventoryItem } from '@/composables/useInventory'

const EXCLUDED_TYPE_KEYWORDS = [
  'music kit',
  'medal',
  'coin',
  'trophy',
  'badge',
  'premier season',
  'skill group',
] as const

export function isExcludedInventoryItem(item: InventoryItem): boolean {
  const type = (item.type ?? '').toLowerCase()
  const name = (item.market_name ?? item.name ?? '').toLowerCase()

  if (EXCLUDED_TYPE_KEYWORDS.some(keyword => type.includes(keyword))) {
    return true
  }

  if (type.includes('collectible') && EXCLUDED_TYPE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return true
  }

  return false
}

export function filterInventoryItems(items: InventoryItem[]): InventoryItem[] {
  return items.filter(item => !isExcludedInventoryItem(item))
}
