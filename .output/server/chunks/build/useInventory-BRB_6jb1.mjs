import { u as useSanctumClient } from './useSanctumClient-CyejobjL.mjs';
import { ref, computed } from 'vue';

function useInventory() {
  const client = useSanctumClient();
  const items = ref([]);
  const status = ref("idle");
  const stale = ref(false);
  const errorMessage = ref(null);
  const isLoading = computed(() => status.value === "loading");
  async function load(options = {}) {
    status.value = "loading";
    errorMessage.value = null;
    try {
      const data = await client("/api/inventory", {
        query: options.fresh ? { fresh: 1 } : void 0
      });
      items.value = data.items;
      stale.value = data.stale;
      status.value = "success";
    } catch (error) {
      const response = error;
      if (response.response?.status === 409) {
        status.value = "private";
        return;
      }
      status.value = "error";
      errorMessage.value = response.data?.message ?? "We could not load your inventory. Please try again.";
    }
  }
  return { items, status, stale, isLoading, errorMessage, load };
}
function tradeLockLabel(item) {
  if (item.tradable) {
    return null;
  }
  if (!item.tradable_after) {
    return "Trade locked";
  }
  const remainingMs = new Date(item.tradable_after).getTime() - Date.now();
  if (remainingMs <= 0) {
    return "Unlocking…";
  }
  const days = Math.floor(remainingMs / 864e5);
  const hours = Math.floor(remainingMs % 864e5 / 36e5);
  return days >= 1 ? `${days}d ${hours}h` : `${hours}h`;
}
function tradeLockTitle(item) {
  if (item.tradable || !item.tradable_after) {
    return null;
  }
  return `Tradable after ${new Date(item.tradable_after).toLocaleString()}`;
}

export { tradeLockTitle as a, tradeLockLabel as t, useInventory as u };
//# sourceMappingURL=useInventory-BRB_6jb1.mjs.map
