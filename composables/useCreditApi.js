export function useCreditApi() {
  const getRulesApi = async () => await useMyFetch(`/credit/listAllRule`)

  return { getRulesApi }
}
