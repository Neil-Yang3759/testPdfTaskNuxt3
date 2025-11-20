import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMainStore = defineStore('main', () => {
  // ==================== State ====================
  const { getMyInfoApi, patchMyInfoApi } = useUserApi()
  const { getRestrictApi } = usePlanApi()
  const { $i18n } = useNuxtApp()
  const account = ref('')
  const token = ref(null)
  const options = ref(null)
  const userInfo = ref(null)
  const isGetUserInfo = ref(false)
  const needChangePassword = ref(false)
  const pageTitle = ref('')
  const breadcrumbs = ref([])
  const drawerItems = ref([
    {
      title: 'title.home',
      to: '/',
      label: 'home',
    },
    {
      title: 'title.tasks',
      to: '/tasks',
      label: 'tasks',
    },
    {
      title: 'title.templates',
      to: '/templates',
      label: 'templates',
    },
    {
      title: 'title.forms',
      to: '/forms',
      label: 'forms',
    },
    {
      title: 'title.report',
      to: '/reports',
      label: 'reports',
    },
  ])
  const settingDrawerItems = ref([
    {
      title: 'title.plan',
      to: '/plan',
      check: [''],
    },
    {
      title: 'title.points',
      to: '/points',
      check: ['isAdmin', 'useCredit', 'notSIAdmin', 'notSIChild'],
    },
    {
      title: 'title.cloudTaskCount',
      to: '/cloud-task-count',
      check: ['isAdmin', 'useB2b2c'],
    },
    {
      title: 'title.groupMembers',
      to: '/account',
      check: ['isAdmin', 'hasMember'],
    },
    {
      title: 'title.brand',
      to: '/company',
      check: ['isAdmin'],
    },
    {
      title: 'title.recording',
      to: '/recording',
      check: ['useVideo', 'isAdmin'],
    },
    {
      title: 'title.security',
      to: '/security',
      check: ['isAdmin', 'useWhiteList'],
    },
    {
      title: 'title.developer',
      to: '/developer',
      check: ['isAdmin', 'useAPI'],
    },
    {
      title: 'title.usageReport',
      to: '/usage-report',
      check: ['isAdmin', 'notSIAdmin'],
    },
    {
      title: 'title.usageReport',
      to: '/si/usage-report',
      check: ['siAdmin'],
    },
    {
      title: 'title.siManagement',
      to: '/si',
      check: ['siAdmin'],
    },
  ])
  const accountDrawerItems = ref([
    {
      title: 'title.profile',
      to: '/profile',
      iconClass: 'account-profile',
      check: [''],
    },
    {
      title: 'title.signature',
      to: '/signature',
      iconClass: 'account-signature',
      check: [''],
    },
    {
      title: 'title.signerGroup',
      iconClass: 'account-signer-group',
      to: '/signer-group',
      check: ['useSignerGroup'],
    },
    {
      title: 'title.contacts',
      to: '/contacts',
      iconClass: 'account-contacts',
      check: [''],
    },
  ])
  const attachmentFiles = ref([])
  const planInfo = ref(null)
  const searchOptions = ref(null)
  const reportOptions = ref(null)
  const tagsList = ref([])
  const templateTagsList = ref([])
  const editTaskPerson = ref({
    taskName: '',
    taskPerson: [],
    isParallel: false,
  })
  const taskCount = ref({
    assigned: '',
    waiting: '',
    done: '',
    cancel: '',
    disagree: '',
    groupWaiting: '',
    groupDone: '',
  })
  const formCount = ref({
    internal: '',
    external: '',
  })
  const sendTemplateData = ref(null)
  const isFirstLogin = ref(false)
  const loginSurveyFinished = ref(true)
  const publishedForm = ref(null)
  const publishedBook = ref(null)
  const closedAnnouncementDialog = ref(null)

  // ==================== Computed ====================
  const isLogin = computed(() => token.value !== null)
  const isGetPlanInfo = computed(() => planInfo.value !== null)
  const itemsPerPageOption = computed(() => options.value?.itemsPerPage ?? 10)

  const accountItems = computed(() => {
    if (userInfo.value === null) return null

    const checkRules = {
      authType: userInfo.value.authType === 'CUSTOM',
      useSignerGroup: planInfo.value && planInfo.value.signingGroupCount > 0,
    }

    // return accountDrawerItems.value.map((item) => ({
    //   ...item,
    //   disable: item.check.some((c) => c !== '' && !checkRules[c]),
    // }))
    console.log(accountDrawerItems.value)
    return accountDrawerItems.value.map((item) => {
      const newItem = { ...item }
      newItem.disable = item.check.some((c) => c !== '' && !checkRules[c])
      return newItem
    })
  })

  const settingItems = computed(() => {
    if (userInfo.value === null) return null

    const checkRules = {
      isAdmin: userInfo.value.userType === 'COMPANY_ADMIN',
      siAdmin: userInfo.value.companyType === 'SI_ADMIN',
      notSIAdmin: userInfo.value.companyType !== 'SI_ADMIN',
      notSIChild: userInfo.value.companyType !== 'SI_CHILD',
      hasMember: userInfo.value.maxUser > 1,
      useVideo: planInfo.value?.useVideo,
      useAPI: planInfo.value?.useAPI,
      useBrand:
        planInfo.value &&
        (planInfo.value.useWatermark || planInfo.value.useBrand),
      useWhiteList: planInfo.value?.useWhiteList,
      useCredit: planInfo.value?.useCredit,
      useAatlTrack: planInfo.value?.useAatlTrack,
      useB2b2c: planInfo.value?.useB2b2c,
    }

    return settingDrawerItems.value.map((item) => ({
      ...item,
      disable: item.check.some((c) => c !== '' && !checkRules[c]),
    }))
  })

  const navigationDrawerItems = computed(() => {
    return [
      {
        title: 'title.setting',
        to: '/settings',
        label: 'settings',
        iconClass: 'setting-icon',
        subItems: settingItems.value,
      },
      {
        title: 'title.accountSetting',
        to: '/account',
        label: 'account',
        iconClass: 'account-icon',
        subItems: accountItems.value,
      },
    ]
  })

  // ==================== Actions (只保留有額外邏輯的) ====================

  // ✅ 保留: 有額外邏輯 (同時更新 isGetUserInfo)
  function setUserInfo(info) {
    if (info !== null) {
      userInfo.value = info
      isGetUserInfo.value = true
    }
  }

  // ✅ 保留: 有複雜邏輯 (初始化流程)
  async function nuxtServerInit() {
    const tokenValue = useSetCookie('PDF_JWT_TOKEN', 24 * 7)
    const accountValue = useSetCookie('PDF_ACCOUNT', 24 * 7)
    const optionsValue = useSetCookie('PDF_Options', 24 * 7)
    const searchOptionsValue = useSetCookie('bzsnsoptions', 24 * 7)
    const reportOptionsValue = useSetCookie('bzsnroptions', 24 * 7)
    const tutorialState = useSetCookie('BZSN_TUTORIAL_STATE', 24 * 7)

    if (tokenValue.value) {
      token.value = tokenValue.value
      if (!userInfo.value) {
        try {
          const result = await getMyInfoApi()
          setUserInfo(result.body)
          loginSurveyFinished.value = result.body.finishOnboarding

          if (!planInfo.value) {
            const planResult = await getRestrictApi()
            if (planResult.body) {
              planInfo.value = planResult.body
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      }
    }

    if (tutorialState) {
      // const tourStore = useTourStore()
      // tourStore.setTutorialState(tutorialState)
    }

    account.value = accountValue
    options.value = optionsValue
    searchOptions.value = searchOptionsValue
    reportOptions.value = reportOptionsValue
  }

  // ✅ 保留: 同 nuxtServerInit
  async function nuxtClientInit() {
    const tokenValue = useSetCookie('PDF_JWT_TOKEN')
    const accountValue = useSetCookie('PDF_ACCOUNT')
    const optionsValue = useSetCookie('PDF_Options')

    if (tokenValue.value) {
      token.value = tokenValue.value
      if (!userInfo.value) {
        try {
          const result = await getMyInfoApi()
          setUserInfo(result.body)

          if (!planInfo.value) {
            const planResult = await getRestrictApi()
            if (planResult.body) {
              planInfo.value = planResult.body
            }
          }
        } catch (error) {
          console.error('Error fetching user info:', error)
        }
      }
    }

    account.value = accountValue
    options.value = optionsValue
  }

  // ✅ 保留: 有複雜邏輯 (包含 cookie 操作和 API 調用)
  async function changeLogin(payload) {
    if (payload.isLogin === true) {
      if (payload.token) {
        const pdfToken = useSetCookie('PDF_JWT_TOKEN', 24 * 7)
        token.value = pdfToken.value = payload.token
      }
      if (payload.userInfo) {
        isFirstLogin.value = payload.userInfo.isFirstLogin
        loginSurveyFinished.value = payload.userInfo.finishOnboarding
        setUserInfo(payload.userInfo)

        const userCulture = payload.userInfo.lastLoginCulture
        const browserCulture = payload.locale

        if (userCulture === null) {
          await patchLocale(browserCulture)
        } else if (userCulture !== browserCulture) {
          $i18n.setLocale(userCulture)
        }

        if (!planInfo.value) {
          const result = await getRestrictApi()
          if (result.body) {
            planInfo.value = result.body
          }
        }
      }
    } else {
      useCookie('PDF_JWT_TOKEN').value = null
      useCookie('PDF_ACCOUNT').value = null
      useCookie('PDF_Options').value = null
      useCookie('bzsnsoptions').value = null
      useCookie('bzsnroptions').value = null
      useCookie('i18n_redirected').value = null
      token.value = null
      userInfo.value = {}
      planInfo.value = {}
    }
  }

  // ✅ 保留: 有 API 調用
  async function patchLocale(localeCode) {
    const result = await patchMyInfoApi({ culture: localeCode })
    if (result.body) {
      setUserInfo(result.body)
    }
  }

  // ✅ 保留: 封裝 changeLogin
  function logout() {
    changeLogin({ isLogin: false })
  }

  // ✅ 保留: 有 cookie 操作
  function rememberInfo(payload) {
    const pdfAccount = useSetCookie('PDF_ACCOUNT', 24 * 7)
    if (payload.isRememberMe) {
      if (payload.account) {
        pdfAccount.value = payload.account
      }
    } else {
      pdfAccount.value = null // 刪除 cookie
    }
  }

  // ✅ 保留: 有 cookie 操作
  function updateSearchOptions(payload) {
    searchOptions.value = payload.options
    useSetCookie('bzsnsoptions', 24 * 7).value = { ...payload.options }
  }

  // ✅ 保留: 有 cookie 操作
  function removeSearchOptions() {
    searchOptions.value = null
    useCookie('bzsnsoptions').value = null
  }

  // ✅ 保留: 有 cookie 操作
  function updateReportOptions(payload) {
    reportOptions.value = payload.options
    useSetCookie('bzsnroptions', 24 * 7).value = { ...payload.options }
  }

  // ✅ 保留: 有 cookie 操作
  function removeReportOptions() {
    reportOptions.value = null
    useCookie('bzsnroptions').value = null
  }

  // ✅ 保留: 有排序邏輯
  function updateTagsList(payload) {
    const sortedList = [...payload.list].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
    if (payload.isTemplate) {
      templateTagsList.value = sortedList
    } else {
      tagsList.value = sortedList
    }
  }

  // ✅ 保留: 有查找和更新邏輯
  function updateTagEdit(payload) {
    const targetList = payload.isTemplate ? templateTagsList : tagsList
    const index = targetList.value.findIndex((v) => v.id === payload.tag.id)
    if (index !== -1) {
      targetList.value[index] = payload.tag
    }
  }

  // ✅ 保留: 有數據轉換
  function updateTaskCount(payload) {
    taskCount.value = {
      waiting: payload.waitingTaskCount,
      assigned: payload.assignedTaskCount,
      done: payload.doneTaskCount,
      disagree: payload.disagreeTaskCount,
      cancel: payload.cancelTaskCount,
      expired: payload.expiredTaskCount,
      groupWaiting: payload.processingTaskGroupCount,
      groupDone: payload.doneTaskGroupCount,
    }
  }

  // ✅ 保留: 有數據轉換
  function updateFormCount(payload) {
    formCount.value = {
      internal: payload.internalFormCount,
      external: payload.externalFormCount,
    }
  }

  // ==================== Return ====================
  return {
    account,
    token,
    options,
    userInfo,
    isGetUserInfo,
    needChangePassword,
    pageTitle,
    breadcrumbs,
    drawerItems,
    settingDrawerItems,
    accountDrawerItems,
    attachmentFiles,
    planInfo,
    searchOptions,
    reportOptions,
    tagsList,
    templateTagsList,
    editTaskPerson,
    taskCount,
    formCount,
    sendTemplateData,
    isFirstLogin,
    loginSurveyFinished,
    publishedForm,
    publishedBook,
    closedAnnouncementDialog,

    // Computed
    isLogin,
    isGetPlanInfo,
    itemsPerPageOption,
    accountItems,
    settingItems,
    navigationDrawerItems,

    // Actions (只保留有邏輯的)
    setUserInfo,
    nuxtServerInit,
    nuxtClientInit,
    changeLogin,
    patchLocale,
    logout,
    rememberInfo,
    updateSearchOptions,
    removeSearchOptions,
    updateReportOptions,
    removeReportOptions,
    updateTagsList,
    updateTagEdit,
    updateTaskCount,
    updateFormCount,
  }
})
