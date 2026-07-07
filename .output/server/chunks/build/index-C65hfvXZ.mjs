import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-ZNc8GHku.mjs';
import { defineComponent, mergeProps, unref, withCtx, createTextVNode, createVNode, resolveDynamicComponent, openBlock, createBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderVNode } from 'vue/server-renderer';
import { RiStore2Line, RiPriceTag3Line, RiArchiveLine, RiFlaskLine, RiArrowRightLine } from '@remixicon/vue';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';
import './useSanctumAuth-CV-U5xaj.mjs';
import './useSanctumClient-CyejobjL.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, isAuthenticated, loginWithSteam } = useAuth();
    const actions = [
      { to: "/market", title: "Market", description: "Browse skins for sale and buy them P2P.", icon: RiStore2Line },
      { to: "/sell", title: "Sell", description: "List a tradable item from your inventory.", icon: RiPriceTag3Line },
      { to: "/inventory", title: "Inventory", description: "View your synced CS2 items.", icon: RiArchiveLine },
      { to: "/trade-lab", title: "Trade lab", description: "Simulate the full trade lifecycle locally.", icon: RiFlaskLine }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto w-full max-w-4xl px-4 py-10 sm:py-16" }, _attrs))}><section class="text-center"><h1 class="text-2xl font-semibold sm:text-3xl">Trade CS2 skins, protected end-to-end</h1><p class="mx-auto mt-2 max-w-xl text-sm text-muted-foreground"> Peer-to-peer trades with balance held until Steam&#39;s 7-day trade-protection window passes — reversals are caught and refunded automatically. </p>`);
      if (!unref(isAuthenticated)) {
        _push(`<div class="mt-6 flex justify-center">`);
        _push(ssrRenderComponent(_component_Button, {
          size: "lg",
          onClick: ($event) => unref(loginWithSteam)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sign in with Steam`);
            } else {
              return [
                createTextVNode("Sign in with Steam")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<p class="mt-4 text-sm"> Signed in as <strong>${ssrInterpolate(unref(user)?.name)}</strong></p>`);
      }
      _push(`</section>`);
      if (unref(isAuthenticated)) {
        _push(`<section class="mt-10 grid gap-3 sm:grid-cols-2"><!--[-->`);
        ssrRenderList(actions, (action) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: action.to,
            to: action.to,
            class: "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/60"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground"${_scopeId}>`);
                ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(action.icon), { class: "size-5" }, null), _parent2, _scopeId);
                _push2(`</span><div class="min-w-0 flex-1"${_scopeId}><p class="flex items-center gap-1 font-medium"${_scopeId}>${ssrInterpolate(action.title)} `);
                _push2(ssrRenderComponent(unref(RiArrowRightLine), { class: "size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" }, null, _parent2, _scopeId));
                _push2(`</p><p class="mt-0.5 text-sm text-muted-foreground"${_scopeId}>${ssrInterpolate(action.description)}</p></div>`);
              } else {
                return [
                  createVNode("span", { class: "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground" }, [
                    (openBlock(), createBlock(resolveDynamicComponent(action.icon), { class: "size-5" }))
                  ]),
                  createVNode("div", { class: "min-w-0 flex-1" }, [
                    createVNode("p", { class: "flex items-center gap-1 font-medium" }, [
                      createTextVNode(toDisplayString(action.title) + " ", 1),
                      createVNode(unref(RiArrowRightLine), { class: "size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" })
                    ]),
                    createVNode("p", { class: "mt-0.5 text-sm text-muted-foreground" }, toDisplayString(action.description), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-C65hfvXZ.mjs.map
