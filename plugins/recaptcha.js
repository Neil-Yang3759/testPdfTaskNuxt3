import { VueReCaptcha } from 'vue-recaptcha-v3';
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(VueReCaptcha, {
        siteKey: '6Ldl4AEsAAAAAInJNKXUodkqh7dA-ZihYBmQWAQJ',
        loaderOptions: { autoHideBadge: false, useRecaptchaNet: true, language: 'zh-TW', }
    });
});
