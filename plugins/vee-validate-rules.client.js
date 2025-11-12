// import { defineRule } from "vee-validate";
// defineRule("required", (value) => {
//   if (!value || !value.length) {
//     return "This field is required";
//   }
//   return true;
// });
// defineRule("email", (value) => {
//   // Field is empty, should pass
//   if (!value || !value.length) {
//     return true;
//   }
//   // Check if email
//   if (!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/.test(value)) {
//     return "This field must be a valid email";
//   }
//   return true;
// });

// plugins/vee-validate-rules.ts

import { defineRule } from "vee-validate";
// 匯入 @vee-validate/rules 提供的所有規則
import * as rules from "@vee-validate/rules";
// import { required, email, min } from "@vee-validate/rules";

export default defineNuxtPlugin((_nuxtApp) => {
  // 迭代所有匯入的規則
  Object.keys(rules)
    .filter((k) => k !== "default" && k !== "all")
    .forEach((rule) => {
      // 逐一使用 defineRule 告訴 VeeValidate
      // 'required' 是什麼, 'email' 是什麼...
      // @ts-ignore
      defineRule(rule, rules[rule]);
    });
});
