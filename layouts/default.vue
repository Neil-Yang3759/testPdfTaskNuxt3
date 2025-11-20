<template>
  <v-app dark>
    <v-navigation-drawer
      v-if="smAndDown"
      v-model="drawer"
      mobile
      location="top"
      temporary
    >
      <v-list-item v-if="userInfo" class="px-0 py-3">
        <div class="d-flex flex-row align-start" style="margin-left: 48px">
          <v-avatar size="24" color="primaryDarken" class="mr-3">
            <span class="white--text text-overline">{{
              getUserIconText()
            }}</span>
          </v-avatar>
          <div class="d-flex flex-column">
            <div v-if="userInfo.name" class="text-subtitle-2 font-weight-bold">
              {{ getUserName() }}
            </div>
            <div style="font-size: 0.75rem">{{ getUserAccount() }}</div>
          </div>
        </div>
      </v-list-item>
      <v-divider
        class="border-opacity-100"
        style="border: none; height: 0; border-bottom: 6px solid #f7f7f7"
      >
      </v-divider>
      <v-list nav class="pa-0">
        <template v-for="(item, index) in drawerItems">
          <v-list-group
            v-if="item.subItems && !item.disable"
            :key="`item-${index}${item.title}`"
            :group="item.to"
            color="primary"
            class="mb-1"
            no-action
          >
            {{ item }}
            <template v-slot:prependIcon>
              <svg-icon-setting
                v-if="item.iconClass === 'setting-icon'"
                style="margin-left: 36px; margin-right: 10px"
              />
              <svg-icon-profile
                v-if="item.iconClass === 'account-icon'"
                style="margin-left: 40px; margin-right: 14px"
              />
            </template>
            <template v-slot:activator>
              <v-list-item-title class="text-subtitle-2">{{
                $t(item.title)
              }}</v-list-item-title>
            </template>
            <template v-for="(subItem, i) in item.subItems">
              <v-list-item
                v-if="!subItem.disable"
                :key="`subItem-${i}`"
                :to="item.to + subItem.to"
                color="primary"
                router
                exact
                nuxt
              >
                <v-list-item-title class="text-subtitle-2">{{
                  $t(subItem.title)
                }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-list-group>
          <v-list-item
            v-else-if="item.title && !item.disable"
            :key="`item-${index}${title}`"
            :to="item.to"
            color="primary"
            router
            exact
            nuxt
          >
            <v-list-item-action>
              <div :class="`sidemenuIcon_${index}`"></div>
            </v-list-item-action>

            <v-list-item-title class="text-subtitle-2">{{
              $t(item.title)
            }}</v-list-item-title>
          </v-list-item>
          <v-subheader
            v-else-if="
              item.header &&
              drawerItems.filter(
                (i) => item.type === i.type && i.disable === false
              ).length > 0
            "
            :key="`item-${index}`"
            class="text-overline"
          >
            {{ $t(item.header) }}
          </v-subheader>
          <v-divider />
        </template>
        <v-list-group no-action>
          <template v-slot:prependIcon>
            <v-icon style="margin-left: 36px; margin-right: 10px"
              >mdi-web</v-icon
            >
          </template>
          <template v-slot:activator>
            <v-list-item-title class="text-subtitle-2">
              {{ $t('heading.switchLang') }}
            </v-list-item-title>
          </template>
          <v-list-item
            v-for="{ code, name } in locales"
            :key="code"
            :disabled="code === locale"
            @click="changeLocale(code)"
          >
            <v-list-item-title>{{ name }}</v-list-item-title>
          </v-list-item>
        </v-list-group>
        <v-divider v-if="showDocument"></v-divider>
        <v-list-item
          v-if="showDocument"
          class="mb-1"
          style="cursor: pointer"
          :href="documentLocation"
          target="_blank"
        >
          <v-list-item-icon>
            <svg-icon-question-mark
              style="margin-left: 35px; margin-right: 13px; margin-top: -2px"
            />
          </v-list-item-icon>

          <v-list-item-title class="text-subtitle-2">{{
            $t('link.documentation')
          }}</v-list-item-title>
        </v-list-item>
        <v-list-item
          v-if="showDocument"
          class="mb-1"
          style="cursor: pointer"
          @click.stop="goToChangelog"
        >
          <v-list-item-icon>
            <div style="position: relative">
              <v-icon style="margin-left: 34px; margin-right: 10px"
                >mdi-update</v-icon
              >
              <div
                v-if="changelogUnread"
                style="
                  position: absolute;
                  top: 8px;
                  left: 35px;
                  width: 6px;
                  height: 6px;
                  background-color: red;
                  border-radius: 50%;
                "
              ></div>
            </div>
          </v-list-item-icon>

          <v-list-item-title class="text-subtitle-2">{{
            $t('link.notification')
          }}</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>
        <v-list-item style="cursor: pointer" @click="logout()">
          <v-list-item-icon>
            <svg-icon-logout style="margin-left: 37px; margin-right: 15px" />
          </v-list-item-icon>

          <v-list-item-title class="text-subtitle-2">{{
            $t('button.signout')
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      class="px-4"
      flat
      scroll-target="#pageContainer"
      style="border-bottom: 1px solid #dddddd"
      :density="smAndDown ? 'comfortable' : 'default'"
    >
      <v-toolbar-title
        class="d-flex flex-row align-center ml-xl-4 cursor-pointer"
        style="min-width: 150px; user-select: none; max-width: fit-content"
        @click="router.push('/')"
      >
        <div class="d-flex flex-row justify-center align-center">
          <v-img
            alt="logo"
            :width="mdAndUp ? 150 : 135"
            :src="logoSrc"
            style="max-width: 150px; max-height: 42px"
          />
        </div>
      </v-toolbar-title>
      <v-tabs v-if="!smAndDown" :value="tabValue" optional color="#00653E">
        <v-tab
          v-for="(item, index) in tabItems"
          :key="index"
          :to="item.to"
          router
          nuxt
        >
          <div class="d-flex flex-row justify-center align-center">
            <div class="text-subtitle-1">{{ $t(item.title) }}</div>
          </div>
        </v-tab>
      </v-tabs>
      <v-spacer />
      <span
        v-if="planInfo?.useB2b2c"
        v-tippy="{ content: $t('tooltip.buyB2b2cCount') }"
        class="mr-md-2 mr-6 mt-md-0 mb-n1"
        style="cursor: pointer"
        @click.stop="router.push('/settings/cloud-task-count')"
      >
        <svg-icon-buy-b2b2c />
      </span>
      <div v-if="!smAndDown && showDocument" style="position: relative">
        <v-btn
          v-tippy="{ content: $t('tooltip.changelog') }"
          icon
          color="primaryDarken"
          @click.stop="goToChangelog"
        >
          <v-icon>mdi-update</v-icon>
        </v-btn>
        <div
          v-if="changelogUnread"
          style="
            position: absolute;
            top: 15px;
            left: 14px;
            width: 6px;
            height: 6px;
            background-color: red;
            border-radius: 50%;
          "
        ></div>
      </div>
      <button
        v-if="tourStore.tourFinished && !tourStore.redeemSuccess"
        class="mr-md-2 mr-6 mt-md-0 mb-n1 gradient-button"
        @click.stop="
          router.push({ path: '/settings/plan', query: { redeem: true } })
        "
      >
        <img src="/icon/tour-gift.png" alt="gift" />
        {{ $t('button.tourRedeemUpgrade') }}
      </button>
      <v-app-bar-nav-icon
        v-if="smAndDown"
        class="primaryDarken--text"
        @click.stop="drawer = !drawer"
      />
      <v-btn
        v-if="!smAndDown && showDocument"
        v-tippy="{ content: $t('tooltip.documentation') }"
        icon
        :href="documentLocation"
        target="_blank"
        color="primaryDarken"
      >
        <v-icon>mdi-help-circle-outline </v-icon>
      </v-btn>
      <v-menu v-if="!smAndDown" offset-y left rounded="md">
        <template v-slot:activator="{ props }">
          <v-btn
            v-tippy="{
              content: $t('tooltip.setting'),
            }"
            icon
            color="primaryDarken"
            v-bind="props"
          >
            <v-icon>mdi-cog-outline</v-icon>
          </v-btn>
        </template>

        <v-list width="200px">
          <template v-for="(item, i) in gearItems">
            <v-list-item
              v-if="!item.disable"
              :key="`gear-item-${i}`"
              :to="`/settings${item.to}`"
              nuxt
            >
              <v-list-item-title class="text-subtitle-1">{{
                $t(item.title)
              }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
      <v-menu
        v-if="!smAndDown"
        v-model="openProfileMenu"
        :close-on-content-click="false"
        offset-y
        left
        rounded="md"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
            v-tippy="{
              content: $t('tooltip.personalSetting'),
            }"
          >
            <v-avatar size="24" color="primaryDarken">
              <span class="white--text text-overline">{{
                getUserIconText()
              }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list width="270px">
          <v-list-item v-if="userInfo">
            <div class="d-flex flex-column">
              <div
                v-if="userInfo.name"
                class="text-subtitle-1 font-weight-bold"
              >
                {{ getUserName() }}
              </div>
              <div class="text-caption">{{ getUserAccount() }}</div>
              <div class="text-caption grey--text">
                {{ getUserType() }}
              </div>
            </div>
          </v-list-item>
          <v-divider></v-divider>
          <template v-for="(item, i) in avatarItems">
            <v-list-item
              v-if="!item.disable"
              :key="`avatar-item-${i}`"
              @click="
                () => {
                  router.push(`/account${item.to}`)
                  openProfileMenu = false
                }
              "
            >
              <v-list-item-title class="text-subtitle-1">{{
                $t(item.title)
              }}</v-list-item-title>
            </v-list-item>
          </template>
          <v-list-group no-action>
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="$t('heading.switchLang')">
              </v-list-item>
            </template>
            <v-list-item
              v-for="{ code, name } in locales"
              :key="code"
              :disabled="code === locale"
              @click="changeLocale(code)"
            >
              <v-list-item-title>{{ name }}</v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-list-item style="cursor: pointer" @click="logout">
            <v-list-item-title class="text-subtitle-1">{{
              $t('button.signout')
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <template v-if="smAndDown" v-slot:extension>
        <v-tabs :value="tabValue" optional color="#00653E">
          <v-tab
            v-for="(item, index) in tabItems"
            :key="index"
            :to="item.to"
            router
            nuxt
          >
            <div class="d-flex flex-row justify-center align-center">
              <div class="text-subtitle-1">{{ $t(item.title) }}</div>
            </div>
          </v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-main>
      <v-container id="pageContainer" class="pa-0" fluid fill-height>
        <!-- <v-card
            flat
            color="primary"
            class="rounded-t-0 rounded-b-lg"
            :class="{
              breadcrumbContainer: $vuetify.breakpoint.smAndUp,
              'breadcrumbContainer-sm': $vuetify.breakpoint.xsOnly,
            }"
          >
            <v-card-text>
              <v-row>
                <v-col
                  v-if="!smAndDown"
                  cols="12"
                  class="pa-5"
                >
                  <div class="text-h6 white--text pt-3 pl-6">
                    {{ pageTitle }}
                  </div>
                  <v-breadcrumbs dark :items="breadcrumbs">
                    <template v-slot:item="{ item }">
                      <v-breadcrumbs-item
                        exact
                        :to="item.href"
                        :disabled="item.disabled"
                      >
                        {{ item.text.toUpperCase() }}
                      </v-breadcrumbs-item>
                    </template>
                    <template v-slot:divider>
                      <v-icon>mdi-chevron-right</v-icon>
                    </template>
                  </v-breadcrumbs>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card> -->
        <slot />
      </v-container>
    </v-main>

    <!-- alert -->
    <v-alert
      v-model="alertStore.show"
      :color="alertStore.type"
      :icon="alertStore.icon"
      border
      style="
        position: fixed;
        top: 10%;
        left: 50%;
        transform: translate(-50%, 0);
        justify-content: center;
        z-index: 999999;
      "
    >
      {{ alertStore.message }}
      <v-icon medium class="ml-4" @click="alertStore.closeMessage()">
        mdi-close
      </v-icon>
    </v-alert>

    <!-- snackbar -->
    <v-snackbar
      v-model="snackbarStore.show"
      :timeout="snackbarStore.timeout"
      rounded="lg"
      multi-line
      style="word-break: break-all"
    >
      <v-icon
        :icon="snackbarStore.icon"
        :color="snackbarStore.type"
        variant="text"
        class="mr-2"
      ></v-icon>
      {{ snackbarStore.message }}

      <template v-slot:actions>
        <v-btn
          :color="snackbarStore.type"
          text
          @click="snackbarStore.closeMessage()"
        >
          {{ $t('button.close') }}
        </v-btn>
        <!-- <v-btn
          icon="mdi-close"
          color="white"
          variant="text"
          @click="snackbarStore.closeMessage()"
        >
          Close
        </v-btn> -->
      </template>
    </v-snackbar>

    <messageDialog></messageDialog>
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useAlertStore } from '@/stores/alert'
import { useTourStore } from '@/stores/tour'

const { getMyInfoApi, patchMyInfoApi } = useUserApi()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { $clevertap } = useNuxtApp()
const { t, locale, locales, setLocale } = useI18n()
const { smAndDown, mdAndUp } = useDisplay()
const alertStore = useAlertStore()
const mainStore = useMainStore()
const tourStore = useTourStore()
const snackbarStore = useSnackbarStore()

const showLoading = ref(true)
const drawer = ref(false)
const dynamicVh = ref(null)
const openProfileMenu = ref(false)
const entranceUrl = ref({
  login: 'https://dd.entrance.asia/login.php',
  payment: 'https://dd.entrance.asia/member_payment_add.php',
})
const cchappUrl = ref({
  login: 'https://cchapp.ai/megasigpro.php',
})
const changelogUnread = ref(false)

const tabValue = computed(() => {
  const path = route.path
  const full = route.fullPath
  return path[path.length - 1] !== '/'
    ? `${path}/${full.substring(path.length)}`
    : full === '/'
      ? ''
      : full
})
const userInfo = computed(() => {
  return mainStore.userInfo
})
const planInfo = computed(() => {
  return mainStore.planInfo
})
const userType = computed(() => {
  return mainStore.userType
})
const tabItems = computed(() => {
  return mainStore.drawerItems
})
const drawerItems = computed(() => {
  return mainStore.navigationDrawerItems
})
const gearItems = computed(() => {
  return mainStore.settingItems
})
const avatarItems = computed(() => {
  return mainStore.accountItems
})
const showDocument = computed(() => {
  return locale.value === 'zh-TW'
})

const documentLocation = computed(() => {
  const defaultUrl = `${runtimeConfig.public.landingURL}/helpcenter/`
  return useCustomUI.value && userInfo.value
    ? userInfo.value.siHelpUrl
    : defaultUrl
})

const isEntrance = computed(() => {
  if (userInfo.value && userInfo.value.siHelpUrl) {
    return userInfo.value.siHelpUrl.includes('entrance.asia')
  }
  return false
})
const isCchapp = computed(() => {
  if (userInfo.value && userInfo.value.siHelpUrl) {
    return userInfo.value.siHelpUrl.includes('cchapp.ai')
  }
  return false
})

const useCustomUI = computed(() => {
  return planInfo.value && userInfo.value
    ? userInfo.value.companyType === 'SI_CHILD' && planInfo.value.useCustomUI
    : false
})

const logoSrc = computed(() => {
  const defaultSrc = '/images/logo/logo_green.png'
  return useCustomUI.value && userInfo.value
    ? userInfo.value.siLogo
    : defaultSrc
})

watch(
  () => route.value,
  (to) => {
    console.log(to)
    if (
      !to.path.startsWith('/reports') &&
      !to.fullPath.startsWith('/preview')
    ) {
      mainStore.removeReportOptions()
    }
    // 離開文件相關時清除儲存的搜尋排序選項
    if (!to.path.startsWith('/tasks')) {
      mainStore.removeSearchOptions()
    }
  }
)

onMounted(() => {
  // TODO: remove updateMyInfo
  updateMyInfo()

  showLoading.value = false
  window.addEventListener('focus', (e) => {
    if (!useCookie('PDF_JWT_TOKEN').value) {
      mainStore.logout()
      router.push('/login')
    }
  })
  if (useCookie('changelog').value !== runtimeConfig.public.VERSION) {
    changelogUnread.value = true
  }
  try {
    $clevertap.onUserLogin.push({
      Site: {
        Name: userInfo.value.name,
        Identity: userInfo.value.id,
        Email: userInfo.value.email,
        Company: userInfo.value.companyCommonName,
      },
    })
  } catch (e) {
    console.log(e)
  }
})

async function logout() {
  openProfileMenu.value = false
  let logoutUrl = window.location.origin + '/login'
  // 客製: 安轉與兆基登出時跳轉到他們的網站
  // 判斷方式為SI設定的說明文件domain
  if (isEntrance.value) {
    logoutUrl = entranceUrl.value.login
  } else if (isCchapp.value) {
    logoutUrl = cchappUrl.value.login
  }
  await mainStore.logout().then(() => {
    router.push(logoutUrl)
  })
}
async function updateMyInfo() {
  const result = await getMyInfoApi()
  if (result && result.body !== null) {
    mainStore.setUserInfo(result.body)
  }
}
function getUserIconText() {
  if (userInfo.value && userInfo.value.account) {
    return userInfo.value.account.slice(0, 1)
  }
  return ''
}
function getUserAccount() {
  if (userInfo.value) {
    return userInfo.value.account
  }
  return ''
}
function getUserName() {
  if (userInfo.value) {
    return userInfo.value.name
  }
  return ''
}
function getUserType() {
  if (userInfo.value) {
    switch (userInfo.value.userType) {
      case 'COMPANY_ADMIN':
        return t('text.compAdmin')
      case 'USER':
        return t('text.user')
    }
  }
  return ''
}
async function changeLocale(code) {
  if (code === locale.value) {
    return
  }
  setLocale(code)
  // setTimeout(async () => {
  const result = await patchMyInfoApi({ culture: code })
  if (result !== null && result.body !== null) {
    mainStore.setUserInfo(result.body)
  }
  // window.location.reload()
  // }, 0)
}
function goToChangelog() {
  const changelog = useSetCookie('changelog', 24 * 7)
  changelog.value = runtimeConfig.public.VERSION
  window.open(
    `${runtimeConfig.public.landingURL}/helpcenter/changelog`,
    '_blank'
  )
  changelogUnread.value = false
}
</script>

<style lang="sass">
@use "~/assets/override.scss"
</style>
<style lang="scss">
.v-slide-group__prev {
  display: none !important;
}

@media (max-width: 1250px) {
  a.v-tab {
    min-width: 80px !important;
    padding: 0 8px !important;
  }
}

.v-application--wrap {
  min-height: calc(var(--vh, 1vh) * 100);
}

.logo-text {
  font-size: 1.5rem;
  line-height: 2rem;
  font-family: 'Kanit' !important;
}

.toolbar-sm {
  display: none;
}

.breadcrumbContainer {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  height: 240px;
}

.breadcrumbContainer-sm {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  height: 180px;
}

.v-list-group__header__prepend-icon {
  display: flex !important;
  align-self: center !important;
}

.account-icon {
  background-image: url('/icon/account-profile.svg');
}

.setting-icon {
  background-image: url('/icon/setting.svg');
}

.document-icon {
  background-image: url('/icon/document.svg');
}

.logout-icon {
  background-image: url('/icon/logout.svg');
}

.v-list-item .sidemenuIcon_0 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_home.svg');
}

.v-list-item--active .sidemenuIcon_0 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_home_a.svg');
}

.v-list-item .sidemenuIcon_1 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_file.svg');
}

