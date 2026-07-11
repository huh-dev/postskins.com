export interface CatalogItem {
  item_description_id: number
  name: string | null
  market_hash_name: string
  type: string | null
  icon_url: string | null
}

/**
 * Search the item catalog (item_descriptions) so a user can name the items they
 * WANT on a post. The catalog only holds items someone on the platform has
 * synced, so rare items nobody owns yet won't appear.
 */
export function useCatalog() {
  const client = useSanctumClient()

  const results = ref<CatalogItem[]>([])
  const loading = ref(false)

  async function search(term: string): Promise<void> {
    loading.value = true
    try {
      results.value = (await client<{ items: CatalogItem[] }>("/api/catalog/items", {
        query: term ? { search: term } : undefined,
      })).items
    }
    catch {
      results.value = []
    }
    finally {
      loading.value = false
    }
  }

  return { results, loading, search }
}
