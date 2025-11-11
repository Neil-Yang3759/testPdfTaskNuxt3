export async function useMyFetch(request, opts) {
    const alertStore = useAlertStore()
    const config = useRuntimeConfig();
    const { $i18n } = useNuxtApp()
    const locale = $i18n.locale

    const { data, error } = await useFetch(request, { baseURL: config.public.apiBase + '/' + locale.value, ...opts });
    if (error.value) {
        if (error.value.statusCode === 401) {
            alertStore.showAlert({
                message: `${error.value.statusCode} Unauthorized`,
                type: 'error'
            })
            await navigateTo('/login');

            return error.value.statusCode
        }
        if (error.value.statusCode === 403) {
            alertStore.showAlert({
                message: `${error.value.statusCode} Forbidden`,
                type: 'error'
            })
            return error.value.statusCode
        }
        if (error.value.statusCode === 404) {
            alertStore.showAlert({
                message: `${error.value.statusCode} Not Found`,
                type: 'error'
            })
            return error.value.statusCode
        }
        if (error.value.statusCode === 500) {
            alertStore.showAlert({
                message: `${error.value.statusCode} Internal Server Error`,
                type: 'error'
            })
            return error.value.statusCode
        }
        alertStore.showAlert({
            message: error.value.message,
            type: 'error'
        })
        return error.value
    }

    if (data.value.errorCode === 200) {
        return data.value
    }

    alertStore.showAlert({
        message: `${data.value.errorCode} ${data.value.message}`,
        type: 'error'
    })
    return data.value
};