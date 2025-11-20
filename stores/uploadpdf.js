export const useUploadPdfStore = defineStore('uploadPdf', () => {
  const taskPersonCount = ref(1)
  const fileCount = ref(0)
  const fileUploadFromIndex = ref(null)

  return {
    taskPersonCount,
    fileCount,
    fileUploadFromIndex,
  }
})
