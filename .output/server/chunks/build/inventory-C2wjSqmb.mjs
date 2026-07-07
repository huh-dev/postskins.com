import { _ as _sfc_main$2 } from './index-ZcX2QkUC.mjs';
import { defineComponent, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { RiSteamFill, RiLoopRightLine, RiEyeOffLine, RiErrorWarningLine, RiInboxLine, RiLock2Line } from '@remixicon/vue';
import { u as useInventory, t as tradeLockLabel, a as tradeLockTitle } from './useInventory-BRB_6jb1.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
import './useSanctumClient-CyejobjL.mjs';
import './server.mjs';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';
import './useSanctumAuth-CV-U5xaj.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InventoryItemCard",
  __ssrInlineRender: true,
  props: {
    item: {}
  },
  setup(__props) {
    const lockLabel = computed(() => tradeLockLabel(__props.item));
    const lockTitle = computed(() => tradeLockTitle(__props.item));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-ring/60", { "opacity-90": !__props.item.tradable }]
      }, _attrs))}>`);
      if (unref(lockLabel)) {
        _push(`<span${ssrRenderAttr("title", unref(lockTitle) ?? void 0)} class="absolute left-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-sm bg-background/85 px-1.5 py-0.5 text-[0.625rem] font-medium text-amber-600 backdrop-blur-sm dark:text-amber-400">`);
        _push(ssrRenderComponent(unref(RiLock2Line), { class: "size-2.5" }, null, _parent));
        _push(` ${ssrInterpolate(unref(lockLabel))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-3">`);
      if (__props.item.icon_url) {
        _push(`<img${ssrRenderAttr("src", __props.item.icon_url)}${ssrRenderAttr("alt", __props.item.market_name ?? __props.item.name ?? "Item")} loading="lazy" class="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105">`);
      } else {
        _push(`<div class="text-xs text-muted-foreground">No image</div>`);
      }
      _push(`</div><div class="flex flex-1 flex-col gap-0.5 border-t border-border px-2.5 py-2"><p class="truncate text-xs font-medium"${ssrRenderAttr("title", __props.item.market_name ?? __props.item.name ?? "")}>${ssrInterpolate(__props.item.market_name ?? __props.item.name ?? "Unknown item")}</p><div class="flex items-center justify-between gap-1"><p class="truncate text-[0.625rem] text-muted-foreground"${ssrRenderAttr("title", __props.item.type ?? "")}>${ssrInterpolate(__props.item.type ?? "—")}</p>`);
      if (__props.item.amount > 1) {
        _push(`<span class="shrink-0 rounded-sm bg-muted px-1 text-[0.625rem] font-medium text-muted-foreground"> ×${ssrInterpolate(__props.item.amount)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/inventory/InventoryItemCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_1 = Object.assign(_sfc_main$1, { __name: "InventoryItemCard" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "inventory",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, loginWithSteam } = useAuth();
    const { items, status, stale, isLoading, errorMessage, load } = useInventory();
    watch(isAuthenticated, (authenticated, wasAuthenticated) => {
      if (authenticated && !wasAuthenticated) {
        load();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$2;
      const _component_InventoryItemCard = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-svh w-full max-w-6xl p-4 sm:p-6" }, _attrs))}>`);
      if (!unref(isAuthenticated)) {
        _push(`<div class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">`);
        _push(ssrRenderComponent(unref(RiSteamFill), { class: "size-10 text-muted-foreground" }, null, _parent));
        _push(`<div><h1 class="text-lg font-semibold">Your inventory</h1><p class="mt-1 text-sm text-muted-foreground">Sign in with Steam to view your CS2 items.</p></div>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "outline",
          onClick: ($event) => unref(loginWithSteam)()
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(RiSteamFill), null, null, _parent2, _scopeId));
              _push2(` Sign in with Steam `);
            } else {
              return [
                createVNode(unref(RiSteamFill)),
                createTextVNode(" Sign in with Steam ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!--[--><header class="mb-4 flex items-center justify-between gap-3"><div><h1 class="text-lg font-semibold">Inventory</h1><p class="text-xs text-muted-foreground">`);
        if (unref(status) === "success") {
          _push(`<!--[-->${ssrInterpolate(unref(items).length)} ${ssrInterpolate(unref(items).length === 1 ? "item" : "items")} `);
          if (unref(stale)) {
            _push(`<span class="text-amber-600 dark:text-amber-400"> · showing last known (Steam unavailable)</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        } else if (unref(isLoading)) {
          _push(`<!--[-->Loading…<!--]-->`);
        } else {
          _push(`<!--[-->Counter-Strike 2<!--]-->`);
        }
        _push(`</p></div>`);
        _push(ssrRenderComponent(_component_Button, {
          variant: "outline",
          size: "sm",
          disabled: unref(isLoading),
          onClick: ($event) => unref(load)({ fresh: true })
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(unref(RiLoopRightLine), {
                class: { "animate-spin": unref(isLoading) }
              }, null, _parent2, _scopeId));
              _push2(` Refresh `);
            } else {
              return [
                createVNode(unref(RiLoopRightLine), {
                  class: { "animate-spin": unref(isLoading) }
                }, null, 8, ["class"]),
                createTextVNode(" Refresh ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</header>`);
        if (unref(status) === "private") {
          _push(`<div class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">`);
          _push(ssrRenderComponent(unref(RiEyeOffLine), { class: "size-10 text-muted-foreground" }, null, _parent));
          _push(`<div class="max-w-md"><h2 class="text-sm font-semibold">Your inventory is private</h2><p class="mt-1 text-sm text-muted-foreground"> Steam hides private inventories from everyone. Set your inventory privacy to <strong>Public</strong>, then reload. </p></div><div class="flex gap-2">`);
          _push(ssrRenderComponent(_component_Button, {
            variant: "outline",
            size: "sm",
            as: "a",
            href: "https://steamcommunity.com/my/edit/settings",
            target: "_blank",
            rel: "noopener"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Open Steam privacy settings `);
              } else {
                return [
                  createTextVNode(" Open Steam privacy settings ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_Button, {
            size: "sm",
            onClick: ($event) => unref(load)({ fresh: true })
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`I&#39;ve made it public`);
              } else {
                return [
                  createTextVNode("I've made it public")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div>`);
        } else if (unref(status) === "error") {
          _push(`<div class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">`);
          _push(ssrRenderComponent(unref(RiErrorWarningLine), { class: "size-10 text-destructive" }, null, _parent));
          _push(`<p class="max-w-md text-sm text-muted-foreground">${ssrInterpolate(unref(errorMessage))}</p>`);
          _push(ssrRenderComponent(_component_Button, {
            variant: "outline",
            size: "sm",
            onClick: ($event) => unref(load)({ fresh: true })
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Try again`);
              } else {
                return [
                  createTextVNode("Try again")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else if (unref(isLoading) && unref(items).length === 0) {
          _push(`<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"><!--[-->`);
          ssrRenderList(18, (n) => {
            _push(`<div class="animate-pulse overflow-hidden rounded-lg border border-border bg-card"><div class="aspect-[4/3] bg-muted"></div><div class="space-y-1.5 border-t border-border px-2.5 py-2"><div class="h-3 w-4/5 rounded bg-muted"></div><div class="h-2.5 w-2/5 rounded bg-muted"></div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else if (unref(status) === "success" && unref(items).length === 0) {
          _push(`<div class="flex min-h-[50svh] flex-col items-center justify-center gap-3 text-center">`);
          _push(ssrRenderComponent(unref(RiInboxLine), { class: "size-10 text-muted-foreground" }, null, _parent));
          _push(`<p class="text-sm text-muted-foreground">No CS2 items found in this inventory.</p></div>`);
        } else {
          _push(`<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"><!--[-->`);
          ssrRenderList(unref(items), (item) => {
            _push(ssrRenderComponent(_component_InventoryItemCard, {
              key: item.asset_id,
              item
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/inventory.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=inventory-C2wjSqmb.mjs.map
