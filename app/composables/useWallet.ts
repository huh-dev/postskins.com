export interface WalletState {
  balance: number
  locked_balance: number
  currency: string
}

/**
 * The authenticated user's wallet. `addTestFunds` hits the local-only dev
 * credit endpoint (there is no real deposit flow yet).
 */
export function useWallet() {
  const client = useSanctumClient()

  const wallet = ref<WalletState | null>(null)

  async function load(): Promise<void> {
    try {
      wallet.value = await client<WalletState>("/api/wallet")
    }
    catch {
      wallet.value = null
    }
  }

  async function addTestFunds(amount = 100_000): Promise<void> {
    await client("/api/dev/credit", { method: "POST", body: { amount } })
    await load()
  }

  return { wallet, load, addTestFunds }
}
