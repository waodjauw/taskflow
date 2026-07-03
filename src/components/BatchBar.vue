<template>
  <div class="batch-bar">
    <CheckSquare :size="16" style="color:var(--accent);" />
    <span class="batch-count">已选择 {{ store.selectedTasks.length }} 项</span>
    <button class="btn-secondary" @click="store.batchSelectAll()">全选</button>
    <button class="btn-secondary" @click="store.batchMarkDone(true)">标记完成</button>
    <button class="btn-secondary" @click="store.batchMarkDone(false)">标记未完成</button>
    <button class="btn-danger" @click="store.batchDelete()">
      <Trash2 :size="13" /> 批量删除
    </button>
    <button class="btn-secondary" @click="cancelBatch">取消</button>
  </div>
</template>

<script setup>
import { useBatchStore } from '../stores/batchStore.js'
import { CheckSquare, Trash2 } from 'lucide-vue-next'

const store = useBatchStore()

function cancelBatch() {
  store.batchMode = false
  store.selectedTasks = []
}
</script>
