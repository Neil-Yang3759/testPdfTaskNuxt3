
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAlertStore = defineStore('alert', () => {
    const show = ref(false)
    const message = ref('')
    const type = ref('')
    const iconList = ref([{ 'error': 'mdi-alert' }, { 'success': 'mdi-check-circle' }, { 'warning': 'mdi-alert-outline' }, { 'info': 'mdi-information-outline' }])

    const icon = computed(() => {
        const iconItem = iconList.value.find((item) => item[type.value])
        return iconItem ? iconItem[type.value] : ''
    })

    function showAlert(payload) {
        message.value = payload.message
        type.value = payload.type
        show.value = true
    }

    function closeMessage() {
        show.value = false
    }

    return {
        show,
        message,
        type,
        icon,
        showAlert,
        closeMessage,
    }
})
