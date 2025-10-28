<template>
    <div>
        <!-- 1. 檔案上傳 -->
        <div class="mb-4 p-4 border-2 border-dashed rounded-lg bg-gray-50">
            <label for="file-upload" class="block text-sm font-medium text-gray-700 mb-2">
                請選擇一個 PDF 檔案：
            </label>
            <input id="file-upload" type="file" @change="handleFileChange" accept=".pdf"
                class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none" />
        </div>

        <!-- 2. 工具列 (僅在 PDF 載入後顯示) -->
        <div v-if="pdfDoc" class="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-100 rounded-lg">
            <div class="font-medium">工具箱:</div>
            <button @click="addSignature" class="btn-primary">
                加入簽名欄
            </button>
            <button @click="addText" class="btn-primary">
                加入文字
            </button>

            <!-- 頁碼控制 -->
            <div class="flex items-center gap-2 ml-auto">
                <button @click="prevPage" :disabled="currentPage <= 1" class="btn-secondary">
                    上一頁
                </button>
                <span class="text-sm text-gray-700">
                    第 {{ currentPage }} / {{ pageCount }} 頁
                </span>
                <button @click="nextPage" :disabled="currentPage >= pageCount" class="btn-secondary">
                    下一頁
                </button>
            </div>
        </div>

        <!-- 
      3. 畫布容器 (關鍵的堆疊) 
         我們使用 CSS position: relative 來讓兩個 canvas 疊在一起。
    -->
        <div v-show="pdfDoc" class="canvas-container relative w-full overflow-auto border border-gray-400"
            style="height: 800px;">
            <!-- 底層：PDF 渲染畫布 -->
            <canvas ref="pdfCanvasEl" class="pdf-canvas absolute top-0 left-0"></canvas>

            <!-- 頂層：Fabric.js 互動畫布 (透明) -->
            <canvas ref="fabricCanvasEl" class="fabric-canvas absolute top-0 left-0"></canvas>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// --- 核心函式庫導入 ---
// 1. Fabric.js (用於互動)
import * as fabric from 'fabric'

// 2. PDF.js (用於讀取 PDF)
// [FINAL FIX - v6] 最終修正：
// 1. 主程式庫使用現代的 ES 模組 build (具名匯入)
//    這是 Vite 唯一能正確解析的路徑。
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'

// 2. Worker 也使用 ES 模組 build (mjs)
//    這必須搭配 nuxt.config.ts 中的 vite.optimizeDeps.exclude 才能避免 #pagePromises 錯誤
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'


// --- Vue Refs ---
// DOM 元素 Refs
const pdfCanvasEl = ref(null)
const fabricCanvasEl = ref(null)

// 狀態 Refs
const pdfDoc = ref(null)         // 儲存載入的 PDF 文件
const fabricCanvas = ref(null)   // 儲存 Fabric.js 畫布實例
const currentPage = ref(1)
const pageCount = ref(0)
const isRendering = ref(false)   // 用於防止重複渲染


/**
 * 首次掛載時：設置 PDF.js 的 worker
 */
onMounted(() => {
    // [FINAL FIX - v6] 修正：使用 ES 模組 build 的 worker
    GlobalWorkerOptions.workerSrc = pdfjsWorker;
})

/**
 * 元件銷毀時：清理 Fabric.js 實例
 */
onUnmounted(() => {
    fabricCanvas.value?.dispose()
})

/**
 * 處理檔案上傳
 */
async function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file || file.type !== 'application/pdf') {
        alert('請選擇一個 PDF 檔案')
        return
    }

    // 1. 將檔案讀取為 ArrayBuffer (PDF.js 需要的格式)
    const fileReader = new FileReader()
    fileReader.readAsArrayBuffer(file)

    fileReader.onload = async function () {
        try {
            const arrayBuffer = this.result

            // 2. 使用 PDF.js 載入文件
            // [FINAL FIX - v6] 修正：使用現代 ES 模組的 getDocument
            const loadingTask = getDocument({ data: arrayBuffer })
            const doc = await loadingTask.promise

            pdfDoc.value = doc
            pageCount.value = doc.numPages
            currentPage.value = 1

            // 3. 渲染第一頁
            await renderPage(currentPage.value)

        } catch (error) {
            console.error('讀取 PDF 時發生錯誤:', error)
            alert('無法讀取此 PDF 檔案。')
        }
    }
}

/**
 * 渲染指定頁碼的 PDF 並同步 Fabric.js 畫布
 */
