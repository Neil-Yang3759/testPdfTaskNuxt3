<template>
    <div class="bg-white py-24">
        <div class="flex flex-col items-center">
            <span class="text-9xl font-semibold text-sky-600">{{ counterStore.count }}</span>
            <div class="mt-8 flex flex-row">
                <v-btn class="" @click="counterStore.increment">
                    增加
                </v-btn>
                <v-btn class="" @click="counterStore.decrement">
                    減少
                </v-btn>
                <v-btn color="red-darken-2" @click="alertStore.showMessage({
                    message: 'asd',
                    type: 'info',
                    timeout: 10000,
                })">
                    Open Snackbar
                </v-btn>
            </div>

        </div>

    </div>

</template>

<script setup>
import { useCounterStore } from '@/stores/counter'
import { useAlertStore } from '@/stores/alert'


const counterStore = useCounterStore()
const alertStore = useAlertStore()
</script>