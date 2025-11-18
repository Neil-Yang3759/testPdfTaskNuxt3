<script setup lang="ts">
definePageMeta({
  layout: 'default',
})
import { useWindowScroll } from '@vueuse/core'

const { x, y } = useWindowScroll({ behavior: 'smooth' })
</script>

<template>
  <div>
    <div>See scroll values in the lower right corner of the screen.</div>
    <div class="scroller" />
    <div class="float">
      <note class="mb-2"> Scroll value </note>
      x: {{ x }}<br />
      y: {{ y }}
    </div>
  </div>

  <v-btn href="/tasks/create-task">create task</v-btn>
</template>
