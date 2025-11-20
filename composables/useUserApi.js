export function useUserApi() {
  // const getUser = async () => await $fetch(`/user`, { method: 'GET' })
  // const login = async (data) => await $fetch(`/login`, { method: 'POST', body: data })
  // const postChangePassword = async (data) => await $fetch(`/user/change-password`, { method: 'POST', body: data })
  // const createUser = async (data) => await $fetch(`/user/create`, { method: 'POST', body: data })
  // const createChild = async (data) => await $fetch(`/user/createChild`, { method: 'POST', body: data })
  // const createChildBulk = async (data) => await $fetch(`/user/createChildBulk`, { method: 'POST', body: data })
  // const forgetPassword = async (data) => await $fetch(`/user/forgetPassword`, { method: 'POST', body: data })
  // const userList = async (data) => await $fetch(`/user/list`, { method: 'POST', body: data })
  // const userListAll = async (data) => await $fetch(`/user/listAll`, { method: 'POST', body: data })
  const getMyInfoApi = async () => await useMyFetch(`/user/myInfo`)
  const patchMyInfoApi = async (data) =>
    await useMyFetch(`/user/myInfo`, { method: 'PATCH', body: data })
  // const verifyUser = async (data) => await $fetch(`/user/verify`, { method: 'POST', body: data })
  // const resendMail = async (data) => await $fetch(`/user/resend`, { method: 'POST', body: data })
  // const invite = async (data) => await $fetch(`/user/sendInviteMail`, { method: 'POST', body: data })
  // const inviteResult = async (data) => await $fetch(`/user/inviteResult`, { method: 'POST', body: data })
  const oauthApi = async (data) =>
    await useMyFetch(`/oauth2/auth`, {
      method: 'POST',
      body: data,
    })
  // const tourEventInfo = async (data) => await $fetch(`/user/userTutorial`, { method: 'POST', body: data })
  const updateTourEventApi = async (data) =>
    await useMyFetch(`/user/userTutorialEvent`, { method: 'POST', body: data })
  // const tourDialogStatus = async (data) => await $fetch(`/user/userTutorialDialogStatus`, { method: 'POST', body: data })
  // const startTour = async (data) => await $fetch(`/user/startUserTutorial`, { method: 'POST', body: data })
  const completeTourApi = async (data) =>
    await useMyFetch(`/user/completeUserTutorial`, {
      method: 'POST',
      body: data,
    })
  // const twoFactorAuthInfo = async (data) => await $fetch(`/user/userTwoFAInfo`, { method: 'POST', body: data })
  // const enableTwoFactorAuth = async (data) => await $fetch(`/user/enableUserTwoFA`, { method: 'POST', body: data })
  // const suspend = async (data) => await $fetch(`/user/suspend`, { method: 'POST', body: data })
  // const getAnnouncement = async (data) => await $fetch(`/announcement/getAnnouncement`, { method: 'POST', body: data })
  // const needHelp = async (data) => await $fetch(`/user/needHelp`, { method: 'POST', body: data })
  // const submitAnswer = async (data) => await $fetch(`/onboarding/complete`, { method: 'POST', body: data })
  // const login = async (data) => await $fetch(`/${locale.value}/user/jwt`, { method: 'POST', body: data })
  const loginApi = async (data) =>
    await useMyFetch(`/user/jwt`, { method: 'POST', body: data })

  return {
    loginApi,
    getMyInfoApi,
    patchMyInfoApi,
    oauthApi,
    updateTourEventApi,
    completeTourApi,
  }
}
