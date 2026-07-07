import { u as useSanctumAuth } from './useSanctumAuth-CV-U5xaj.mjs';
import { g as defineNuxtRouteMiddleware, d as useSanctumConfig, h as createError, n as navigateTo } from './server.mjs';
import 'vue';
import './useSanctumClient-CyejobjL.mjs';
import '../nitro/nitro.mjs';
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

const sanctum_guest = defineNuxtRouteMiddleware(() => {
  const options = useSanctumConfig();
  const { isAuthenticated } = useSanctumAuth();
  if (!isAuthenticated.value) {
    return;
  }
  const endpoint = options.redirect.onGuestOnly;
  if (endpoint === void 0) {
    throw new Error("`sanctum.redirect.onGuestOnly` is not defined");
  }
  if (endpoint === false) {
    throw createError({ statusCode: 403 });
  }
  return navigateTo(endpoint, { replace: true });
});

export { sanctum_guest as default };
//# sourceMappingURL=sanctum.guest-1FR999Pn.mjs.map
