export function usePlanApi() {
    const restrictApi = async () => await useMyFetch(`/plan/restrict`)
    return { restrictApi };
}