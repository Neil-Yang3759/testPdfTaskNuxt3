export const useMessageDialogStore = defineStore('messageDialog', () => {
  const message = ref('')
  const width = ref(0)
  const show = ref(false)

  function showMessage(payload) {
    message.value = payload.message
    width.value = payload.width
    show.value = true
  }

  return {
    message,
    width,
    show,
    showMessage,
  }
})
