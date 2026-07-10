import type { InventoryItem, InventoryItemStack } from '@/composables/useInventory'
import { compareItemsByRarity } from '@/lib/itemRarity'
import { parseWearTier, placeholderFloat } from '@/lib/itemWear'

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

export const INVENTORY_SORTS = [
  { value: 'rarity', label: 'Rarity' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'float-asc', label: 'Float: Low to High' },
  { value: 'float-desc', label: 'Float: High to Low' },
] as const

export type InventorySort = (typeof INVENTORY_SORTS)[number]['value']

function stackName(stack: InventoryItemStack): string {
  return stack.item.market_name ?? stack.item.name ?? ''
}

/**
 * Wear float of a stack, or null for items that have no wear (cases, stickers).
 */
function stackFloat(stack: InventoryItemStack): number | null {
  const tier = parseWearTier(stack.item.market_name)

  return tier ? placeholderFloat(stack.item.asset_id, tier) : null
}

export function searchInventoryStacks(stacks: InventoryItemStack[], query: string): InventoryItemStack[] {
  const needle = query.trim().toLowerCase()

  if (!needle) {
    return stacks
  }

  return stacks.filter(stack => stackName(stack).toLowerCase().includes(needle))
}

/**
 * Sort a copy of the stacks. Float sorts push wearless items to the end, where
 * they stay in rarity order rather than clumping at an arbitrary float value.
 */
export function sortInventoryStacks(stacks: InventoryItemStack[], sort: InventorySort): InventoryItemStack[] {
  const sorted = [...stacks]

  if (sort === 'name-asc' || sort === 'name-desc') {
    const direction = sort === 'name-asc' ? 1 : -1

    return sorted.sort((a, b) => direction * stackName(a).localeCompare(stackName(b)))
  }

  if (sort === 'float-asc' || sort === 'float-desc') {
    const direction = sort === 'float-asc' ? 1 : -1

    return sorted.sort((a, b) => {
      const floatA = stackFloat(a)
      const floatB = stackFloat(b)

      if (floatA === null || floatB === null) {
        if (floatA === floatB) {
          return compareItemsByRarity(a.item, b.item)
        }

        return floatA === null ? 1 : -1
      }

      return direction * (floatA - floatB)
    })
  }

  return sorted.sort((a, b) => compareItemsByRarity(a.item, b.item))
}
