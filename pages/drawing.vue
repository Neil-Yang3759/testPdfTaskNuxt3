<template>
    <div>
        <h1>我的 Fabric.js 畫板 (Nuxt 3)</h1>
        <ClientOnly>
            <FabricCanvas />

            <template #fallback>
                <p>正在載入畫布...</p>
            </template>
        </ClientOnly>

    </div>
</template>

<script setup>
// 不需要額外的 script 邏輯，除非您想和 FabricCanvas 元件互動
</script>