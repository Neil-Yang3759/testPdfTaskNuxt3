<template>
    <v-container>
        <div class="d-flex flex-column justify-center align-center">
            <div class="upper-block"></div>
            <div class="logo-area">
                <a :href="$config.landingURL">
                    <img alt="logo" width="250" height="45" src="/images/logo/logo_white.png" />
                </a>
                <p>{{ $t('heading.loginSlogan') }}</p>
            </div>
            <v-card class="main-card" flat>
                <v-card-text v-if="!show2FAInput" class="pa-0">
                    <v-tabs v-model="tab" grow active-class="active-tab" slider-color="#008145" slider-size="3">
                        <v-tab>{{ $t('button.login') }}</v-tab>
                        <v-tab>{{ $t('button.signUp') }}</v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab">
                        <v-tab-item key="login">
                            <validation-observer ref="loginObserver" vid="login">
                                <v-form ref="loginForm" class="pt-15" @submit.prevent="login">
                                    <validation-provider v-slot="{ errors }" vid="email" :name="$t('label.email')"
                                        rules="required|email">
                                        <v-text-field id="email" v-model="modelLogin.account" type="email"
                                            :error-messages="errors" :label="autofill ? null : $t('label.email')"
                                            placeholder="E-mail" outlined required class="rounded-lg"></v-text-field>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" vid="password" :name="$t('label.password')"
                                        rules="required">
                                        <v-text-field id="password" v-model="modelLogin.password"
                                            :error-messages="errors" :label="autofill ? null : $t('label.password')"
                                            :type="showPassword ? 'text' : 'password'" placeholder="Password" outlined
                                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" required
                                            class="rounded-lg"
                                            @click:append="showPassword = !showPassword"></v-text-field>
                                    </validation-provider>
                                    <div class="d-flex flex-column align-center mt-n2 mb-3">
                                        <div style="margin-left: auto" class="mb-3">
                                            <a class="ml-auto text-decoration-none"
                                                @click="$router.push(localePath('/forget-password'))">{{
                                                    $t('label.forgotPassword') }}</a>
                                        </div>
                                        <div style="margin-right: auto">
                                            <v-checkbox v-model="isRememberMe"
                                                :label="$t('label.rememberMe')"></v-checkbox>
                                        </div>
                                    </div>
                                    <v-btn block :x-large="$vuetify.breakpoint.smAndUp"
                                        :large="$vuetify.breakpoint.xsOnly" color="primary" :loading="loading"
                                        class="rounded-lg text-subtitle-1 text-sm-h6" type="submit">{{
                                            $t('button.login') }}</v-btn>
                                </v-form>
                            </validation-observer>
                            <div class="d-flex flex-row align-center py-5">
                                <v-divider style="border-color: #aaaaaa"></v-divider>
                                <div class="text-subtitle-2 font-weight-bold white px-4">
                                    {{ $t('text.or3rdPartyLogin') }}
                                </div>
                                <v-divider style="border-color: #aaaaaa"></v-divider>
                            </div>
                            <div class="text-center">
                                <v-btn dark width="100%" max-width="60px" height="48px" class="social-signin-btn"
                                    @click="socialSignin('google')">
                                    <img width="60" alt="Google Signin Logo" src="/images/logo/google-logo.svg" />
                                </v-btn>
                                <!--
                <v-btn
                  dark
                  width="100%"
                  max-width="60px"
                  height="48px"
                  class="social-signin-btn ml-2"
                  @click="socialSignin('facebook')"
                >
                  <img
                    width="60"
                    alt="Facebook Signin Logo"
                    src="/images/logo/facebook-logo.svg"
                  />
                </v-btn>
                <v-btn
                  dark
                  width="100%"
                  max-width="60px"
                  height="48px"
                  class="social-signin-btn ml-2"
                  @click="socialSignin('apple')"
                >
                  <img
                    width="60"
                    alt="Apple Signin Logo"
                    src="/images/logo/apple-logo.svg"
                  />
                </v-btn>
                -->
                            </div>
                        </v-tab-item>
                        <v-tab-item key="signup">
                            <validation-observer ref="signupObserver" vid="signup">
                                <v-form ref="signupForm" class="pt-8" @submit.prevent="signup">
                                    <validation-provider v-slot="{ errors }" vid="userName" :name="$t('label.fullName')"
                                        rules="required">
                                        <v-text-field id="userName" v-model="modelSignup.userName" type="text"
                                            :error-messages="errors" :label="$t('label.fullName')"
                                            :placeholder="$t('placeholder.fullName')" outlined required
                                            class="rounded-lg" autocomplete="off"></v-text-field>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" vid="email" :name="$t('label.email')"
                                        rules="required|email">
                                        <v-text-field id="email" v-model="modelSignup.account" type="email"
                                            :error-messages="errors" :label="$t('label.email')" placeholder="E-mail"
                                            outlined required class="rounded-lg" autocomplete="off"></v-text-field>
                                    </validation-provider>
                                    <validation-provider v-slot="{ errors }" vid="new-password"
                                        :name="$t('label.password')" rules="required|max:30|min:8">
                                        <v-text-field id="new-password" v-model="modelSignup.password"
                                            :error-messages="errors" :label="$t('label.password')"
                                            :hint="$t('label.passwordHint')" persistent-hint
                                            :type="showPassword ? 'text' : 'password'" placeholder="Password" outlined
                                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" required
                                            class="rounded-lg" autocomplete="new-password"
                                            @click:append="showPassword = !showPassword"></v-text-field>
                                    </validation-provider>
                                    <recaptcha />
                                    <div class="d-flex flex-column mb-4 mt-4">
                                        <div>
                                            <v-checkbox v-model="modelSignup.agreeMarketing" dense hide-details>
                                                <template #label>
                                                    {{ $t('label.agreeMarketing') }}
                                                </template>
                                            </v-checkbox>
                                        </div>
                                        <div>
                                            <validation-provider v-slot="{ errors }" vid="agreePrivacy"
                                                :name="$t('label.agreePrivacy')"
                                                :rules="{ required: { allowFalse: false } }">
                                                <v-checkbox v-model="modelSignup.agreePrivacy" dense required
                                                    :error-messages="errors">
                                                    <template #label>
                                                        <span>
                                                            {{ $t('text.signUpNotice') }}
                                                            <a target="_blank"
                                                                href="https://www.breezysign.com/terms_of_service"
                                                                style="text-decoration: none" @click.stop>{{
                                                                    $t('link.terms') }}</a>
                                                            {{ $t('text.and') }}
                                                            <a target="_blank"
                                                                href="https://www.breezysign.com/privacy_policy"
                                                                style="text-decoration: none" @click.stop>{{
                                                                    $t('link.privacy') }}</a>
                                                        </span>
                                                    </template>
                                                </v-checkbox>
                                            </validation-provider>
                                        </div>
                                    </div>
                                    <v-btn block :x-large="$vuetify.breakpoint.smAndUp"
                                        :large="$vuetify.breakpoint.xsOnly" color="primary" :loading="loading"
                                        class="rounded-lg text-subtitle-1 text-sm-h6" type="submit">{{
                                            $t('button.signUp') }}</v-btn>
                                </v-form>
                            </validation-observer>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card-text>
                <v-card-text v-if="show2FAInput">
                    <validation-observer ref="loginObserver" vid="login">
                        <v-form ref="loginForm" class="pt-10" @submit.prevent="login2FA">
                            <div class="text-h5 text-center mb-8">
                                {{ $t('text.twoFactorAuthCodeNeeded') }}
                            </div>
                            <validation-provider v-slot="{ errors }" vid="twoFactorAuthCode"
                                :name="$t('label.twoFactorAuthCode')" rules="required">
                                <v-text-field v-if="show2FAInput" id="twoFactorAuthCode" v-model="twoFactorAuthCode"
                                    autocapitalize="none" :error-messages="errors"
                                    :label="$t('label.twoFactorAuthCode')" type="text"
                                    :placeholder="$t('placeholder.twoFactorAuthCode')" outlined required></v-text-field>
                            </validation-provider>
                            <v-btn block :x-large="$vuetify.breakpoint.smAndUp" :large="$vuetify.breakpoint.xsOnly"
                                color="primary" :loading="loading" class="rounded-lg text-subtitle-1 text-sm-h6 mt-8"
                                type="submit">{{ $t('button.next')
                                }}</v-btn>
                            <div class="d-flex flex-column align-center mt-3 mb-3">
                                <div style="margin: auto" class="mb-3">
                                    <a class="ml-auto text-decoration-none" @click="cancel2FA">{{
                                        $t('button.return')
                                        }}</a>
                                </div>
                            </div>
                        </v-form>
                    </validation-observer>
                </v-card-text>
            </v-card>
            <div class="empty-block"></div>
        </div>
        <v-dialog v-model="changePasswordDialog" overlay-opacity="0.9" max-width="450" persistent
            @input="changePasswordCancel()">
            <v-card class="rounded-lg">
                <v-app-bar dark flat color="primary">
                    <v-toolbar-title class="ml-5 mx-auto text-h6">{{
                        $t('heading.changePassword')
                        }}</v-toolbar-title>
                </v-app-bar>

                <v-card-text class="px-10 pt-10 pb-5">
                    <v-alert v-if="changePasswordError" type="error" outlined>{{
                        changePasswordError
                        }}</v-alert>
                    <validation-observer ref="changePasswordObserver" vid="changePassword">
                        <v-form ref="changePasswordDialogForm" @submit.prevent>
                            <validation-provider v-slot="{ errors }" vid="oldPassword" :name="$t('label.oldPassword')"
                                rules="required">
                                <v-text-field id="oldPassword" v-model="model.oldPassword" autocapitalize="none"
                                    :error-messages="errors" :label="$t('label.oldPassword')"
                                    :type="showOldPassword ? 'text' : 'password'"
                                    :placeholder="$t('placeholder.oldPassword')"
                                    :append-icon="showOldPassword ? 'mdi-eye' : 'mdi-eye-off'" outlined required
                                    @click:append="showOldPassword = !showOldPassword"></v-text-field>
                            </validation-provider>
                            <validation-provider v-slot="{ errors }" vid="newPassword" :name="$t('label.newPassword')"
                                rules="required">
                                <v-text-field id="newPassword" v-model="model.newPassword" autocapitalize="none"
                                    :error-messages="errors" :label="$t('label.newPassword')"
                                    :type="showNewPassword ? 'text' : 'password'"
                                    :placeholder="$t('placeholder.newPassword')"
                                    :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'" outlined required
                                    @click:append="showNewPassword = !showNewPassword"></v-text-field>
                            </validation-provider>
                            <validation-provider v-slot="{ errors }" vid="newPasswordCheck"
                                :name="$t('label.newPasswordConfirm')" rules="required|confirmed:newPassword">
                                <v-text-field id="newPasswordCheck" v-model="model.newPasswordCheck"
                                    autocapitalize="none" :error-messages="errors"
                                    :label="$t('label.newPasswordConfirm')"
                                    :type="showNewPasswordCheck ? 'text' : 'password'"
                                    :placeholder="$t('placeholder.newPasswordConfirm')" :append-icon="showNewPasswordCheck ? 'mdi-eye' : 'mdi-eye-off'
                                        " outlined required
                                    @click:append="showNewPasswordCheck = !showNewPasswordCheck"></v-text-field>
                            </validation-provider>
                        </v-form>
                    </validation-observer>
                </v-card-text>
                <v-card-actions class="px-10 py-5 grey lighten-3">
                    <v-spacer></v-spacer>
                    <v-btn large outlined color="primary" class="text-subtitle-2 mr-2" @click="changePasswordCancel()">
                        {{ $t('button.cancel') }}
                    </v-btn>
                    <v-btn large color="primary" class="text-subtitle-2" @click="changePasswordOK()">
                        {{ $t('button.ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="resendMailDialog" overlay-opacity="0.9" max-width="450" @input="resendMailDialog = false">
            <v-card class="rounded-lg pa-5">
                <v-card-title>
                    <v-icon class="mr-1">mdi-information-outline</v-icon>
                    <span style="font-weight: 700">
                        {{ $t('heading.acctNeedActivate') }}
                    </span>
                </v-card-title>
                <v-card-text class="px-10 pt-5 pb-5">
                    <div class="text-subtitle-1">
                        {{ $t('message.acctNeedActivate', { mail: modelLogin.account }) }}
                    </div>
                </v-card-text>
                <v-card-actions class="px-5 py-5">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark class="text-subtitle-2" :loading="resendMailDialogLoading"
                        @click="resendMailOK()">
                        {{ $t('button.resendMail') }}
                    </v-btn>
                    <v-btn text color="primary" class="text-subtitle-2 mr-2" @click="resendMailDialog = false">
                        {{ $t('button.okGotIt') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();

definePageMeta({
    layout: 'empty',
})


const tab = ref(null)
const loading = ref(false)
const isRememberMe = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showNewPasswordCheck = ref(false)
const autofill = ref(true)
const searchAutoFillCount = ref(0)
const action = ref('')
const showCloseTabMessage = ref(false)
const showPassword = ref(false)
const modelSignup = ref({
    userName: '',
    account: '',
    password: '',
    agreePrivacy: false,
    agreeMarketing: false,
})
const redirectURL = ref('')
const changePasswordError = ref('')
const changePasswordDialog = ref(false)
const resendMailDialog = ref(false)
const resendMailDialogLoading = ref(false)
const clientId = ref('')
const state = ref('')
const modelLogin = ref({
    account: '',
    password: '',
    oldPassword: '',
    newPassword: '',
    newPasswordCheck: '',
})
const show2FAInput = ref(false)
const twoFactorAuthCode = ref('')
const thirdParty2FALogin = ref(false)
const loginObserver = ref(null)
const signupObserver = ref(null)
const changePasswordObserver = ref(null)

action.value = route.query.action
clientId.value = route.query.client_id
redirectURL.value =
    route.query.redirect_url || route.query.redirect_uri
state.value = route.query.state
tab.value = action.value === 'signup' ? 1 : 0

const isOAuth = computed(() => {
    return clientId.value && redirectURL.value
})

watch(tab, (value) => {
    if (value === 0 && loginObserver.value) {
        loginObserver.value.reset()
    } else if (value === 1 && signupObserver.value) {
        signupObserver.value.reset()
    }
})

watch('modelLogin.account', (value) => {
    if (value === '') {
        autofill.value = false
    }
})

watch('modelLogin.password', (value) => {
    if (value === '') {
        autofill.value = false
    }
})

onMounted(() => {
    if (
        // this.$store.getters.getIsLogin &&
        // this.$store.getters.getIsGetUserInfo &&
        !clientId.value &&
        !redirectURL.value
    ) {
        // 已經登入的狀態，如果action是訂閱要跳轉到訂閱頁面
        if (action.value === 'subscribe') {
            checkPlanParamAndRedirect()
        } else if (action.value === 'close-tab') {
            window.location.href = window.location.origin + '/close-tab'
        } else {
            router.push('/')
        }
    }
    const id = setInterval(() => {
        const inputEmail = document.querySelector(
            'input[type=email]:-webkit-autofill'
        )
        const inputPassword = document.querySelector(
            'input[type=password]:-webkit-autofill'
        )
        if (inputEmail && inputPassword) {
            clearInterval(id)
            autofill.value = true
        } else if (searchAutoFillCount.value > 10) {
            clearInterval(id)
        } else {
            autofill.value = false
            searchAutoFillCount.value++
        }
    }, 100)
    initialFacebookSignin()

    $recaptcha.language = $i18n.locale
    $store.commit('setPageTitle', $t('title.login'))
})

return {
    isOAuth,
    loginObserver,
    signupObserver,
    changePasswordObserver,
    tab,
    loading,
    isRememberMe,
    showOldPassword,
    showNewPassword,
    showNewPasswordCheck,
    autofill,
    searchAutoFillCount,
    action,
    showCloseTabMessage,
    showPassword,
    modelSignup,
    redirectURL,
    changePasswordError,
    changePasswordDialog,
    resendMailDialog,
    resendMailDialogLoading,
    clientId,
    state,
    modelLogin,
    show2FAInput,
    twoFactorAuthCode,
    thirdParty2FALogin,
}
</script>

<script>
export default {
    layout: 'empty',
    data() {
        return {
            // ui
            tab: null,
            loading: false,
            isRememberMe: false,
            showOldPassword: false,
            showNewPassword: false,
            showNewPasswordCheck: false,
            autofill: true,
            searchAutoFillCount: 0,
            action: '',
            showCloseTabMessage: false,
            // data - signup
            showPassword: false,
            modelSignup: {
                userName: '',
                account: '',
                password: '',
                agreePrivacy: false,
                agreeMarketing: false,
            },
            // data - login
            redirectURL: '',
            changePasswordError: '',
            changePasswordDialog: false,
            resendMailDialog: false,
            resendMailDialogLoading: false,
            clientId: '',
            state: '',
            modelLogin: {
                account: '',
                password: '',
                oldPassword: '',
                newPassword: '',
                newPasswordCheck: '',
            },
            show2FAInput: false,
            twoFactorAuthCode: '',
            thirdParty2FALogin: false,
        }
    },
    computed: {
        isOAuth() {
            return this.clientId && this.redirectURL
        },
    },
    watch: {
        tab(value) {
            if (value === 0 && this.$refs.loginObserver) {
                this.$refs.loginObserver.reset()
            } else if (value === 1 && this.$refs.signupObserver) {
                this.$refs.signupObserver.reset()
            }
        },
        'modelLogin.account': {
            handler(value) {
                if (value === '') {
                    this.autofill = false
                }
            },
        },
        'modelLogin.password': {
            handler(value) {
                if (value === '') {
                    this.autofill = false
                }
            },
        },
    },
    created() {
        this.action = this.$route.query.action
        this.clientId = this.$route.query.client_id
        this.redirectURL =
            this.$route.query.redirect_url || this.$route.query.redirect_uri
        this.state = this.$route.query.state
        this.tab = this.action === 'signup' ? 1 : 0
        // const rememberAccount = this.$store.getters.getRememberedAccount
        // if (rememberAccount) {
        //     this.modelLogin.account = rememberAccount
        //     this.isRememberMe = true
        // }
    },
    mounted() {
        if (
            // this.$store.getters.getIsLogin &&
            // this.$store.getters.getIsGetUserInfo &&
            !this.clientId &&
            !this.redirectURL
        ) {
            // 已經登入的狀態，如果action是訂閱要跳轉到訂閱頁面
            if (this.action === 'subscribe') {
                this.checkPlanParamAndRedirect()
            } else if (this.action === 'close-tab') {
                window.location.href = window.location.origin + '/close-tab'
            } else {
                this.$router.push('/')
            }
        }
        const id = setInterval(() => {
            const inputEmail = document.querySelector(
                'input[type=email]:-webkit-autofill'
            )
            const inputPassword = document.querySelector(
                'input[type=password]:-webkit-autofill'
            )
            if (inputEmail && inputPassword) {
                clearInterval(id)
                this.autofill = true
            } else if (this.searchAutoFillCount > 10) {
                clearInterval(id)
            } else {
                this.autofill = false
                this.searchAutoFillCount++
            }
        }, 100)
        this.initialFacebookSignin()

        this.$recaptcha.language = this.$i18n.locale
        this.$store.commit('setPageTitle', this.$t('title.login'))
    },
    methods: {
        async signup() {
            this.loading = true
            const success = await this.$refs.signupObserver.validate()
            if (!success) {
                this.loading = false
                await this.$recaptcha.reset()
                return
            }
            let recaptchaResponse = null
            try {
                recaptchaResponse = await this.$recaptcha.getResponse()
            } catch (error) { }
            if (!recaptchaResponse) {
                this.loading = false
                await this.$recaptcha.reset()
                this.$alert.showMessage({
                    message: this.$t('message.iAmNotBot'),
                    type: 'error',
                })
                return
            }
            const result = await this.$apiRepository(
                this.$i18n.locale
            ).user.createUser.post({
                name: this.modelSignup.userName,
                account: this.modelSignup.account,
                password: this.modelSignup.password,
                recaptchaResponse,
                privacy: this.modelSignup.agreePrivacy,
                marketing: this.modelSignup.agreeMarketing,
            })
            const email = this.modelSignup.account
            this.loading = false
            await this.$recaptcha.reset()
            if (result !== null && result.errorCode === 201) {
                this.$refs.signupForm.reset()
                // 註冊成功後進入成功提示頁面
                this.$router.push(`/signup-success?email=${email}`)
            } else {
                this.$alert.showMessage({
                    message: result.message,
                    type: 'error',
                })
            }
        },
        async login() {
            this.loading = true
            const success = await this.$refs.loginObserver.validate()
            if (!success) {
                this.loading = false
                return
            }
            await this.$store.dispatch('rememberInfo', {
                isRememberMe: this.isRememberMe,
                account: this.modelLogin.account,
            })

            const postData = {
                loginType: 'PASSWORD',
                account: this.modelLogin.account,
                password: this.modelLogin.password,
            }

            if (this.show2FAInput) {
                postData.code = this.twoFactorAuthCode
            }

            const result = await this.$apiRepository(
                this.$i18n.locale
            ).user.login.post(postData)

            this.loading = false
            if (result !== null && result.errorCode === 200 && result.body !== null) {
                // OAuth流程，導向redirectURL
                await this.$store
                    .dispatch('changeLogin', {
                        isLogin: true,
                        token: result.body.token,
                        userInfo: result.body,
                        locale: this.$i18n.locale,
                    })
                    .then(async () => {
                        if (this.isOAuth) {
                            const codeResult = await this.$apiRepository(
                                this.$i18n.locale
                            ).user.oauth.post({
                                loginType: 'PASSWORD',
                                account: this.modelLogin.account,
                                password: this.modelLogin.password,
                                clientId: this.clientId,
                            })
                            const param = `?code=${codeResult.body.code}&state=${this.state}`
                            this.redirectURL += param
                        }
                        if (this.redirectURL && this.redirectURL !== '') {
                            this.$router.push({
                                redirect: (window.location.href = this.redirectURL),
                            })
                        } else if (this.action === 'subscribe') {
                            this.checkPlanParamAndRedirect()
                        } else if (this.action === 'close-tab') {
                            window.location.href = window.location.origin + '/close-tab'
                        } else {
                            this.$router.push(this.localePath('/'))
                        }
                    })
            } else if (
                result !== null &&
                result.errorCode === 204 &&
                result.body !== null
            ) {
                this.$store.commit('setToken', result.body.token)
                this.changePasswordDialog = true
            } else if (
                result !== null &&
                result.errorCode === 409 &&
                result.body !== null
            ) {
                this.resendMailDialog = true
            } else if (
                result !== null &&
                result.errorCode === 417 &&
                result.body !== null
            ) {
                this.show2FAInput = true
            } else {
                this.$alert.showMessage({
                    message: result.message,
                    type: 'error',
                })
            }
        },
        async changePasswordOK() {
            await this.$refs.changePasswordObserver
                .validate()
                .then(async (success) => {
                    if (!success) {
                        return
                    }
                    await this.$apiRepository(this.$i18n.locale)
                        .user.myInfo.patch({
                            originPassword: this.modelLogin.oldPassword,
                            password: this.modelLogin.newPassword,
                        })
                        .then(async (result) => {
                            if (
                                result !== null &&
                                result.errorCode === 200 &&
                                result.body !== null
                            ) {
                                this.changePasswordDialog = false
                                this.changePasswordError = ''
                                this.$refs.changePasswordDialogForm.reset()
                                this.$refs.changePasswordObserver.reset()
                                // await this.$store
                                //     .dispatch('changeLogin', {
                                //         isLogin: true,
                                //         token: this.$store.getters.getToken,
                                //         userInfo: result.body,
                                //         locale: this.$i18n.locale,
                                //     })
                                //     .then(async () => {
                                //         await this.$store.dispatch('loginRedirect')
                                //     })
                            } else {
                                this.changePasswordError = result.message
                            }
                        })
                })
        },
        changePasswordCancel() {
            this.changePasswordDialog = false
            this.changePasswordError = ''
            this.$refs.changePasswordDialogForm.reset()
            this.$refs.changePasswordObserver.reset()
        },
        async resendMailOK() {
            this.resendMailDialogLoading = true
            await this.$apiRepository(this.$i18n.locale)
                .user.resendMail.postItem(this.modelLogin.account, {})
                .then((result) => {
                    this.resendMailDialogLoading = false
                    if (
                        result !== null &&
                        result.errorCode === 200 &&
                        result.body !== null
                    ) {
                        this.resendMailDialog = false
                        this.$messageDialog.showMessage({
                            message: this.$t('message.reVerifyMailSuccess'),
                            width: 450,
                        })
                    } else {
                        this.resendMailDialog = false
                        this.$alert.showMessage({
                            message: this.$t('message.reVerifyMailError'),
                            type: 'error',
                        })
                    }
                })
        },
        socialSignin(platform) {
            try {
                const googleClientId = this.$config.GOOGLE_CLIENT_ID
                const self = this
                switch (platform) {
                    case 'google':
                        window.google.accounts.id.initialize({
                            client_id: googleClientId,
                            use_fedcm_for_prompt: true,
                            callback: async (response) => {
                                const accessToken = response.credential
                                const postData = {
                                    loginType: 'GOOGLE',
                                    token: accessToken,
                                }
                                if (this.show2FAInput) {
                                    postData.code = this.twoFactorAuthCode
                                }
                                const result = await self
                                    .$apiRepository(self.$i18n.locale)
                                    .user.login.post(postData)
                                if (
                                    result !== null &&
                                    result.errorCode === 200 &&
                                    result.body !== null
                                ) {
                                    await self.$store
                                        .dispatch('changeLogin', {
                                            isLogin: true,
                                            token: result.body.token,
                                            userInfo: result.body,
                                            locale: this.$i18n.locale,
                                        })
                                        .then(async () => {
                                            if (self.isOAuth) {
                                                const codeResult = await self
                                                    .$apiRepository(self.$i18n.locale)
                                                    .user.oauth.post({
                                                        loginType: 'GOOGLE',
                                                        token: accessToken,
                                                        clientId: self.clientId,
                                                    })
                                                const param = `?code=${codeResult.body.code}&state=${self.state}`
                                                self.redirectURL += param
                                            }
                                            if (result.body.newUser) {
                                                self.$router.push(self.localePath('/signupthankyou'))
                                            } else if (self.redirectURL && self.redirectURL !== '') {
                                                self.$router.push({
                                                    redirect: (window.location.href = self.redirectURL),
                                                })
                                            } else if (this.action === 'subscribe') {
                                                self.checkPlanParamAndRedirect()
                                            } else if (this.action === 'close-tab') {
                                                window.location.href =
                                                    window.location.origin + '/close-tab'
                                            } else {
                                                self.$router.push(self.localePath('/'))
                                            }
                                        })
                                } else if (result.errorCode === 417) {
                                    self.thirdParty2FALogin = true
                                    self.show2FAInput = true
                                } else {
                                    self.$alert.showMessage({
                                        message: result.message,
                                        type: 'error',
                                    })
                                }
                            },
                        })
                        window.google.accounts.id.prompt(() => {
                            const client = window.google.accounts.oauth2.initTokenClient({
                                client_id: googleClientId,
                                scope:
                                    'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                                callback: async (tokenResponse) => {
                                    const postData = {
                                        loginType: 'GOOGLE',
                                        token: tokenResponse.access_token,
                                    }
                                    if (this.show2FAInput) {
                                        postData.code = this.twoFactorAuthCode
                                    }
                                    const result = await self
                                        .$apiRepository(self.$i18n.locale)
                                        .user.login.post(postData)
                                    if (
                                        result !== null &&
                                        result.errorCode === 200 &&
                                        result.body !== null
                                    ) {
                                        await self.$store
                                            .dispatch('changeLogin', {
                                                isLogin: true,
                                                token: result.body.token,
                                                userInfo: result.body,
                                                locale: this.$i18n.locale,
                                            })
                                            .then(async () => {
                                                if (self.isOAuth) {
                                                    const codeResult = await self
                                                        .$apiRepository(self.$i18n.locale)
                                                        .user.oauth.post({
                                                            loginType: 'GOOGLE',
                                                            token: tokenResponse.access_token,
                                                            clientId: self.clientId,
                                                        })
                                                    const param = `?code=${codeResult.body.code}&state=${self.state}`
                                                    self.redirectURL += param
                                                }
                                                if (result.body.newUser) {
                                                    self.$router.push(self.localePath('/signupthankyou'))
                                                } else if (
                                                    self.redirectURL &&
                                                    self.redirectURL !== ''
                                                ) {
                                                    self.$router.push({
                                                        redirect: (window.location.href = self.redirectURL),
                                                    })
                                                } else if (this.action === 'subscribe') {
                                                    self.checkPlanParamAndRedirect()
                                                } else {
                                                    self.$router.push(self.localePath('/'))
                                                }
                                            })
                                    } else if (result.errorCode === 417) {
                                        self.thirdParty2FALogin = true
                                        self.show2FAInput = true
                                    } else {
                                        self.$alert.showMessage({
                                            message: result.message,
                                            type: 'error',
                                        })
                                    }
                                },
                            })
                            client.requestAccessToken()
                        })
                        break
                    case 'facebook':
                        window.FB.login(
                            async function (response) {
                                if (response.status === 'connected') {
                                    const accessToken = response.authResponse.accessToken
                                    const result = await self
                                        .$apiRepository(self.$i18n.locale)
                                        .user.login.post({
                                            loginType: 'FACEBOOK',
                                            token: accessToken,
                                        })
                                    if (
                                        result !== null &&
                                        result.errorCode === 200 &&
                                        result.body !== null
                                    ) {
                                        await self.$store
                                            .dispatch('changeLogin', {
                                                isLogin: true,
                                                token: result.body.token,
                                                userInfo: result.body,
                                                locale: this.$i18n.locale,
                                            })
                                            .then(() => {
                                                if (result.body.newUser) {
                                                    self.$router.push(self.localePath('/signupthankyou'))
                                                } else if (
                                                    self.redirectURL &&
                                                    self.redirectURL !== ''
                                                ) {
                                                    self.$router.push({
                                                        redirect: (window.location.href = self.redirectURL),
                                                    })
                                                } else if (this.action === 'subscribe') {
                                                    self.checkPlanParamAndRedirect()
                                                } else {
                                                    self.$router.push(self.localePath('/'))
                                                }
                                            })
                                    } else {
                                        self.$alert.showMessage({
                                            message: result.message,
                                            type: 'error',
                                        })
                                    }
                                }
                            },
                            { scope: 'email' }
                        )
                        break
                    case 'apple':
                        window.AppleID.auth.signIn()
                        break
                }
            } catch (err) {
                console.log(err)
            }
        },
        initialFacebookSignin() {
            const facebookId = this.$config.FACEBOOK_ID
            const self = this
            window.fbAsyncInit = function () {
                window.FB.init({
                    appId: facebookId,
                    cookie: true,
                    xfbml: true,
                    version: 'v16.0',
                })
                self.fabookLogout()
            }
        },
        fabookLogout() {
            try {
                if (window.FB.getAccessToken() !== null) {
                    window.FB.logout(function (response) {
                        this.$store.dispatch('logout')
                    })
                }
            } catch (err) {
                console.log(err)
            }
        },
        initialAppleSignin() {
            const appleClientId = this.$config.APPLE_CLIENT_ID
            const appleRedirectURI = this.$config.APPLE_RETURN_URI
            window.AppleID.auth.init({
                clientId: appleClientId,
                scope: 'name email',
                redirectURI: appleRedirectURI,
            })
        },
        cancel2FA() {
            this.show2FAInput = false
            this.thirdParty2FALogin = false
            this.twoFactorAuthCode = ''
            this.modelLogin.password = ''
            this.modelLogin.account = ''
            this.$refs.loginObserver.reset()
        },
        login2FA() {
            if (this.thirdParty2FALogin) {
                this.socialSignin('google')
            } else {
                this.login()
            }
        },
        checkPlanParamAndRedirect() {
            const { plan } = this.$route.query
            if (!plan) {
                return null
            }

            const [tier, period, count] = plan.split(',')
            const validTiers = ['enterprise', 'pro']
            const validPeriods = ['monthly', 'yearly']
            const validCounts = ['1', '5', '10', '20', '30', '40']

            if (
                !validTiers.includes(tier) ||
                !validPeriods.includes(period) ||
                !validCounts.includes(count)
            ) {
                console.log('invalid plan')
                this.$router.push({ path: '/' })
                return
            }
            this.$router.push({ path: '/settings/subscription', query: { plan } })
        },
    },
    head() {
        return {
            title: this.$t('title.login'),
            titleTemplate: '',
            meta: [
                {
                    hid: 'description',
                    name: 'description',
                    content: this.$t('title.loginDescr'),
                },
                {
                    vmid: 'og:title',
                    hid: 'og:title',
                    property: 'og:title',
                    content: this.$t('title.login'),
                },
                {
                    vmid: 'og:description',
                    hid: 'og:description',
                    property: 'og:description',
                    content: this.$t('title.loginDescr'),
                },
            ],
            script: [
                // Google JS
                {
                    hid: 'google',
                    src: 'https://accounts.google.com/gsi/client',
                    async: true,
                },
                // Facebook JS
                // {
                //   hid: 'facebook',
                //   src: 'https://connect.facebook.net/zh_TW/sdk.js',
                //   async: true,
                // },
                // Apple JS
                // {
                //   hid: 'apple',
                //   src: 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/zh_TW/appleid.auth.js',
                //   defer: true,
                //   callback: () => {
                //     this.initialAppleSignin()
                //   },
                // },
            ],
        }
    },
}
</script>


<style scoped lang="scss">
.container {
    max-width: 100%;
    padding: 0;
    margin: 0;
}

.upper-block {
    position: absolute;
    top: 0;
    width: 100%;
    height: 35%;
    background-color: #009138;
}

.logo-area {
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 120px;
}

.logo-area>.svg-container {
    margin: 0 auto;
    padding: 8px 0;
}

.logo-area>p {
    color: #ffffff;
    margin-top: 8px;
    font-size: 20px;
}

div.v-card.main-card {
    box-shadow: 0px 22px 60px #5973b126 !important;
    border-radius: 16px;
    width: 480px;
    padding: 40px 60px 55px 60px;
    min-height: 400px;
}

.v-tab {
    color: #575757;
    font-size: 16px;
    background-color: white;
}

.active-tab {
    font-weight: bold;
    color: #008145;
}

.social-signin-btn {
    background: #ffffff !important;
    border: 1px solid #dfe1e6;
    justify-content: center;
}

@media (max-width: 1280px) {
    ::v-deep div.v-text-field__slot>input {
        font-size: 18px;
    }
}

@media (max-width: 600px) {
    .logo-area {
        height: 25%;
        padding-bottom: 25px;
    }

    .logo-area>img {
        width: 180px;
        height: 32px;
    }

    .logo-area>p {
        margin-top: 10px;
        font-size: 16px;
    }

    div.v-card.main-card {
        padding: 20px 30px 40px 30px;
    }

    @media (min-height: 800px) {
        .empty-block {
            height: 18vh;
        }
    }
}

::v-deep div.v-input .v-input--selection-controls__ripple {
    display: none !important;
}
</style>
