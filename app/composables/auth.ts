interface SteamUser {
    id: number
    steam_id: string
    name: string
    avatar: string | null
}

export const useAuth = () => {
    const { user, isAuthenticated, logout, refreshIdentity } = useSanctumAuth<SteamUser>()
    const { baseUrl } = useSanctumConfig()

    /**
     * Send the browser to the backend Steam redirect route. This is a full-page
     * navigation (not an XHR) because Steam's OpenID flow redirects away and back.
     */
    function loginWithSteam() {
        window.location.href = `${baseUrl}/auth/steam/redirect`
    }

    return {
        user,
        isAuthenticated,
        loginWithSteam,
        logout,
        refreshIdentity,
    }
}
