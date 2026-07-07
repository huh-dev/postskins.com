import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  css: ['~/assets/css/tailwind.css'],
  compatibilityDate: '2025-01-01',
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ['@nuxt/icon', 'shadcn-nuxt', 'nuxt-auth-sanctum'],
  sanctum: {
    // Laravel API base URL. Override with NUXT_PUBLIC_SANCTUM_BASE_URL in .env.
    baseUrl: 'http://localhost:8000',
    mode: 'cookie',
    endpoints: {
      user: '/api/user',
      logout: '/logout',
    },
    redirect: {
      // Steam login is a full-page redirect, so we don't use a local login page.
      keepRequestedRoute: false,
      onLogout: '/',
    },
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
})