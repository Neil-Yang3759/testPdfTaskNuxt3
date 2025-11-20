import { useGlobalVarStore } from '~/stores/globalVar'

export default defineNuxtRouteMiddleware((to, from) => {
  const globalVarStore = useGlobalVarStore()
  globalVarStore.loading = true
  const token = useCookie('PDF_JWT_TOKEN')

  // 1. 設定白名單 (不需要登入就能去的頁面)
  const whiteList = ['/login']

  // 2. 如果使用者「沒有 Token」且「不在白名單內」
  if (!token.value && !whiteList.includes(to.path)) {
    // 強制踢回登入頁
    return navigateTo('/login')
  }

  // 3. (選用) 如果使用者「已經有 Token」卻還想去「登入頁」
  if (token.value && to.path === '/login') {
    // 把他踢回首頁，不讓他重複登入
    return navigateTo('/')
  }

  // 设置loading为false
  setTimeout(() => {
    globalVarStore.loading = false
  }, 2000)
})
