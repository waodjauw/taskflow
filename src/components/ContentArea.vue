<template>
  <main class="content-area">
    <AlertBanner />
    <StatsRow />
    <Toolbar />
    <BatchBar v-if="store.batchMode" />
    <TaskGrid />
  </main>
</template>

<script setup>
import { useBatchStore } from '../stores/batchStore.js'
import AlertBanner from './AlertBanner.vue'
import StatsRow from './StatsRow.vue'
import Toolbar from './Toolbar.vue'
import BatchBar from './BatchBar.vue'
import TaskGrid from './TaskGrid.vue'

const store = useBatchStore()
</script>
