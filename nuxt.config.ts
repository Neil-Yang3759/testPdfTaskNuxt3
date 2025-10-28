import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, maximum-scale=1',
        },
        {
          key: 'description',
          name: 'description',
          content: '安全．簡易．高規格的全方位電子簽名服務',
        },
        {
          key: 'og:site_name',
          property: 'og:site_name',
          content: 'BreezySign',
        },
        {
          key: 'og:description',
          property: 'og:description',
          content: '安全．簡易．高規格的全方位電子簽名服務',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        {
          rel: 'apple-touch-icon',
          type: 'image/jpg',
          href: '/images/logo/icon.jpg',
        },
        {
          rel: 'shortcut icon',
          type: 'image/jpg',
          href: '/images/logo/icon.jpg',
        },
      ],
      script: [
        {
          src: `https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_GA_ID}`,
          async: true,
        },
      ],
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    'dayjs-nuxt',
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
  ],
  runtimeConfig: {
    // The private keys which are only available server-side
    googleApiClientId: '123',
    facebookId: '123',
    googleClientId: '123',
    appleClientId: '123',
    turnServerCredential: '123',
    // 追蹤相關
    clevertapProjectId: '123',
    // Keys within public are also exposed client-side
    public: {
      version: '1.0.0',
      websocketURL: 'ws://localhost:3000',
      frontendURL: 'http://localhost:3000',
      landingURL: 'http://localhost:3000',
      apiBase: 'http://localhost:3000',
      appleReturnUri: 'http://localhost:3000',
      environment: 'testing',
      betaCompany: 'true',
      smsPerPerson: '2',
      smsPathLength: 9, // url path: `/s/xxxxxx`
      smsLengthLimit: 67,
      roomUrl: 'http://localhost:3000',
      roomPeerUrl: 'http://localhost:3000',
      roomPeerPath: 'http://localhost:3000',
      stunServerUrl: 'http://localhost:3000',
      turnServerUrl: 'http://localhost:3000',
      turnServerUserName: '123',
    },
  },

  appConfig: {
    theme: {
      primaryColor: '#00ff00'
    }
  },
  devServer: {
    port: 8080,
    host: '0.0.0.0' // This will make the server accessible on your local network
  },
  i18n: {
    strategy: "no_prefix",
    langDir: '../locales',
    defaultLocale: "zh-TW",
    compilation: {
      strictMessage: false,
    },
    locales: [
      {
        code: 'en-US',
        iso: 'en-US',
        file: 'en-US.json'
      },
      {
        code: 'zh-TW',
        iso: 'zh-TW',
        file: 'zh-TW.json'
      }
    ],
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
})