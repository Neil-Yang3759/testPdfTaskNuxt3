import { defineStore } from 'pinia'

export const useGlobalVarStore = defineStore('globalVar', () => {
  const loading = ref(false)
  return { loading }
})
