import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStore = defineStore('main', () => {
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
            title: 'title.plan', // 方案資訊
            to: '/plan',
            check: [''],
        },
        {
            title: 'title.points', // 我的點數
            to: '/points',
            check: ['isAdmin', 'useCredit', 'notSIAdmin', 'notSIChild'],
        },
        {
            title: 'title.cloudTaskCount', // 我的點數
            to: '/cloud-task-count',
            check: ['isAdmin', 'useB2b2c'],
        },
        {
            title: 'title.groupMembers', // 帳戶管理
            to: '/account',
            check: ['isAdmin', 'hasMember'],
        },
        {
            title: 'title.brand', // 公司品牌
            to: '/company',
            check: ['isAdmin'],
        },
        {
            title: 'title.recording', // 錄影設定
            to: '/recording',
            check: ['useVideo', 'isAdmin'],
        },
        {
            title: 'title.security', // 安全設定
            to: '/security',
            check: ['isAdmin', 'useWhiteList'],
        },
        {
            title: 'title.developer', // 開發者權限
            to: '/developer',
            check: ['isAdmin', 'useAPI'],
        },
        {
            title: 'title.usageReport', // 用量報表
            to: '/usage-report',
            check: ['isAdmin', 'notSIAdmin'],
        },
        {
            title: 'title.usageReport', // 用量報表 (協作管理)
            to: '/si/usage-report',
            check: ['siAdmin'],
        },
        {
            title: 'title.siManagement', // 協作管理
            to: '/si',
            check: ['siAdmin'],
        },
    ])
    const accountDrawerItems = ref([
        {
            title: 'title.profile', // 個人資訊
            to: '/profile',
            iconClass: 'account-profile',
            check: [''],
        },
        {
            title: 'title.signature', // 簽章管理
            to: '/signature',
            iconClass: 'account-signature',
            check: [''],
        },
        {
            title: 'title.signerGroup', // 簽署組合
            iconClass: 'account-signer-group',
            to: '/signer-group',
            check: ['useSignerGroup'],
        },
        {
            title: 'title.contacts', // 通訊錄
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

    const getBreadCrumbs = computed(() => breadcrumbs.value)
    const getPageTitle = computed(() => pageTitle.value)
    const getIsLogin = computed(() => token.value !== null)
    const getIsGetUserInfo = computed(() => userInfo.value !== null)
    const getToken = computed(() => token.value)
    const getRememberedAccount = computed(() => account.value)
    const getUserInfo = computed(() => userInfo.value)
    const getUserType = computed(() => userInfo.value?.userType)
    const getPlanInfo = computed(() => planInfo.value)
    const getIsGetPlanInfo = computed(() => planInfo.value !== null)
    const getItemsPerPageOption = computed(() => options.value?.itemsPerPage ?? 10)
    const getTabItems = computed(() => drawerItems.value)

    const getAccountItems = computed(() => {
        if (userInfo.value === null) {
            return null
        }
        const checkRules = {
            authType: userInfo.value.authType === 'CUSTOM',
            useSignerGroup: planInfo.value && planInfo.value.signingGroupCount > 0,
        }
        const accountItems = accountDrawerItems.value.map((item) => {
            const newItem = { ...item }
            newItem.disable = item.check.some((c) => c !== '' && !checkRules[c])
            return newItem
        })
        return accountItems
    })

    const getSettingItems = computed(() => {
        if (userInfo.value === null) {
            return null
        }
        const checkRules = {
            isAdmin: userInfo.value.userType === 'COMPANY_ADMIN',
            // SI 管理者
            siAdmin: userInfo.value.companyType === 'SI_ADMIN',
            notSIAdmin: userInfo.value.companyType !== 'SI_ADMIN',
            notSIChild: userInfo.value.companyType !== 'SI_CHILD',
            hasMember: userInfo.value.maxUser > 1,
            // 聲明錄影
            useVideo: planInfo.value && planInfo.value.useVideo,
            // 開發者模式（API Key）
            useAPI: planInfo.value && planInfo.value.useAPI,
            // 公司品牌（Logo or 浮水印，有其中一個就可以進入此頁面）
            useBrand:
                planInfo.value &&
                (planInfo.value.useWatermark || planInfo.value.useBrand),
            // IP白名單
            useWhiteList: planInfo.value && planInfo.value.useWhiteList,
            useCredit: planInfo.value && planInfo.value.useCredit,
            useAatlTrack: planInfo.value && planInfo.value.useAatlTrack,
            useB2b2c: planInfo.value && planInfo.value.useB2b2c,
        }
        const settingItems = settingDrawerItems.value.map((item) => {
            const newItem = { ...item }
            newItem.disable = item.check.some((c) => c !== '' && !checkRules[c])
            return newItem
        })
        return settingItems
    })

    const getNavigationDrawerItems = computed(() => {
        const settingItems = getSettingItems.value
        const settingItem = {
            title: 'title.setting',
            to: '/settings',
            label: 'settings',
            iconClass: 'setting-icon',
            subItems: settingItems,
        }
        const accountItems = getAccountItems.value
        const accountItem = {
            title: 'title.accountSetting',
            to: '/account',
            label: 'account',
            iconClass: 'account-icon',
            subItems: accountItems,
        }
        return [accountItem, settingItem]
    })

    const getAttachmentFiles = computed(() => attachmentFiles.value)
    const getSearchOptions = computed(() => searchOptions.value)
    const getReportOptions = computed(() => reportOptions.value)
    const getTagsList = computed(() => tagsList.value)
    const getTemplateTagsList = computed(() => templateTagsList.value)
    const getEditTaskPerson = computed(() => editTaskPerson.value)
    const getTaskCount = computed(() => taskCount.value)
    const getFormCount = computed(() => formCount.value)
    const getSendTemplateData = computed(() => sendTemplateData.value)
    const getIsFirstLogin = computed(() => isFirstLogin.value)
    const getLoginSurveyFinished = computed(() => loginSurveyFinished.value)
    const getPublishedForm = computed(() => publishedForm.value)
    const getPublishedBook = computed(() => publishedBook.value)
    const getClosedAnnouncementDialog = computed(() => closedAnnouncementDialog.value)

    function setBreadCrumbs(newBreadcrumbs) {
        breadcrumbs.value = newBreadcrumbs
    }

    function pushBreadCrumbs(newBreadcrumb) {
        breadcrumbs.value.push(newBreadcrumb)
    }

    function popBreadCrumbs() {
        breadcrumbs.value.pop()
    }

    function setSearchOptions(newOptions) {
        searchOptions.value = newOptions
    }

    function setReportOptions(newOptions) {
        reportOptions.value = newOptions
    }

    function setPageTitle(newTitle) {
        pageTitle.value = newTitle
    }

    function setToken(newToken) {
        token.value = newToken
    }

    function setRememberedAccount(newAccount) {
        account.value = newAccount
    }

    function setUserInfo(newUserInfo) {
        if (newUserInfo !== null) {
            userInfo.value = newUserInfo
            // 如果使用者沒有名字，就用信箱當作名字
            if (userInfo.value.name === null || userInfo.value.name === '') {
                userInfo.value.name = userInfo.value.email
            }
            isGetUserInfo.value = true
        } else {
            userInfo.value = null
            isGetUserInfo.value = false
        }
    }

    function setPlanInfo(newPlanInfo) {
        planInfo.value = newPlanInfo
    }

    function setOptions(newOptions) {
        options.value = newOptions
    }

    function addAttachmentFiles(files) {
        attachmentFiles.value.push(...files)
    }

    function deleteAllAttachmentFiles() {
        attachmentFiles.value = []
    }

    function deleteAttachmentFiles(idx) {
        attachmentFiles.value.splice(idx, 1)
    }

    function setTagsList(list) {
        tagsList.value = list
    }

    function setTemplateTagsList(list) {
        templateTagsList.value = list
    }

    function setEditTaskPerson(newTaskPerson) {
        editTaskPerson.value = newTaskPerson
    }

    function setTagEdit(tag) {
        tagsList.value.forEach((t) => {
            t.editTagField = t.id === tag.id
        })
    }

    function setTemplateTagEdit(tag) {
        templateTagsList.value.forEach((t) => {
            t.editTagField = t.id === tag.id
        })
    }

    function setTaskCount(newTaskCount) {
        taskCount.value = newTaskCount
    }

    function setFormCount(newFormCount) {
        formCount.value = newFormCount
    }

    function setSendTemplateData(newSendTemplateData) {
        sendTemplateData.value = newSendTemplateData
    }

    function setIsFirstLogin(newIsFirstLogin) {
        isFirstLogin.value = newIsFirstLogin
    }

    function setLoginSurveyFinished(newLoginSurveyFinished) {
        loginSurveyFinished.value = newLoginSurveyFinished
    }

    function setPublishedForm(newPublishedForm) {
        publishedForm.value = newPublishedForm
    }

    function setClosedAnnouncementDialog(dateString) {
        closedAnnouncementDialog.value = dateString
    }

    function setPublishedBook(newPublishedBook) {
        publishedBook.value = newPublishedBook
    }

    // nuxtServerInit and nuxtClientInit are not part of Pinia.
    // You should move this logic to a Nuxt plugin or middleware.
    async function nuxtServerInit() {
        const nuxtApp = useNuxtApp()
        const token = nuxtApp.$cookies.get('PDF_JWT_TOKEN')
        const account = nuxtApp.$cookies.get('PDF_ACCOUNT')
        const options = nuxtApp.$cookies.get('PDF_Options')
        const searchOptions = nuxtApp.$cookies.get('bzsnsoptions')
        const reportOptions = nuxtApp.$cookies.get('bzsnroptions')
        const tutorialState = nuxtApp.$cookies.get('BZSN_TUTORIAL_STATE')
        if (token) {
            setToken(token)
            if (getIsGetUserInfo.value === false) {
                await nuxtApp.$apiRepository(nuxtApp.i18n.locale)
                    .user.myInfo.get()
                    .then(async (result) => {
                        if (
                            result !== null &&
                            result.errorCode === 200 &&
                            result.body !== null
                        ) {
                            setUserInfo(result.body)
                            setLoginSurveyFinished(result.body.finishOnboarding)
                            if (getIsGetPlanInfo.value === false) {
                                await nuxtApp.$apiRepository(nuxtApp.i18n.locale)
                                    .plan.restrict.get()
                                    .then((result) => {
                                        if (
                                            result !== null &&
                                            result.errorCode === 200 &&
                                            result.body !== null
                                        ) {
                                            setPlanInfo(result.body)
                                        }
                                    })
                            }
                        } else if (result !== null && result.errorCode === 401) {
                            logout().then(() => navigateTo(nuxtApp.localePath('/login')))
                        }
                    })
            }
        }
        if (tutorialState) {
            // Assuming you have a tour store
            // tour.setTutorialState(tutorialState)
        }
        setRememberedAccount(account)
        setOptions(options)
        setSearchOptions(searchOptions)
        setReportOptions(reportOptions)
    }

    async function nuxtClientInit() {
        const nuxtApp = useNuxtApp()
        const token = nuxtApp.$cookies.get('PDF_JWT_TOKEN')
        const account = nuxtApp.$cookies.get('PDF_ACCOUNT')
        const options = nuxtApp.$cookies.get('PDF_Options')
        if (token) {
            setToken(token)
            if (getIsGetUserInfo.value === false) {
                await nuxtApp.$apiRepository(nuxtApp.i18n.locale)
                    .user.myInfo.get()
                    .then(async (result) => {
                        if (
                            result !== null &&
                            result.errorCode === 200 &&
                            result.body !== null
                        ) {
                            setUserInfo(result.body)
                            if (getIsGetPlanInfo.value === false) {
                                await nuxtApp.$apiRepository(nuxtApp.i18n.locale)
                                    .plan.restrict.get()
                                    .then((result) => {
                                        if (
                                            result !== null &&
                                            result.errorCode === 200 &&
                                            result.body !== null
                                        ) {
                                            setPlanInfo(result.body)
                                        }
                                    })
                            }
                        } else if (result !== null && result.errorCode === 401) {
                            logout().then(() => navigateTo(nuxtApp.localePath('/login')))
                        }
                    })
            }
        }
        setRememberedAccount(account)
        setOptions(options)
    }

    async function changeLogin(payload) {
        const nuxtApp = useNuxtApp()
        if (payload.isLogin === true) {
            if (payload.token) {
                nuxtApp.$cookies.set('PDF_JWT_TOKEN', payload.token, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7,
                })
                setToken(payload.token)
            }
            if (payload.userInfo) {
                setIsFirstLogin(payload.userInfo.isFirstLogin)
                setLoginSurveyFinished(payload.userInfo.finishOnboarding)
                setUserInfo(payload.userInfo)
                const userCulture = payload.userInfo.lastLoginCulture
                const browserCultre = payload.locale

                if (userCulture === null) {
                    // 使用者語系為空，使用瀏覽器語系更新使用者語系
                    await patchLocale(browserCultre)
                } else if (userCulture !== browserCultre) {
                    // 使用者語系優先
                    nuxtApp.$i18n.setLocale(userCulture)
                }

                if (getIsGetPlanInfo.value === false) {
                    await nuxtApp.$apiRepository(nuxtApp.$i18n.locale)
                        .plan.restrict.get()
                        .then((result) => {
                            if (
                                result !== null &&
                                result.errorCode === 200 &&
                                result.body !== null
                            ) {
                                setPlanInfo(result.body)
                            }
                        })
                }
            }
        } else {
            nuxtApp.$cookies.remove('PDF_JWT_TOKEN')
            nuxtApp.$cookies.remove('bzsnsoptions')
            nuxtApp.$cookies.remove('bzsnroptions')
            nuxtApp.$cookies.remove('i18n_redirected')
            setToken(null)
            setUserInfo({})
            setPlanInfo({})
        }
    }

    async function patchLocale(localeCode) {
        const nuxtApp = useNuxtApp()
        const result = await nuxtApp.$apiRepository(
            nuxtApp.$i18n.locale
        ).user.myInfo.patch({ culture: localeCode })
        if (result !== null && result.errorCode === 200 && result.body !== null) {
            setUserInfo(result.body)
        }
    }

    function logout() {
        changeLogin({
            isLogin: false,
        })
    }

    function rememberInfo(payload) {
        const nuxtApp = useNuxtApp()
        if (payload.isRememberMe === true) {
            if (payload.account) {
                nuxtApp.$cookies.set('PDF_ACCOUNT', payload.account, {
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7,
                })
                setRememberedAccount(payload.account)
            }
        } else {
            nuxtApp.$cookies.remove('PDF_ACCOUNT')
            setRememberedAccount('')
        }
    }

    function setSearchOptions(options) {
        const nuxtApp = useNuxtApp()
        setSearchOptions(options)
        nuxtApp.$cookies.set(
            'bzsnsoptions',
            { ...options },
            {
                path: '/',
            }
        )
    }

    function removeSearchOptions() {
        const nuxtApp = useNuxtApp()
        setSearchOptions(null)
        nuxtApp.$cookies.remove('bzsnsoptions')
    }

    function setReportOptions(options) {
        const nuxtApp = useNuxtApp()
        setReportOptions(options)
        nuxtApp.$cookies.set(
            'bzsnroptions',
            { ...options },
            {
                path: '/',
            }
        )
    }

    function removeReportOptions() {
        const nuxtApp = useNuxtApp()
        setReportOptions(null)
        nuxtApp.$cookies.remove('bzsnroptions')
    }

    function setTagsList(payload) {
        payload.list.sort((a, b) => a.name.localeCompare(b.name))
        if (payload.isTemplate) {
            setTemplateTagsList(payload.list)
        } else {
            setTagsList(payload.list)
        }
    }

    function setTagEdit(payload) {
        if (payload.isTemplate) {
            setTemplateTagEdit(payload.tag)
        } else {
            setTagEdit(payload.tag)
        }
    }

    function setTaskCount(payload) {
        const data = {
            waiting: payload.waitingTaskCount,
            assigned: payload.assignedTaskCount,
            done: payload.doneTaskCount,
            disagree: payload.disagreeTaskCount,
            cancel: payload.cancelTaskCount,
            expired: payload.expiredTaskCount,
            groupWaiting: payload.processingTaskGroupCount,
            groupDone: payload.doneTaskGroupCount,
        }
        setTaskCount(data)
    }

    function setFormCount(payload) {
        const data = {
            internal: payload.internalFormCount,
            external: payload.externalFormCount,
        }
        setFormCount(data)
    }

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
        getBreadCrumbs,
        getPageTitle,
        getIsLogin,
        getIsGetUserInfo,
        getToken,
        getRememberedAccount,
        getUserInfo,
        getUserType,
        getPlanInfo,
        getIsGetPlanInfo,
        getItemsPerPageOption,
        getTabItems,
        getAccountItems,
        getSettingItems,
        getNavigationDrawerItems,
        getAttachmentFiles,
        getSearchOptions,
        getReportOptions,
        getTagsList,
        getTemplateTagsList,
        getEditTaskPerson,
        getTaskCount,
        getFormCount,
        getSendTemplateData,
        getIsFirstLogin,
        getLoginSurveyFinished,
        getPublishedForm,
        getPublishedBook,
        getClosedAnnouncementDialog,
        setBreadCrumbs,
        pushBreadCrumbs,
        popBreadCrumbs,
        setSearchOptions,
        setReportOptions,
        setPageTitle,
        setToken,
        setRememberedAccount,
        setUserInfo,
        setPlanInfo,
        setOptions,
        addAttachmentFiles,
        deleteAllAttachmentFiles,
        deleteAttachmentFiles,
        setTagsList,
        setTemplateTagsList,
        setEditTaskPerson,
        setTagEdit,
        setTemplateTagEdit,
        setTaskCount,
        setFormCount,
        setSendTemplateData,
        setIsFirstLogin,
        setLoginSurveyFinished,
        setPublishedForm,
        setClosedAnnouncementDialog,
        setPublishedBook,
        nuxtServerInit,
        nuxtClientInit,
        changeLogin,
        patchLocale,
        logout,
        rememberInfo,
        removeSearchOptions,
        setReportOptions,
        removeReportOptions,
        setTagsList,
        setTagEdit,
        setTaskCount,
        setFormCount,
    }
})