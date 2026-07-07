import { _ as __nuxt_component_0 } from './nuxt-link-ZNc8GHku.mjs';
import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { defineComponent, watch, mergeProps, withCtx, unref, createVNode, resolveDynamicComponent, openBlock, createBlock, createCommentVNode, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderVNode, ssrInterpolate, ssrRenderAttr, ssrRenderSlot } from 'vue/server-renderer';
import { RiStore2Line, RiFlaskLine, RiWallet3Line, RiSteamFill } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import { u as useWallet } from './useWallet-B-bYuplg.mjs';
import { c as useRoute } from './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import './useSanctumAuth-CV-U5xaj.mjs';
import './useSanctumClient-CyejobjL.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, isAuthenticated, loginWithSteam, logout } = useAuth();
    const { wallet, load: loadWallet } = useWallet();
    const route = useRoute();
    const links = [
      { to: "/inventory", label: "Inventory" },
      { to: "/market", label: "Market" },
      { to: "/sell", label: "Sell" },
      { to: "/trade-lab", label: "Lab", icon: RiFlaskLine }
    ];
    watch(
      [() => route.fullPath, isAuthenticated],
      () => {
        if (isAuthenticated.value) {
          loadWallet();
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Button = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-svh" }, _attrs))}><header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur"><div class="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4"><div class="flex items-center gap-1">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "mr-2 flex items-center gap-1.5 font-semibold"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(RiStore2Line), { class: "size-5 text-primary" }, null, _parent2, _scopeId));
            _push2(`<span class="hidden sm:inline"${_scopeId}>Postskins</span>`);
          } else {
            return [
              createVNode(unref(RiStore2Line), { class: "size-5 text-primary" }),
              createVNode("span", { class: "hidden sm:inline" }, "Postskins")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="flex items-center gap-0.5"><!--[-->`);
      ssrRenderList(links, (link) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: link.to,
          to: link.to,
          "active-class": "bg-muted text-foreground",
          class: "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (link.icon) {
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(link.icon), { class: "size-3.5" }, null), _parent2, _scopeId);
              } else {
                _push2(`<!---->`);
              }
              _push2(` ${ssrInterpolate(link.label)}`);
            } else {
              return [
                link.icon ? (openBlock(), createBlock(resolveDynamicComponent(link.icon), {
                  key: 0,
                  class: "size-3.5"
                })) : createCommentVNode("", true),
                createTextVNode(" " + toDisplayString(link.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></div><div class="flex items-center gap-2">`);
      if (unref(isAuthenticated)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/market",
          class: "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-sm transition-colors hover:border-ring/60",
          title: "Wallet balance"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(RiWallet3Line), { class: "size-4 text-muted-foreground" }, null, _parent2, _scopeId));
              _push2(`<span class="font-mono font-medium tabular-nums"${_scopeId}>${ssrInterpolate(unref(formatMoney)(unref(wallet)?.balance, unref(wallet)?.currency))}</span>`);
            } else {
              return [
                createVNode(unref(RiWallet3Line), { class: "size-4 text-muted-foreground" }),
                createVNode("span", { class: "font-mono font-medium tabular-nums" }, toDisplayString(unref(formatMoney)(unref(wallet)?.balance, unref(wallet)?.currency)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(user)?.avatar) {
          _push(`<img${ssrRenderAttr("src", unref(user).avatar)}${ssrRenderAttr("alt", unref(user).name)} class="size-7 rounded-full">`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_Button, {
          variant: "ghost",
          size: "sm",
          onClick: ($event) => unref(logout)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sign out`);
            } else {
              return [
                createTextVNode("Sign out")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(ssrRenderComponent(_component_Button, {
          variant: "outline",
          size: "sm",
          onClick: ($event) => unref(loginWithSteam)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(RiSteamFill), null, null, _parent2, _scopeId));
              _push2(` Sign in `);
            } else {
              return [
                createVNode(unref(RiSteamFill)),
                createTextVNode(" Sign in ")
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div></div></header><main>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CYd8uOKa.mjs.map
