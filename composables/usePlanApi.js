export function usePlanApi() {
  const getRestrictApi = async () => await useMyFetch(`/plan/restrict`)

  return { getRestrictApi }
}
