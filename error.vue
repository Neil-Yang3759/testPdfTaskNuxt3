<template>
    <div style="background-image: linear-gradient(135deg, #eab308 35%, #f59e0b 100%)"
        class="flex min-h-screen items-center text-white">
        <div class="mx-auto flex flex-wrap items-center p-4">
            <div class="w-full p-4 text-center lg:w-1/2">
                <div class="text-[12rem] font-semibold">{{ error.statusCode }}</div>
            </div>
            <div class="w-full p-4 text-center lg:w-1/2 lg:text-left">
                <div class="mb-4 text-3xl font-medium">噢不！發生了一些意外 🙁</div>
                <div class="mb-8 text-lg">{{ error.message }}</div>
                <button type="button"
                    class="rounded border border-white px-4 py-2 hover:bg-gray-50 hover:bg-opacity-10 active:bg-opacity-20"
                    @click="handleError">
                    清除錯誤後回到首頁
                </button>
            </div>
        </div>

        <!-- alert -->
        <v-snackbar v-model="alertStore.show" location="top" :color="alertStore.type" :timeout="alertStore.timeout"
            rounded="lg" multi-line style="word-break: break-all;">
            <v-icon :icon="alertStore.icon" color="white" variant="text" class="mr-2"></v-icon>
            {{ alertStore.message }}

            <template v-slot:actions>
                <v-btn icon="mdi-close" color="white" variant="text" @click="alertStore.closeMessage()">
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>

<script setup>
import { useAlertStore } from '@/stores/alert'


const alertStore = useAlertStore()
defineProps({
    error: Object,
});

const handleError = () => clearError({ redirect: "/" });
</script>
