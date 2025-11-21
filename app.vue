<template>
  <NuxtLayout>
    <CustomLoading />
    <NuxtPage />

    <!-- alert -->
    <v-alert v-model="alertStore.show" :color="alertStore.type" :icon="alertStore.icon" border style="
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translate(-50%, 0);
            justify-content: center;
            z-index: 999999;
        ">
      {{ alertStore.message }}
      <v-icon medium class="ml-4" @click="alertStore.closeMessage()">
        mdi-close
      </v-icon>
    </v-alert>

    <!-- snackbar -->
    <v-snackbar v-model="snackbarStore.show" :timeout="snackbarStore.timeout" rounded="lg" multi-line
      style="word-break: break-all">
      <v-icon :icon="snackbarStore.icon" :color="snackbarStore.type" variant="text" class="mr-2"></v-icon>
      {{ snackbarStore.message }}

      <template v-slot:actions>
        <v-btn :color="snackbarStore.type" text @click="snackbarStore.closeMessage()">
          {{ $t('button.close') }}
        </v-btn>
      </template>
    </v-snackbar>

    <messageDialog></messageDialog>
  </NuxtLayout>
</template>

<script setup>
const alertStore = useAlertStore();
const snackbarStore = useSnackbarStore();

</script>
