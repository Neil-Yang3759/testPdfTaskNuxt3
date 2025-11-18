export async function useMyFetch(request, opts) {
  const alertStore = useAlertStore()
  const config = useRuntimeConfig()
  const { $i18n } = useNuxtApp()

  const token = useCookie('PDF_JWT_TOKEN')

  const reactiveBaseURL = computed(() => {
    return config.public.apiBase + '/' + $i18n.locale.value
  })

  let options = { ...opts }

  if (token.value) {
    // 確保 headers 存在並設定 Authorization
    options.headers = options.headers
      ? new Headers(options.headers)
      : new Headers() // 確保是 Headers 物件
    options.headers.set('Authorization', 'Bearer ' + token.value)
  }

  try {
    const data = await $fetch(request, {
      baseURL: reactiveBaseURL.value,
      body: options.body,
      method: options.method,
      headers: options.headers,
    })
    if (data.errorCode !== 200) {
      alertStore.showAlert({
        message: `${data.errorCode} ${data.message}`,
        type: 'error',
      })
    }
    return data
  } catch (error) {
    if (error) {
      switch (error.statusCode) {
        case 401:
          alertStore.showAlert({
            message: `${error.statusCode} Unauthorized`,
            type: 'error',
          })
          await navigateTo('/login')
          return error.statusCode
        case 403:
          alertStore.showAlert({
            message: `${error.statusCode} Forbidden`,
            type: 'error',
          })
          return error.statusCode
        case 404:
          alertStore.showAlert({
            message: `${error.statusCode} Not Found`,
            type: 'error',
          })
          return error.statusCode
        case 500:
          alertStore.showAlert({
            message: `${error.statusCode} Internal Server Error`,
            type: 'error',
          })
          return error.statusCode
        default:
          alertStore.showAlert({
            message: error.message,
            type: 'error',
          })
          return error
      }
    }
  }
}
