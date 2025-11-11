export function useUserApi() {
  // const getUser = async () => await $fetch(`/${$i18n.locale}/user`, { method: 'GET' })
  // const login = async (data) => await $fetch(`/${$i18n.locale}/login`, { method: 'POST', body: data })
  // const postChangePassword = async (data) => await $fetch(`/${$i18n.locale}/user/change-password`, { method: 'POST', body: data })
  // const createUser = async (data) => await $fetch(`/${$i18n.locale}/user/create`, { method: 'POST', body: data })
  // const createChild = async (data) => await $fetch(`/${$i18n.locale}/user/createChild`, { method: 'POST', body: data })
  // const createChildBulk = async (data) => await $fetch(`/${$i18n.locale}/user/createChildBulk`, { method: 'POST', body: data })
  // const forgetPassword = async (data) => await $fetch(`/${$i18n.locale}/user/forgetPassword`, { method: 'POST', body: data })
  // const userList = async (data) => await $fetch(`/${$i18n.locale}/user/list`, { method: 'POST', body: data })
  // const userListAll = async (data) => await $fetch(`/${$i18n.locale}/user/listAll`, { method: 'POST', body: data })
  const myInfoApi = async () => await useMyFetch(`/user/myInfo`)
  const patchMyInfoApi = async (data) => await useMyFetch(`/user/myInfo`, { method: 'PATCH', body: data })
  // const verifyUser = async (data) => await $fetch(`/${$i18n.locale}/user/verify`, { method: 'POST', body: data })
  // const resendMail = async (data) => await $fetch(`/${$i18n.locale}/user/resend`, { method: 'POST', body: data })
  // const invite = async (data) => await $fetch(`/${$i18n.locale}/user/sendInviteMail`, { method: 'POST', body: data })
  // const inviteResult = async (data) => await $fetch(`/${$i18n.locale}/user/inviteResult`, { method: 'POST', body: data })
  // const oauth = async (data) => await $fetch(`/${$i18n.locale}/oauth2/auth`, { method: 'POST', body: data })
  // const tourEventInfo = async (data) => await $fetch(`/${$i18n.locale}/user/userTutorial`, { method: 'POST', body: data })
  // const updateTourEvent = async (data) => await $fetch(`/${$i18n.locale}/user/userTutorialEvent`, { method: 'POST', body: data })
  // const tourDialogStatus = async (data) => await $fetch(`/${$i18n.locale}/user/userTutorialDialogStatus`, { method: 'POST', body: data })
  // const startTour = async (data) => await $fetch(`/${$i18n.locale}/user/startUserTutorial`, { method: 'POST', body: data })
  // const completeTour = async (data) => await $fetch(`/${$i18n.locale}/user/completeUserTutorial`, { method: 'POST', body: data })
  // const twoFactorAuthInfo = async (data) => await $fetch(`/${$i18n.locale}/user/userTwoFAInfo`, { method: 'POST', body: data })
  // const enableTwoFactorAuth = async (data) => await $fetch(`/${$i18n.locale}/user/enableUserTwoFA`, { method: 'POST', body: data })
  // const suspend = async (data) => await $fetch(`/${$i18n.locale}/user/suspend`, { method: 'POST', body: data })
  // const getAnnouncement = async (data) => await $fetch(`/${$i18n.locale}/announcement/getAnnouncement`, { method: 'POST', body: data })
  // const needHelp = async (data) => await $fetch(`/${$i18n.locale}/user/needHelp`, { method: 'POST', body: data })
  // const submitAnswer = async (data) => await $fetch(`/${$i18n.locale}/onboarding/complete`, { method: 'POST', body: data })
  // const login = async (data) => await $fetch(`/${locale.value}/user/jwt`, { method: 'POST', body: data })
  const loginApi = async (data) =>
    await useMyFetch(`/user/jwt`, { method: "POST", body: data });

  return { loginApi, myInfoApi, patchMyInfoApi };
}
