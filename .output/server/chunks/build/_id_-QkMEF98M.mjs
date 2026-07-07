import { _ as _sfc_main$1 } from './index-ZcX2QkUC.mjs';
import { u as useTrade, _ as __nuxt_component_1, t as tradeEventLabel } from './useTrade-BZQUdb7u.mjs';
import { defineComponent, computed, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { RiSteamFill, RiErrorWarningLine, RiShieldCheckLine, RiArrowRightLine } from '@remixicon/vue';
import { f as formatMoney } from './format-BBBd5tQz.mjs';
import { c as useRoute } from './server.mjs';
import { u as useAuth } from './auth-Dmkix5Lz.mjs';
import 'class-variance-authority';
import 'reka-ui';
import 'clsx';
import 'tailwind-merge';
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
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';
import 'consola';
import './useSanctumAuth-CV-U5xaj.mjs';

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = (() => {
  console.error(intervalError);
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const { isAuthenticated, loginWithSteam, user } = useAuth();
    const { trade, status, isLoading, errorMessage, load } = useTrade(() => route.params.id);
    const isSeller = computed(() => !!user.value && trade.value?.seller?.id === user.value.id);
    let timer;
    function startPolling() {
      stopPolling();
      timer = setInterval();
    }
    function stopPolling() {
      if (timer) {
        clearInterval(timer);
        timer = void 0;
      }
    }
    watch(isAuthenticated, (authenticated) => {
      if (authenticated) {
        load().then(startPolling);
      }
    });
    const protectionLabel = computed(() => {
      if (!trade.value?.protection_expires_at) {
        return null;
      }
      const remainingMs = new Date(trade.value.protection_expires_at).getTime() - Date.now();
      if (remainingMs <= 0) {
        return "Protection window ended";
      }
      const days = Math.floor(remainingMs / 864e5);
      const hours = Math.floor(remainingMs % 864e5 / 36e5);
      return `Protected for ${days >= 1 ? `${days}d ${hours}h` : `${hours}h`}`;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Button = _sfc_main$1;
      const _component_TradeStatusBadge = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "mx-auto min-h-svh w-full max-w-2xl p-4 sm:p-6" }, _attrs))}>`);
      if (!unref(isAuthenticated)) {
        _push(`<div class="flex min-h-[60svh] flex-col items-center justify-center gap-4 text-center">`);
        _push(ssrRenderComponent(unref(RiSteamFill), { class: "size-10 text-muted-foreground" }, null, _parent));
        _push(`<div><h1 class="text-lg font-semibold">Sign in to view this trade</h1><p class="mt-1 text-sm text-muted-foreground">You must be a party to the trade to see it.</p></div>`);
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
        _push(`<!--[-->`);
        if (unref(isLoading)) {
          _push(`<div class="flex min-h-[50svh] items-center justify-center"><div class="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"></div></div>`);
        } else if (unref(status) === "error") {
          _push(`<div class="flex min-h-[50svh] flex-col items-center justify-center gap-4 text-center">`);
          _push(ssrRenderComponent(unref(RiErrorWarningLine), { class: "size-10 text-destructive" }, null, _parent));
          _push(`<p class="max-w-md text-sm text-muted-foreground">${ssrInterpolate(unref(errorMessage))}</p>`);
          _push(ssrRenderComponent(_component_Button, {
            variant: "outline",
            size: "sm",
            onClick: ($event) => unref(load)()
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
        } else if (unref(trade)) {
          _push(`<div class="space-y-4"><header class="flex items-center justify-between gap-3"><div><h1 class="text-lg font-semibold">Trade #${ssrInterpolate(unref(trade).id)}</h1><p class="text-xs text-muted-foreground">${ssrInterpolate(unref(trade).buyer?.name)} buying from ${ssrInterpolate(unref(trade).seller?.name)}</p></div>`);
          _push(ssrRenderComponent(_component_TradeStatusBadge, {
            status: unref(trade).status
          }, null, _parent));
          _push(`</header><div class="flex items-center gap-4 rounded-lg border border-border bg-card p-4"><div class="flex size-20 shrink-0 items-center justify-center rounded-md bg-[radial-gradient(circle_at_center,theme(colors.muted)_0%,transparent_70%)] p-2">`);
          if (unref(trade).item.icon_url) {
            _push(`<img${ssrRenderAttr("src", unref(trade).item.icon_url)}${ssrRenderAttr("alt", unref(trade).item.name ?? "Item")} class="max-h-full max-w-full object-contain">`);
          } else {
            _push(`<span class="text-xs text-muted-foreground">No image</span>`);
          }
          _push(`</div><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">${ssrInterpolate(unref(trade).item.name)}</p><p class="truncate text-xs text-muted-foreground">${ssrInterpolate(unref(trade).market_hash_name)}</p></div><span class="shrink-0 font-mono text-base font-semibold tabular-nums">${ssrInterpolate(unref(formatMoney)(unref(trade).price, unref(trade).currency))}</span></div>`);
          if (unref(trade).status === "accepted" && unref(protectionLabel)) {
            _push(`<div class="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">`);
            _push(ssrRenderComponent(unref(RiShieldCheckLine), { class: "size-4 shrink-0" }, null, _parent));
            _push(`<span>${ssrInterpolate(unref(protectionLabel))} — the seller is paid once it passes with no reversal.</span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(trade).status === "pending_delivery") {
            _push(`<div class="rounded-lg border border-dashed border-border p-4 text-sm">`);
            if (unref(isSeller)) {
              _push(`<!--[--><p class="font-medium">Send the item to complete the sale</p><p class="mt-0.5 text-muted-foreground"> The offer is sent for you with the item already attached — just confirm the outgoing offer on your Steam mobile authenticator. </p>`);
              if (unref(trade).steam_trade_link) {
                _push(`<a${ssrRenderAttr("href", unref(trade).steam_trade_link)} target="_blank" rel="noopener" class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"> Fallback: send manually in Steam `);
                _push(ssrRenderComponent(unref(RiArrowRightLine), { class: "size-3.5" }, null, _parent));
                _push(`</a>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            } else {
              _push(`<p class="text-muted-foreground"> Waiting for the seller to send the trade offer. It will arrive in your Steam inbox — you don&#39;t need to open or create anything. </p>`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(trade).events?.length) {
            _push(`<section class="rounded-lg border border-border bg-card p-4"><h2 class="mb-3 text-sm font-semibold">History</h2><ol class="space-y-2.5"><!--[-->`);
            ssrRenderList(unref(trade).events, (event) => {
              _push(`<li class="flex items-start gap-2.5 text-xs"><span class="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground/60"></span><div class="flex-1"><p class="font-medium">${ssrInterpolate(("tradeEventLabel" in _ctx ? _ctx.tradeEventLabel : unref(tradeEventLabel))(event.type))}</p><p class="text-muted-foreground">${ssrInterpolate(event.created_at ? new Date(event.created_at).toLocaleString() : "")}</p></div></li>`);
            });
            _push(`<!--]--></ol></section>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/trade/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-QkMEF98M.mjs.map