async function renderPage(pageNum) {
    if (!pdfDoc.value || isRendering.value) return
    isRendering.value = true

    try {
        // 1. 取得 PDF 頁面
        const page = await pdfDoc.value.getPage(pageNum)
        const scale = 1.5 // 我們可以設定一個渲染比例
        const viewport = page.getViewport({ scale })

        // --- 2. 渲染 PDF 到「底層」畫布 ---
        const pdfContext = pdfCanvasEl.value.getContext('2d')
        pdfCanvasEl.value.width = viewport.width
        pdfCanvasEl.value.height = viewport.height

        const renderContext = {
            canvasContext: pdfContext,
            viewport: viewport
        }
        await page.render(renderContext).promise

        // --- 3. 初始化/重設「頂層」Fabric.js 畫布 ---

        // 如果已有 Fabric 實例 (例如翻頁)，先清理它
        fabricCanvas.value?.dispose()

        // 設置 Fabric 畫布的 DOM 元素尺寸，使其與 PDF 畫布完全相同
        fabricCanvasEl.value.width = viewport.width
        fabricCanvasEl.value.height = viewport.height

        // 建立一個新的 Fabric 畫布實例
        fabricCanvas.value = new fabric.Canvas(fabricCanvasEl.value, {
            selection: true // 允許物件選取
        })

        // 讓 Fabric 畫布適應容器
        fabricCanvas.value.setDimensions({
            width: viewport.width,
            height: viewport.height
        })

    } catch (error) {
        console.error(`渲染第 ${pageNum} 頁時發生錯誤:`, error)
    } finally {
        isRendering.value = false
    }
}

// --- 工具列功能 ---

function addSignature() {
    if (!fabricCanvas.value) return

    // 實際應用中，這裡可能是打開一個簽名板或插入圖片
    // 作為範例，我們先加入一個看起來像簽名的文字方塊
    const sigText = new fabric.Textbox('在此簽名', {
        left: 100,
        top: 150,
        width: 200,
        fontSize: 28,
        fontFamily: 'Caveat, cursive', // 需要一個手寫風格字體
        fontStyle: 'italic',
        textAlign: 'center',
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerStyle: 'circle',
        transparentCorners: false,
        borderDashArray: [3, 3] // 虛線框
    })

    fabricCanvas.value.add(sigText)
    fabricCanvas.value.setActiveObject(sigText) // 預設選取
}

function addText() {
    if (!fabricCanvas.value) return

    const text = new fabric.Textbox('請輸入文字', {
        left: 100,
        top: 300,
        width: 250,
        fontSize: 18,
        fontFamily: 'Arial',
        borderColor: 'blue',
        cornerColor: 'blue',
        cornerStyle: 'circle',
        transparentCorners: false,
    })

    fabricCanvas.value.add(text)
    fabricCanvas.value.setActiveObject(text)
    fabricCanvas.value.renderAll()
}

// --- 頁碼控制 ---

function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--
        renderPage(currentPage.value)
    }
}

function nextPage() {
    if (currentPage.value < pageCount.value) {
        currentPage.value++
        renderPage(currentPage.value)
    }
}

</script>

<!-- 
  [重要]：
  我們需要一些 CSS 來輔助按鈕樣式和畫布堆疊。
  `scoped` 屬性確保這些樣式只會套用在這個元件上。
-->
<style scoped>
/* 畫布容器和堆疊 */
.canvas-container {
    /* 確保容器不會無限高。
    overflow: auto 會在 PDF 太大時產生滾動條。
  */
    max-height: 80vh;
    overflow: auto;
    background-color: #f0f0f0;
}

/* 這是堆疊的關鍵：
  兩個畫布都使用 absolute 定位，並放在 relative 容器中，
  它們就會完美地疊在一起。
*/
.pdf-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    /* 底層 */
}

.fabric-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    /* 頂層 (互動層) */
}


/* 簡單的按鈕樣式 */
.btn-primary {
    padding: 8px 16px;
    background-color: #3b82f6;
    /* blue-500 */
    color: white;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary:hover {
    background-color: #2563eb;
    /* blue-600 */
}

.btn-secondary {
    padding: 6px 12px;
    background-color: #ffffff;
    color: #374151;
    /* gray-700 */
    border: 1px solid #d1d5db;
    /* gray-300 */
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-secondary:hover {
    background-color: #f9fafb;
    /* gray-50 */
}

.btn-secondary:disabled {
    background-color: #f3f4f6;
    /* gray-100 */
    color: #9ca3af;
    /* gray-400 */
    cursor: not-allowed;
}

/* 為了 Caveat 手寫字體 (可選，但效果更好) */
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap');
</style>
