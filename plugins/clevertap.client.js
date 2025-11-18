export default defineNuxtPlugin(async (nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()

  let clevertapModule
  try {
    clevertapModule = await import('clevertap-web-sdk')
  } catch (error) {
    console.error('CleverTap SDK load failed:', error)
    return
  }

  const clevertap = clevertapModule.default || clevertapModule

  // 1. 初始化 CleverTap
  clevertap.init(
    runtimeConfig.public.clevertapProjectId
    // runtimeConfig.public.clevertapRegion
  )

  // 2. 重要：開啟 SPA 支援
  // 這會確保切換路由時，CleverTap 能正確處理頁面瀏覽事件
  clevertap.spa = true

  // 3. (選用) 設定隱私權限
  // clevertap.privacy.push({ optOut: false })
  // clevertap.privacy.push({ useIP: false })

  // 4. 將 clevertap 注入到 Nuxt App 中
  // 這樣你就可以在任何組件用 useNuxtApp().$clevertap 呼叫它
  return {
    provide: {
      clevertap,
    },
  }
})
