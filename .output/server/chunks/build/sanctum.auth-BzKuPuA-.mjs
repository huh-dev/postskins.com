import { C as executeAsync } from '../nitro/nitro.mjs';
import { g as defineNuxtRouteMiddleware, d as useSanctumConfig, h as createError, n as navigateTo, b as useNuxtApp, e as useSanctumAppConfig, f as useSanctumLogger, a as useCookie } from './server.mjs';
import { t as trimTrailingSlash, u as useSanctumAuth } from './useSanctumAuth-CV-U5xaj.mjs';
import { unref } from 'vue';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';
import './useSanctumClient-CyejobjL.mjs';

async function isUserSessionActive() {
  const nuxtApp = useNuxtApp();
  const options = useSanctumConfig();
  const appConfig = useSanctumAppConfig();
  const { isAuthenticated, refreshIdentity } = useSanctumAuth();
  if (isAuthenticated.value === false) {
    return false;
  }
  const logger = useSanctumLogger(options.logLevel);
  if (options.mode == "cookie") {
    const csrfToken = unref(
      useCookie(
        options.csrf.cookie,
        { readonly: true, watch: false }
      )
    );
    if (!csrfToken) {
      try {
        logger.debug("[sanctum] csrf cookie is outdated, refreshing identity");
        await refreshIdentity();
      } catch {
        logger.debug("[sanctum] unable to refresh identity on route change");
      }
    }
  }
  if (options.mode == "token") {
    const token = await appConfig.tokenStorage.get(nuxtApp);
    if (!token) {
      try {
        logger.debug("[sanctum] csrf token is outdated, refreshing identity");
        await refreshIdentity();
      } catch {
        logger.debug("[sanctum] unable to refresh identity on route change");
      }
    }
  }
  return isAuthenticated.value;
}
const sanctum_auth = defineNuxtRouteMiddleware(async (to) => {
  let __temp, __restore;
  const options = useSanctumConfig();
  if ([__temp, __restore] = executeAsync(() => isUserSessionActive()), __temp = await __temp, __restore(), __temp) {
    return;
  }
  const endpoint = options.redirect.onAuthOnly;
  if (endpoint === void 0) {
    throw new Error("`sanctum.redirect.onAuthOnly` is not defined");
  }
  if (endpoint === false) {
    throw createError({ statusCode: 403 });
  }
  const redirect = { path: endpoint };
  if (options.redirect.keepRequestedRoute) {
    redirect.query = { redirect: trimTrailingSlash(to.fullPath) };
  }
  return navigateTo(redirect, { replace: true });
});

export { sanctum_auth as default };
//# sourceMappingURL=sanctum.auth-BzKuPuA-.mjs.map
