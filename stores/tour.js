import { defineStore } from 'pinia'

// !!! 關鍵假設 !!!
import { useMainStore } from '~/stores/index'

export const useTourStore = defineStore('tour', () => {
  // --- 1. State (使用 ref) ---
  const eventInfo = ref(null)
  const startSignTask = ref(false)
  const startCreateTask = ref(false)
  const startCreateTemplate = ref(false)
  const tutorialState = ref({})
  const redeemSuccess = ref(false)
  const minimizeTourEventBlock = ref(true)

  const closeProcessingDialog = computed(() => {
    return eventInfo.value !== null
      ? eventInfo.value.closeProcessingDialog
      : false
  })

  const closeSpecialDialog = computed(() => {
    return eventInfo.value !== null ? eventInfo.value.closeSpecialDialog : false
  })

  const getTutorialState = computed(() => {
    const mainStore = useMainStore() // 存取 user store
    const userId = mainStore.userInfo?.id // 假設 mainStore 有 userInfo (基於 rootGetters.getUserInfo.id)
    return tutorialState.value === null
      ? null
      : tutorialState.value[userId] || null
  })

  const tourFinished = computed(
    () =>
      eventInfo.value &&
      eventInfo.value.eventList.every((event) => event.done === true)
  )

  function setTutorialState({ userId, tutorialState: tutorialStateData }) {
    // 1. 更新 State (取代 mutation)
    tutorialState.value = {
      ...tutorialState.value,
      [userId]: tutorialStateData,
    }

    // 2. 更新 Cookie (取代 this.$cookies)
    const existingState = useSetCookie('BZSN_TUTORIAL_STATE', 24 * 365)
    const updatedState = {
      ...existingState,
      [userId]: tutorialStateData,
    }
    useCookie('BZSN_TUTORIAL_STATE').value = updatedState
  }

  function setDefaultTutorialState() {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    if (!userId) return

    const existingState = useCookie('BZSN_TUTORIAL_STATE').value || {}
    if (existingState[userId] !== undefined) {
      return
    }

    const defaultState = {
      minimizeTourEventBlock: true,
      tutorialBlock: {
        index: true,
        tasks: true,
        templates: true,
      },
      firstTimeDialog: {
        tasks: true,
        templates: true,
      },
      firstTimeTip: {
        assigned: true,
        completed: true,
      },
    }

    // 呼叫 store 內部的其他 action
    setTutorialState({ userId, tutorialState: defaultState })
  }

  function setDefaultClosedTutorialState() {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    if (!userId) return

    const existingState = useCookie('BZSN_TUTORIAL_STATE').value || {}
    if (existingState[userId] !== undefined) {
      return
    }

    const tutorialStateData = {
      minimizeTourEventBlock: true,
      tutorialBlock: {
        index: false,
        tasks: false,
        templates: false,
      },
      firstTimeDialog: {
        tasks: false,
        templates: false,
      },
      firstTimeTip: {
        assigned: false,
        completed: false,
      },
    }
    setTutorialState({ userId, tutorialState: tutorialStateData })
  }

  function closeFirstVisitDialog(tutorialType) {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    const userTutorialState = getTutorialState.value // 存取 computed getter (基於 getters.getTutorialState)

    if (!userId || !userTutorialState) return

    const tutorialStateData = {
      ...userTutorialState,
      firstTimeDialog: {
        ...userTutorialState.firstTimeDialog,
        [tutorialType]: false,
      },
    }
    setTutorialState({ userId, tutorialState: tutorialStateData })
  }

  function closeTutorial(tutorialType) {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    const userTutorialState = getTutorialState.value // 基於 getters.getTutorialState

    if (!userId || !userTutorialState) return

    const tutorialStateData = {
      ...userTutorialState,
      tutorialBlock: {
        ...userTutorialState.tutorialBlock,
        [tutorialType]: false,
      },
    }
    setTutorialState({ userId, tutorialState: tutorialStateData })
  }

  function closeFirstTimeTip(tutorialType) {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    const userTutorialState = getTutorialState.value // 基於 getters.getTutorialState

    if (!userId || !userTutorialState) return

    const tutorialStateData = {
      ...userTutorialState,
      firstTimeTip: {
        ...userTutorialState.firstTimeTip,
        [tutorialType]: false,
      },
    }
    setTutorialState({ userId, tutorialState: tutorialStateData })
  }

  function toggleTourEventBlock({ minimize }) {
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    const userTutorialState = getTutorialState.value // 基於 getters.getTutorialState

    if (!userId || !userTutorialState) return

    const tutorialStateData = {
      ...userTutorialState,
      minimizeTourEventBlock: minimize,
    }
    setTutorialState({ userId, tutorialState: tutorialStateData })
  }

  function setEventInfo(payload) {
    eventInfo.value = payload // 來自 mutation

    // 來自 action 的邏輯
    const mainStore = useMainStore()
    const userId = mainStore.userInfo?.id // 基於 rootGetters.getUserInfo.id
    const existingState = useCookie('BZSN_TUTORIAL_STATE').value || {}
    if (
      payload &&
      (!payload.closeProcessingDialog || !payload.closeSpecialDialog) &&
      existingState[userId] === undefined
    ) {
      setDefaultTutorialState()
    }
    if (existingState[userId] !== undefined) {
      setTutorialState({
        userId,
        tutorialState: existingState[userId],
      })
    }
  }

  // --- 4. Return ---
  return {
    // State
    eventInfo,
    startSignTask,
    startCreateTask,
    startCreateTemplate,
    tutorialState,
    redeemSuccess,
    minimizeTourEventBlock,
    closeProcessingDialog,
    closeSpecialDialog,
    getTutorialState,
    tourFinished,
    setTutorialState,
    setDefaultTutorialState,
    setDefaultClosedTutorialState,
    closeFirstVisitDialog,
    closeTutorial,
    closeFirstTimeTip,
    toggleTourEventBlock,
    setEventInfo,
  }
})
