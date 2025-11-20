export function useCompanyApi() {
  const getWatermarkApi = async () => await useMyFetch(`/company/getWatermark`)

  return { getWatermarkApi }
}
