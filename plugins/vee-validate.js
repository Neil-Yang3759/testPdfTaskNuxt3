import { defineRule, configure } from 'vee-validate';
import { required, email, min, confirmed } from '@vee-validate/rules';
import { localize, setLocale } from '@vee-validate/i18n';
import zhTW from '@vee-validate/i18n/dist/locale/zh_TW.json'; // 匯入中文錯誤訊息
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
    // 1. 定義你要使用的全域規則
    defineRule('required', required);
    defineRule('email', email);
    defineRule('min', min);
    defineRule('confirmed', confirmed); // 用於「確認密碼」

    // 2. 設定 i18n 本地化 (讓錯誤訊息顯示中文)
    configure({
        generateMessage: localize('zh_TW', zhTW), // 載入中文訊息
        validateOnInput: true, // (可選) 讓使用者一邊輸入就一邊驗證
    });

    // 3. 設定預設語系
    setLocale('zh_TW');
});