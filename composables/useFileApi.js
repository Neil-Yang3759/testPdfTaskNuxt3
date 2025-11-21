export function useFileApi() {
  const uploadFileApi = async (file) => {
    const formData = new FormData()
    formData.append('file', file, file.name)
    return await useMyFetch(`/file/upload`, {
      method: 'POST',
      body: formData,
    })
  }
  const downloadFileApi = async (fileId) => {
    return await useMyFetch(`/file/download/${fileId}`, {
      method: 'GET',
    })
  }

  return { uploadFileApi, downloadFileApi }
}
