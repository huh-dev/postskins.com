export interface InventoryItem {
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

    return { items, status, stale, isLoading, errorMessage, load }
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
