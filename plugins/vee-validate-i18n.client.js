// plugins/vee-validate-i18n.ts
import { configure } from 'vee-validate'
import { localize, setLocale } from '@vee-validate/i18n' // 確保 setLocale 在這裡

import en from '@vee-validate/i18n/dist/locale/en.json'
import zh_TW from '@vee-validate/i18n/dist/locale/zh_TW.json'
import zh_CN from '@vee-validate/i18n/dist/locale/zh_CN.json'
import zhTW from '~/i18n/locales/zh-TW.json'
import enUS from '~/i18n/locales/en-US.json'
import zhCN from '~/i18n/locales/zh-CN.json'

export default defineNuxtPlugin((nuxtApp) => {
  const i18n = nuxtApp.$i18n
  // 1. (關鍵) 建立一個包含 "fields" 翻譯的物件
  const customEn = {
    ...en,
    names: {
      ...en.fields,
      account: enUS.label.email.loc.source,
      password: enUS.label.password.loc.source,
      userName: enUS.label.name.loc.source,
      agreePrivacy: enUS.label.agreePrivacy.loc.source,
    },
  }

  // 2. (關鍵) 建立一個包含 "fields" 翻譯的物件
  const customZhTw = {
    ...zh_TW,
    names: {
      ...zh_TW.fields,
      account: zhTW.label.email.loc.source,
      password: zhTW.label.password.loc.source,
      userName: zhTW.label.name.loc.source,
      agreePrivacy: zhTW.label.agreePrivacy.loc.source,
    },
  }

  const customZhCn = {
    ...zh_CN,
    names: {
      ...zh_CN.fields,
      account: zhCN.label.email.loc.source,
      password: zhCN.label.password.loc.source,
      userName: zhCN.label.name.loc.source,
      agreePrivacy: zhCN.label.agreePrivacy.loc.source,
    },
  }

  // 3. 呼叫 configure 來載入 i18n 設定
  configure({
    generateMessage: localize(
      // ⚠️ 請確保 'zh-TW' 和您 @nuxtjs/i18n 的 locale code "完全" 一致
      // 例如，如果您的 locale code 是 'tw'，這裡就要改成 'tw': customZhTw
      {
        'en-US': customEn,
        'zh-TW': customZhTw,
        'zh-CN': customZhCn,
      }
    ),
  })

  // 4. (自動同步)
  watchEffect(() => {
    setLocale(i18n.locale.value)
  })
})
