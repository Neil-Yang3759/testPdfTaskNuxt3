import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alert', () => {
    const show = ref(false)
    const message = ref('')
    const type = ref('')
    const timeout = ref(5000)

    const init = () => {
        // 從cookie中取出alert資料
        const cookieStore = this.$cookies.get('store-alert')
        if (cookieStore) {
            this.commit('alert/showMessage', cookieStore)
            this.$cookies.remove('store-alert')
        }
    }
    const showMessage = (payload) => {
        message.value = payload.message
        type.value = payload.type
        show.value = true
        timeout.value = payload.timeout || 5000
    }
    const closeMessage = () => {
        show.value = false
    }


    return {
        show,
        message,
        type,
        timeout,
        init,
        showMessage,
        closeMessage
    }
})