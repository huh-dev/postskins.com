import { u as useSanctumAuth } from './useSanctumAuth-CV-U5xaj.mjs';
import { d as useSanctumConfig } from './server.mjs';
import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';

const useAuth = () => {
  const { user, isAuthenticated, logout, refreshIdentity } = useSanctumAuth();
  const { baseUrl } = useSanctumConfig();
  const client = useSanctumClient();
  function loginWithSteam() {
    (void 0).location.href = `${baseUrl}/auth/steam/redirect`;
  }
  async function saveTradeUrl(tradeUrl) {
    await client("/api/user/trade-url", { method: "PUT", body: { trade_url: tradeUrl } });
    await refreshIdentity();
  }
  return {
    user,
    isAuthenticated,
    loginWithSteam,
    saveTradeUrl,
    logout,
    refreshIdentity
  };
};

export { useAuth as u };
//# sourceMappingURL=auth-Dmkix5Lz.mjs.map
