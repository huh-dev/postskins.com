interface SellerStatus {
  connected: boolean
  connected_at: string | null
}

interface ConnectStart {
  id: string
  qr_url: string | null
}

interface ConnectPoll {
  status: string
}

/**
 * Seller onboarding: authorize the GC service to send trade offers on the
 * seller's behalf via a one-time Steam QR login. While a QR is pending, callers
 * poll `checkConnect(id)` until it returns "connected".
 */
export function useSeller() {
  const client = useSanctumClient()

  const connected = ref(false)
  const qrChallengeUrl = ref<string | null>(null)
  const connecting = ref(false)
  const errorMessage = ref<string | null>(null)

  async function loadStatus(): Promise<void> {
    try {
      connected.value = (await client<SellerStatus>("/api/seller/status")).connected
    }
    catch {
      connected.value = false
    }
  }

  /**
   * Forget the stored token so the user can re-authorize (e.g. after Steam
   * invalidates it). Leaves the UI ready to start a fresh connect.
   */
  async function disconnect(): Promise<void> {
    try {
      await client("/api/seller/connect", { method: "DELETE" })
    }
    finally {
      connected.value = false
      qrChallengeUrl.value = null
    }
  }

  async function startConnect(): Promise<string | null> {
    errorMessage.value = null
    connecting.value = true
    try {
      const { id, qr_url } = await client<ConnectStart>("/api/seller/connect", { method: "POST" })
      qrChallengeUrl.value = qr_url
      return id
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      connecting.value = false
      return null
    }
  }

  /**
   * Poll one connect attempt. Returns the raw status string; on "connected" it
   * flips `connected` to true.
   */
  async function checkConnect(id: string): Promise<string> {
    try {
      const { status } = await client<ConnectPoll>(`/api/seller/connect/${id}`)
      if (status === "connected") {
        connected.value = true
        connecting.value = false
        qrChallengeUrl.value = null
      }
      else if (status === "error" || status === "timeout" || status === "wrong_account" || status === "not_found") {
        connecting.value = false
        errorMessage.value = status === "wrong_account"
          ? "That Steam account does not match your signed-in account."
          : "Authorization failed or expired. Please try again."
      }
      return status
    }
    catch (error: unknown) {
      errorMessage.value = readError(error)
      connecting.value = false
      return "error"
    }
  }

  /**
   * Render the Steam QR challenge as a scannable image (no external QR needed).
   */
  const qrImageSrc = computed(() =>
    qrChallengeUrl.value
      ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrChallengeUrl.value)}`
      : null,
  )

  function readError(error: unknown): string {
    return (error as { data?: { message?: string } }).data?.message ?? "The trade service is unavailable right now."
  }

  return { connected, connecting, qrChallengeUrl, qrImageSrc, errorMessage, loadStatus, disconnect, startConnect, checkConnect }
}
