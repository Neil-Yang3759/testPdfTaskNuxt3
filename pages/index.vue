<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const alertStore = useAlertStore()
const snackbarStore = useSnackbarStore()
</script>

<template>
  <v-btn href="/tasks/create-task">create task</v-btn>
  <v-btn href="/drawing">drawing</v-btn>

  <v-btn
    @click="
      alertStore.showAlert({
        message: t('message.createTask'),
        type: 'error',
      })
    "
    >show alert</v-btn
  >
  <v-btn
    @click="
      snackbarStore.showSnackbar({
        message: t('message.createTask'),
        type: 'warning',
      })
    "
    >show snackbar</v-btn
  >
</template>
