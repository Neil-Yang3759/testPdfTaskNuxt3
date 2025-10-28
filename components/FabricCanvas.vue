<template>
    <div>
        <!-- 1. 新增一個按鈕來觸發功能 -->
        <button @click="addShape" style="
        background-color: #007aff; 
        color: white; 
        border: none; 
        padding: 10px 15px; 
        border-radius: 8px; 
        cursor: pointer; 
        margin-bottom: 10px;
        font-weight: bold;
      ">
            新增一個圖形 (Add Shape)
        </button>

        <!-- 2. 這是我們的畫布 -->
        <canvas ref="canvasEl" width="800" height="600" style="border: 1px solid #ccc; border-radius: 8px;"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
// ✅ 使用命名空間匯入 (namespace import)
import * as fabric from 'fabric'

// 建立一個 ref 來獲取 canvas DOM 元素
const canvasEl = ref(null)

// 宣告一個變數來存放 fabric 的實例
let canvas = null

// onMounted 確保程式碼只在客戶端執行
onMounted(() => {
    if (canvasEl.value) {
        // 3. 初始化畫布
        // 注意：因為我們是 namespace import，所以要用 fabric.Canvas
        canvas = new fabric.Canvas(canvasEl.value, {
            selection: true // 啟用畫布上的框選功能
        })

        // --- 在這裡添加您的 Fabric.js 邏輯 ---
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'red',
            width: 200,
            height: 200,
            angle: 45,

            // 4. 明確啟用物件的互動功能
            selectable: true,  // 可被選取
            hasControls: true, // 顯示控制項 (縮放、旋轉)
            hasBorders: true,  // 顯示邊框
        })

        canvas.add(rect)
        canvas.renderAll()
    }
})

// onUnmounted 清理實例
onUnmounted(() => {
    if (canvas) {
        canvas.dispose()
        canvas = null
    }
})

// 5. 這是我們的「功能」：一個可以被 Vue 按鈕呼叫的函式
const addShape = () => {
    // 確保 canvas 已經被初始化
    if (!canvas) {
        console.warn('Canvas is not ready yet.')
        return
    }

    // 隨機產生一個圓形
    const circle = new fabric.Circle({
        radius: Math.random() * 50 + 20, // 隨機半徑
        fill: 'green',
        left: Math.random() * 700, // 隨機 X 座標
        top: Math.random() * 500,  // 隨機 Y 座標
        selectable: true,
        hasControls: true,
        hasBorders: true,
    })

    canvas.add(circle)
    canvas.renderAll() // 記得要重新渲染
}

// 選擇性：如果您需要讓父元件也能呼叫 addShape
defineExpose({
    addShape
})
</script>