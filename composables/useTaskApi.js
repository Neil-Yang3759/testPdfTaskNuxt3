export function useTaskApi() {
  const startPdfTaskApi = async (taskId, data) =>
    await useMyFetch(`/task/startPdf/${taskId}`, {
      method: 'POST',
      body: data,
    })

  return { startPdfTaskApi }
}
