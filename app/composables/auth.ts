interface SteamUser {
    id: number
    steam_id: string
    name: string
    avatar: string | null
    trade_url: string | null
}

export const useAuth = () => {
    const { user, isAuthenticated, logout, refreshIdentity } = useSanctumAuth<SteamUser>()
    const { baseUrl } = useSanctumConfig()
    const client = useSanctumClient()

    /**
     * Send the browser to the backend Steam redirect route. This is a full-page
     * navigation (not an XHR) because Steam's OpenID flow redirects away and back.
     */
    function loginWithSteam() {
        window.location.href = `${baseUrl}/auth/steam/redirect`
    }

    /**
     * Save the user's Steam trade URL, then refresh the identity so `user`
     * reflects it.
     */
    async function saveTradeUrl(tradeUrl: string): Promise<void> {
        await client('/api/user/trade-url', { method: 'PUT', body: { trade_url: tradeUrl } })
        await refreshIdentity()
    }

    return {
        user,
        isAuthenticated,
        loginWithSteam,
        saveTradeUrl,
        logout,
        refreshIdentity,
    }
}
