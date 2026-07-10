export interface WalletState {
  balance: number
  locked_balance: number
  currency: string
}

/**
 * The authenticated user's wallet. State is shared across every caller so a
 * balance change in one component (e.g. the market page) is reflected
 * everywhere (e.g. the navbar).
 *
 * `addTestFunds` hits the local-only dev credit endpoint (there is no real
 * deposit flow yet).
 */
export function useWallet() {
  const client = useSanctumClient()

  const wallet = useState<WalletState | null>("wallet", () => null)
  const loading = useState<boolean>("wallet:loading", () => false)

  const currency = computed(() => wallet.value?.currency ?? "USD")
  const balance = computed(() => wallet.value?.balance ?? 0)
  const lockedBalance = computed(() => wallet.value?.locked_balance ?? 0)
  const totalBalance = computed(() => balance.value + lockedBalance.value)
  const hasLockedBalance = computed(() => lockedBalance.value > 0)

  async function load(): Promise<void> {
    loading.value = true

    try {
      wallet.value = await client<WalletState>("/api/wallet")
    }
    catch {
      wallet.value = null
    }
    finally {
      loading.value = false
    }
  }

  async function addTestFunds(amount = 100_000): Promise<void> {
    await client("/api/dev/credit", { method: "POST", body: { amount } })
    await load()
  }

  return {
    wallet,
    loading,
    currency,
    balance,
    lockedBalance,
    totalBalance,
    hasLockedBalance,
    load,
    addTestFunds,
  }
}