.v-list-item--active .sidemenuIcon_1 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_file_a.svg');
}

.v-list-item .sidemenuIcon_2 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_template.svg');
}

.v-list-item--active .sidemenuIcon_2 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_template_a.svg');
}

.v-list-item .sidemenuIcon_3 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_report.svg');
}

.v-list-item--active .sidemenuIcon_3 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_report_a.svg');
}

.v-list-item .sidemenuIcon_4 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_setting.svg');
}

.v-list-item--active .sidemenuIcon_4 {
  width: 24px;
  height: 24px;
  background-image: url('/images/sidemenu/ic_sidemenu_setting_a.svg');
}

@-moz-keyframes spinner-loader {
  0% {
    -moz-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -moz-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes spinner-loader {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes spinner-loader {
  0% {
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

.spinner-loader:not(:required) {
  -moz-animation: spinner-loader 3000ms infinite linear;
  -webkit-animation: spinner-loader 3000ms infinite linear;
  animation: spinner-loader 3000ms infinite linear;
}

div.v-list-item__icon.v-list-group__header__prepend-icon {
  margin-right: 0px !important;
}
div.v-list-item__icon.v-list-group__header__append-icon {
  margin-right: 24px !important;
}

div.v-list-item__icon {
  margin-right: 0px !important;
}
</style>

<style lang="scss" scoped>
.gradient-button {
  white-space: nowrap;
  font-size: 12px;
  background: transparent
    linear-gradient(90deg, #26ff55 0%, #268aff 48%, #fc55ff 100%) 0% 0%
    no-repeat padding-box;
  border-radius: 17px;
  padding: 8px 14px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
</style>
