<template>
  <v-dialog
    v-model="messageDialogStore.show"
    overlay-opacity="0.9"
    :max-width="messageDialogStore.width"
  >
    <v-card class="rounded-lg pa-5">
      <v-card-title>
        <v-icon class="mr-1">mdi-information-outline</v-icon>
        <span style="font-weight: 700">
          {{ $t('heading.message') }}
        </span>
      </v-card-title>

      <v-card-text class="px-10 pt-5 pb-5">
        <div class="text-subtitle-1">
          {{ messageDialogStore.message }}
        </div>
      </v-card-text>
      <v-card-actions class="px-5 py-5">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          class="text-subtitle-2"
          @click="messageDialogStore.show = false"
        >
          {{ $t('button.ok') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
const messageDialogStore = useMessageDialogStore()
</script>
