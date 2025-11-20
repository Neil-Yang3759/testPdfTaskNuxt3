export function usePdfTaskApi() {
  const createPdfTaskApi = async (data) =>
    await useMyFetch(`/pdfTask/createPdfTask`, {
      method: 'POST',
      body: data,
    })

  return { createPdfTaskApi }
}
