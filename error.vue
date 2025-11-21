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
    </div>
</template>

<script setup>
const snackbarStore = useSnackbarStore()
const alertStore = useAlertStore()
defineProps({
    error: Object,
});

const handleError = () => clearError({ redirect: "/" });
</script>
