import { compareItemsByRarity } from '@/lib/itemRarity'
import { filterInventoryItems } from '@/lib/inventoryFilters'

export interface InventoryItem {
    id: number
    asset_id: string
    class_id: string
    instance_id: string
    amount: number
    name: string | null
    market_name: string | null
    market_hash_name: string | null
    type: string | null
    tradable: boolean
    tradable_after: string | null
    trade_hold_days: number | null
    marketable: boolean
    icon_url: string | null
}

export interface InventoryItemStack {
    key: string
    item: InventoryItem
    count: number
    items: InventoryItem[]
}

interface InventoryResponse {
    app_id: number
    context_id: number
    count: number
    stale: boolean
    items: InventoryItem[]
}

type InventoryStatus = 'idle' | 'loading' | 'success' | 'private' | 'error'

/**
 * Loads the authenticated user's Steam inventory from the Laravel API.
 *
 * Distinguishes a private inventory (409) from a transient failure so the UI
 * can prompt the user to make their inventory public rather than showing a
 * generic error.
 */
export function useInventory() {
    const client = useSanctumClient()

    const items = ref<InventoryItem[]>([])
    const status = ref<InventoryStatus>('idle')
    const stale = ref(false)
    const errorMessage = ref<string | null>(null)

    const isLoading = computed(() => status.value === 'loading')

    const visibleItems = computed(() => filterInventoryItems(items.value))

    const groupedItems = computed(() => groupInventoryItems(visibleItems.value))

    const totalCount = computed(() =>
        visibleItems.value.reduce((sum, item) => sum + item.amount, 0),
    )

    async function load(options: { fresh?: boolean } = {}): Promise<void> {
        status.value = 'loading'
        errorMessage.value = null

        try {
            const data = await client<InventoryResponse>('/api/inventory', {
                query: options.fresh ? { fresh: 1 } : undefined,
            })

            items.value = data.items
            stale.value = data.stale
            status.value = 'success'
        }
        catch (error: unknown) {
            const response = (error as { response?: { status?: number }, data?: { message?: string } })

            if (response.response?.status === 409) {
                status.value = 'private'
                return
            }

            status.value = 'error'
            errorMessage.value = response.data?.message ?? 'We could not load your inventory. Please try again.'
        }
    }

    return { items, groupedItems, totalCount, status, stale, isLoading, errorMessage, load }
}

/**
 * Group identical inventory entries (e.g. multiple cases) into a single stack.
 */
export function groupInventoryItems(items: InventoryItem[]): InventoryItemStack[] {
    const stacks = new Map<string, InventoryItemStack>()

    for (const item of items) {
        const key = item.market_hash_name ?? `${item.class_id}:${item.instance_id}`
        const existing = stacks.get(key)

        if (existing) {
            existing.items.push(item)
            existing.count += item.amount
            continue
        }

        stacks.set(key, {
            key,
            item,
            count: item.amount,
            items: [item],
        })
    }

    return Array.from(stacks.values()).sort((a, b) => compareItemsByRarity(a.item, b.item))
}

export function stackHasTradableItem(stack: InventoryItemStack): boolean {
    return stack.items.some(entry => entry.tradable)
}

export function stackTradeLockLabel(stack: InventoryItemStack): string | null {
    if (stackHasTradableItem(stack)) {
        return null
    }

    const locked = stack.items
        .filter(entry => !entry.tradable)
        .sort((a, b) => {
            const aTime = a.tradable_after ? new Date(a.tradable_after).getTime() : Number.POSITIVE_INFINITY
            const bTime = b.tradable_after ? new Date(b.tradable_after).getTime() : Number.POSITIVE_INFINITY
            return aTime - bTime
        })

    return tradeLockLabel(locked[0] ?? stack.item)
}

export function stackTradeLockTitle(stack: InventoryItemStack): string | null {
    if (stackHasTradableItem(stack)) {
        return null
    }

    const locked = stack.items.find(entry => !entry.tradable)
    return locked ? tradeLockTitle(locked) : null
}

/**
 * Short countdown label for a locked item, e.g. "5d 3h" or "Trade locked".
 */
export function tradeLockLabel(item: InventoryItem): string | null {
    if (item.tradable) {
        return null
    }

    if (!item.tradable_after) {
        return 'Trade locked'
    }

    const remainingMs = new Date(item.tradable_after).getTime() - Date.now()

    if (remainingMs <= 0) {
        return 'Unlocking…'
    }

    const days = Math.floor(remainingMs / 86_400_000)
    const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000)

    return days >= 1 ? `${days}d ${hours}h` : `${hours}h`
}

/**
 * Full unlock timestamp for a locked item, used as a tooltip.
 */
export function tradeLockTitle(item: InventoryItem): string | null {
    if (item.tradable || !item.tradable_after) {
        return null
    }

    return `Tradable after ${new Date(item.tradable_after).toLocaleString()}`
}
