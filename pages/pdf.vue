<template>
    <div class="min-h-screen bg-gray-100 p-4 sm:p-8 font-sans">
        <div class="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

            <!-- 標題 -->
            <header class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-md">
                <h1 class="text-3xl font-bold">Nuxt 3 PDF 預覽器</h1>
                <p class="text-blue-100 mt-1">使用 `pdfjs-dist` 進行客戶端渲染</p>
            </header>

            <!-- 上傳區域 -->
            <div class="p-6 border-b border-gray-200">
                <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">
                    請選擇一個 PDF 檔案：
                </label>
                <input id="file-upload" type="file" @change="handleFileUpload" accept="application/pdf" class="block w-full max-w-md text-sm text-gray-600
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 transition-colors duration-200" />
            </div>

            <!-- 控制項 & 狀態顯示 -->
            <div v-if="pdfDoc || loading || pdfError" class="p-6 bg-gray-50 border-b border-gray-200">

                <!-- 載入中 -->
                <div v-if="loading" class="flex items-center justify-center text-blue-600">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span>正在載入 PDF 中...</span>
                </div>

                <!-- 錯誤訊息 -->
                <div v-if="pdfError" class="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                    <strong>錯誤：</strong> {{ pdfError }}
                </div>

                <!-- 分頁控制 -->
                <div v-if="pdfDoc" class="flex items-center justify-center space-x-4">
                    <button @click="onPrevPage" :disabled="isPrevDisabled"
                        class="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        上一頁
                    </button>
                    <span class="text-gray-700 text-sm font-medium">
                        第 {{ pageNum }} / {{ numPages }} 頁
                    </span>
                    <button @click="onNextPage" :disabled="isNextDisabled"
                        class="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        下一頁
                    </button>
                </div>
            </div>

            <!-- Canvas 預覽區域 -->
            <div v-show="pdfDoc" class="p-6 bg-gray-200 overflow-x-auto text-center">
                <canvas ref="pdfCanvas" class="border border-gray-400 shadow-lg mx-auto">
                    您的瀏覽器不支援 Canvas
                </canvas>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, computed } from 'vue';

// --- 狀態定義 (State) ---

// pdfjs-dist 模組 (使用 shallowRef 優化)
const pdfjsLib = shallowRef(null);
// PDF 文件實例 (使用 shallowRef 優化)
const pdfDoc = shallowRef(null);
// Canvas DOM 元素
const pdfCanvas = ref(null);

// 頁碼狀態
const pageNum = ref(1);
const numPages = ref(0);

// 狀態旗標
const loading = ref(false); // 是否正在載入檔案
const pdfError = ref(null); // 錯誤訊息
const pageRendering = ref(false); // 是否正在渲染頁面
const pageNumPending = ref(null); // 等待渲染的頁碼
const scale = ref(1.5); // 渲染比例

// --- computed 屬性 ---

// 上一頁按鈕是否禁用
const isPrevDisabled = computed(() => {
    return !pdfDoc.value || pageNum.value <= 1;
});

// 下一頁按鈕是否禁用
const isNextDisabled = computed(() => {
    return !pdfDoc.value || pageNum.value >= numPages.value;
});

// --- 生命週期 (Lifecycle) ---

onMounted(async () => {
    try {
        // 1. 只在客戶端動態匯入 pdfjs-dist
        const pdfjsModule = await import('pdfjs-dist');
        pdfjsLib.value = pdfjsModule;

        // 2. 設定 worker 檔案的路徑
        // 使用 import.meta.url 確保在 Nuxt/Vite 中能找到正確的 public 路徑
        const workerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url);
        pdfjsLib.value.GlobalWorkerOptions.workerSrc = workerUrl.href;

    } catch (error) {
        console.error('載入 pdfjs-dist 失敗:', error);
        pdfError.value = '無法載入 PDF 渲染核心。請重新整理頁面。';
    }
});

// --- 核心方法 (Methods) ---

/**
 * 處理檔案上傳事件
 * @param {Event} event - 檔案輸入事件
 */
const handleFileUpload = async (event) => {
    if (!pdfjsLib.value) {
        pdfError.value = 'PDF 函式庫尚未載入，請稍後再試。';
        return;
    }

    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
        pdfError.value = '請選擇一個有效的 PDF 檔案。';
        return;
    }

    // 重設狀態
    pdfError.value = null;
    loading.value = true;
    pdfDoc.value = null;
    pageNum.value = 1;
    numPages.value = 0;

    try {
        const arrayBuffer = await file.arrayBuffer();

        // 載入 PDF 文件
        const loadingTask = pdfjsLib.value.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        pdfDoc.value = pdf;
        numPages.value = pdf.numPages;

        // 載入完成後，渲染第一頁
        await renderPage(pageNum.value);

    } catch (error) {
        console.error('載入 PDF 失敗:', error);
        let message = error.message || '未知的錯誤';
        if (message.includes('PasswordException')) {
            message = '此 PDF 檔案受密碼保護，無法預覽。';
        } else if (message.includes('InvalidPDFException')) {
            message = '無效的 PDF 檔案結構。';
        }
        pdfError.value = `載入 PDF 失敗：${message}`;
    } finally {
        loading.value = false;
    }
};

/**
 * 渲染指定頁碼的 PDF
 * @param {number} num - 頁碼
 */
const renderPage = async (num) => {
    if (!pdfDoc.value || num < 1 || num > numPages.value) {
        return; // 確保 pdfDoc 已載入且頁碼有效
    }

    pageRendering.value = true;

    try {
        // 取得 PDF 頁面
        const page = await pdfDoc.value.getPage(num);

        // 取得 viewport
        const viewport = page.getViewport({ scale: scale.value });

        // 準備 Canvas
        const canvas = pdfCanvas.value;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // 渲染任務
        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

    } catch (error) {
        console.error(`渲染第 ${num} 頁失敗:`, error);
        pdfError.value = `渲染第 ${num} 頁時發生錯誤。`;
    } finally {
        pageRendering.value = false;

        // 如果在渲染過程中，有新的頁碼在等待，立即渲染它
        if (pageNumPending.value !== null) {
            const pendingPage = pageNumPending.value;
            pageNumPending.value = null;
            renderPage(pendingPage);
        }
    }
};

/**
 * 處理分頁請求 (加入佇列機制)
 * @param {number} num - 目標頁碼
 */
const queueRenderPage = (num) => {
    if (pageRendering.value) {
        // 如果正在渲染，將請求放入佇列
        pageNumPending.value = num;
    } else {
        // 否則，直接渲染
        renderPage(num);
    }
};

/**
 * 前往上一頁
 */
const onPrevPage = () => {
    if (isPrevDisabled.value) return;
    pageNum.value--;
    queueRenderPage(pageNum.value);
};

/**
 * 前往下一頁
 */
const onNextPage = () => {
    if (isNextDisabled.value) return;
    pageNum.value++;
    queueRenderPage(pageNum.value);
};

</script>

<style>
/* 可以在此處添加額外的自訂 CSS (如果需要) */
/* Tailwind 已處理大部分樣式 */
</style>
