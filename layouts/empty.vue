<template>
    <v-app :style="setVh">
        <v-container class="pa-0" fluid fill-height>
            <Nuxt />
        </v-container>
        <alert></alert>
        <snackbar></snackbar>
        <messageDialog></messageDialog>
        <splashScreen v-if="showLoading"></splashScreen>
    </v-app>
</template>



<script>
import alert from '~/components/alert.vue'
import snackbar from '~/components/snackbar.vue'
import splashScreen from '~/components/splashScreen.vue'

export default {
    components: {
        alert,
        snackbar,
        splashScreen,
    },
    data() {
        return {
            showLoading: true,
            dynamicVh: null,
        }
    },
    computed: {
        setVh() {
            return { '--vh': `${this.dynamicVh}px` }
        },
    },
    beforeCreate() {
        this.showLoading = true
    },
    mounted() {
        this.showLoading = false
        this.vhCheck()
        window.addEventListener('resize', this.vhCheck)
        window.addEventListener('orientationchange', this.vhCheck)
        this.$once('hook:beforeDestroy', () => {
            window.removeEventListener('resize', this.vhCheck)
            window.removeEventListener('orientationchange', this.vhCheck)
        })
        window.addEventListener('focus', (e) => {
            const publicPaths = [
                '/login',
                '/signup',
                '/verify',
                '/signupthankyou',
                '/signup-success',
                '/forget-password',
                '/reset-password',
                '/tasks/sign-task',
                '/tasks/collaborate',
                '/tasks/mobile-signpad',
                '/tasks/mobile-remove-stamp-bg',
                '/tasks/mobile-upload-image',
                '/payment-result',
                '/upload-link',
                '/preview',
                '/share-link',
                '/forms/start-form/',
                '/signin-books/start-signing-book/',
            ]
            const cookie = this.$cookies.get('PDF_JWT_TOKEN')
            const path = this.$route.path
            if (cookie === undefined) {
                this.$store.dispatch('logout')
                // 如果在不需要驗證的頁面不會導向登入頁
                if (!publicPaths.some((p) => path.startsWith(p))) {
                    this.$router.push(this.localePath('/login'))
                }
            }
        })
    },
    methods: {
        vhCheck() {
            this.dynamicVh = window.innerHeight * 0.01
            // const vh = window.innerHeight * 0.01
            // document.documentElement.style.setProperty('--vh', `${vh}px`)
            // const applicationWrap = document.querySelector('.v-application--wrap')
            // applicationWrap.style.minHeight = 'calc(var(--vh, 1vh) * 100)'
        },
    },
    head() {
        return {
            htmlAttrs: {
                lang: this.$i18n.locale,
            },
            titleTemplate: `%s | ${this.$t('title.site')}`,
            title: `${this.$t('title.site')}`,
            meta: [
                {
                    vmid: 'og:title',
                    hid: 'og:title',
                    property: 'og:title',
                    content: `${this.$store.getters.getPageTitle} | ${this.$t(
                        'title.site'
                    )}`,
                },
                {
                    vmid: 'apple-mobile-web-app-title',
                    hid: 'apple-mobile-web-app-title',
                    property: 'apple-mobile-web-app-title',
                    content: `${this.$store.getters.getPageTitle} | ${this.$t(
                        'title.site'
                    )}`,
                },
            ],
        }
    },
}
</script>

<style lang="sass">
@import assets/override.scss
</style>

<style lang="scss">
.v-application--wrap {
    min-height: calc(var(--vh, 1vh) * 100);
}
</style>