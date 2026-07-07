import { computed } from 'vue';
import { b as useNuxtApp, m as useSanctumUser, d as useSanctumConfig, e as useSanctumAppConfig, o as useState, I as IDENTITY_LOADED_KEY, c as useRoute, n as navigateTo } from './server.mjs';
import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';

function trimTrailingSlash(path) {
  if (path.length > 1 && path.slice(-1) === "/") {
    return path.slice(0, -1);
  }
  return path;
}
const useSanctumAuth = () => {
  const nuxtApp = useNuxtApp();
  const user = useSanctumUser();
  const client = useSanctumClient();
  const config = useSanctumConfig();
  const appConfig = useSanctumAppConfig();
  const isAuthenticated = computed(() => {
    return user.value !== null;
  });
  const isIdentityLoaded = useState(
    IDENTITY_LOADED_KEY,
    () => false
  );
  async function init() {
    if (isIdentityLoaded.value) {
      return;
    }
    isIdentityLoaded.value = true;
    await refreshIdentity();
    await nuxtApp.callHook("sanctum:init");
  }
  async function refreshIdentity() {
    user.value = await client(config.endpoints.user);
    await nuxtApp.callHook("sanctum:refresh");
  }
  async function login(credentials, fetchIdentity = true, options = {}) {
    const currentRoute = useRoute();
    const currentPath = trimTrailingSlash(currentRoute.path);
    if (isAuthenticated.value) {
      if (!config.redirectIfAuthenticated) {
        throw new Error("User is already authenticated");
      }
      if (config.redirect.onLogin === false || config.redirect.onLogin === currentPath) {
        return;
      }
      if (config.redirect.onLogin === void 0) {
        throw new Error("`sanctum.redirect.onLogin` is not defined");
      }
      const redirectUrl2 = config.redirect.onLogin;
      await nuxtApp.callHook("sanctum:redirect", redirectUrl2);
      await nuxtApp.runWithContext(async () => await navigateTo(redirectUrl2));
    }
    if (config.endpoints.login === void 0) {
      throw new Error("`sanctum.endpoints.login` is not defined");
    }
    const fetchOptions = {
      method: "post",
      ...options,
      body: credentials
    };
    const response = await client(
      config.endpoints.login,
      fetchOptions
    );
    if (config.mode === "token") {
      if (appConfig.tokenStorage === void 0) {
        throw new Error("`sanctum.tokenStorage` is not defined in app.config.ts");
      }
      if (response.token === void 0) {
        throw new Error("Token was not returned from the API");
      }
      await appConfig.tokenStorage.set(nuxtApp, response.token);
    }
    if (fetchIdentity) {
      await refreshIdentity();
    }
    await nuxtApp.callHook("sanctum:login");
    if (config.redirect.keepRequestedRoute) {
      const requestedRoute = currentRoute.query.redirect;
      if (requestedRoute && requestedRoute !== currentPath) {
        await nuxtApp.callHook("sanctum:redirect", requestedRoute);
        await nuxtApp.runWithContext(async () => await navigateTo(requestedRoute));
        return response;
      }
    }
    if (config.redirect.onLogin === false || currentRoute.path === config.redirect.onLogin) {
      return response;
    }
    if (config.redirect.onLogin === void 0) {
      throw new Error("`sanctum.redirect.onLogin` is not defined");
    }
    const redirectUrl = config.redirect.onLogin;
    await nuxtApp.callHook("sanctum:redirect", redirectUrl);
    await nuxtApp.runWithContext(async () => await navigateTo(redirectUrl));
    return response;
  }
  async function logout(options = {}) {
    if (!isAuthenticated.value) {
      throw new Error("User is not authenticated");
    }
    const currentRoute = useRoute();
    const currentPath = trimTrailingSlash(currentRoute.path);
    if (config.endpoints.logout === void 0) {
      throw new Error("`sanctum.endpoints.logout` is not defined");
    }
    const fetchOptions = {
      method: "post",
      ...options
    };
    await client(config.endpoints.logout, fetchOptions);
    user.value = null;
    await nuxtApp.callHook("sanctum:logout");
    if (config.mode === "token") {
      await appConfig.tokenStorage.set(nuxtApp, void 0);
    }
    if (config.redirect.onLogout === false || currentPath === config.redirect.onLogout) {
      return;
    }
    if (config.redirect.onLogout === void 0) {
      throw new Error("`sanctum.redirect.onLogout` is not defined");
    }
    const redirectUrl = config.redirect.onLogout;
    await nuxtApp.callHook("sanctum:redirect", redirectUrl);
    await nuxtApp.runWithContext(async () => await navigateTo(redirectUrl));
  }
  return {
    user,
    isAuthenticated,
    init,
    login,
    logout,
    refreshIdentity
  };
};

export { trimTrailingSlash as t, useSanctumAuth as u };
//# sourceMappingURL=useSanctumAuth-CV-U5xaj.mjs.map
