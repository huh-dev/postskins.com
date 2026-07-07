import { unref } from 'vue';
import { u as useRequestURL, a as useCookie } from './server.mjs';
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

const cookieTokenKey = "sanctum.token.cookie";
const cookieTokenStorage = {
  async get(app) {
    return app.runWithContext(() => {
      const cookie = useCookie(cookieTokenKey, { readonly: true, watch: false });
      return unref(cookie.value) ?? void 0;
    });
  },
  async set(app, token) {
    await app.runWithContext(() => {
      const isSecure = useRequestURL().protocol.startsWith("https");
      const cookie = useCookie(cookieTokenKey, { secure: isSecure });
      cookie.value = token;
    });
  }
};

export { cookieTokenStorage };
//# sourceMappingURL=cookieTokenStorage-CtQVKVBk.mjs.map
