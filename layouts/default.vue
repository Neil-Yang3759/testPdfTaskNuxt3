<template>
    <!-- :style="setVh" -->
    <v-app dark>
        <slot />

        <v-snackbar v-model="alertStore.show" location="top" :color="alertStore.type" :timeout="alertStore.timeout"
            rounded="lg" multi-line>
            {{ alertStore.message }}

            <template v-slot:actions>
                <v-btn icon="mdi-close" color="white" variant="text" @click="alertStore.closeMessage()">
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script setup>
import { useAlertStore } from '@/stores/alert'


const alertStore = useAlertStore()




const setVh = computed(() => {
    return {
        '--vh': window.innerHeight * 0.01 + 'px'
    }
})
</script>