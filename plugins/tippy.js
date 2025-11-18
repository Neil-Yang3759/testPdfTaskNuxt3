// plugins/vue-tippy.ts
import { defineNuxtPlugin } from '#app'
import VueTippy from 'vue-tippy'
// 引入基礎樣式 (必須，否則 Tooltip 不會顯示)
import 'tippy.js/dist/tippy.css'
// 引入額外動畫 (選用)
import 'tippy.js/animations/scale.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    directive: 'tippy', // 自定義指令名稱，預設為 v-tippy
    component: 'Tippy', // 自定義組件名稱，預設為 <tippy>
    defaultProps: {
      arrow: true,
      arrowType: 'round',
      animation: 'scale',
      placement: 'bottom',
      touch: false,
    }, // 全域預設設定
  })
})
