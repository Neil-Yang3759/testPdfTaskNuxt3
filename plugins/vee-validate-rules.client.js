import { defineRule } from 'vee-validate'
// 匯入 @vee-validate/rules 提供的所有規則
import * as rules from '@vee-validate/rules'

export default defineNuxtPlugin((_nuxtApp) => {
  // 迭代所有匯入的規則
  Object.keys(rules)
    .filter((k) => k !== 'default' && k !== 'all')
    .forEach((rule) => {
      // 逐一使用 defineRule 告訴 VeeValidate
      // 'required' 是什麼, 'email' 是什麼...
      // @ts-ignore
      defineRule(rule, rules[rule])
    })
})
