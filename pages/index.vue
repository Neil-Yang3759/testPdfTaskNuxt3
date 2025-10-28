<template>

    <iframe ref="iframeRef" style="height: 100%; width: 100%" :src="currentFileUrl">
    </iframe>
</template>

<script setup>
const iframeRef = ref(null)
const currentFileUrl = ref('')
currentFileUrl.value = ''
// currentFileUrl.value = encodeURIComponent("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf")
// currentFileUrl.value = encodeURIComponent("C:/Users/neil.yang/Downloads/蒙恬2025-10-29員旅手冊.pdf")
// `libs/pdfjs/web/viewer.html?file=${currentFileUrl}`
currentFileUrl.value = "https://www-ws.gov.taipei/Download.ashx?u=LzAwMS9VcGxvYWQvNDIzL3JlbGZpbGUvNDExNzcvNzUyNDk2OS9jNTk3MDY4NC1mMWU4LTQzY2ItYTRkNC02NDE4ZGJhZDgwNGYucGRm&n=57WQ5ama5pu457SELnBkZg%3d%3d&icon=..pdf"
</script>
