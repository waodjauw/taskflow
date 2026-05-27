<template>
  <Teleport to="body">
    <div v-if="store.contextTaskId" class="context-menu"
      :style="{ left: store.contextMenuPos.x + 'px', top: store.contextMenuPos.y + 'px' }">
      <div class="ctx-item" @click="editTask">
        <Pencil :size="14" /> 编辑任务
      </div>
      <div class="ctx-item" @click="completeTask">
        <CheckCircle :size="14" /> {{ store.contextTask?.done ? '标记未完成' : '标记完成' }}
      </div>
      <div class="ctx-item" @click="progressTask">
        <TrendingUp :size="14" /> 更新进度
      </div>
      <div class="ctx-divider"></div>
      <div class="ctx-item danger" @click="deleteTask">
        <Trash2 :size="14" /> 删除任务
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore.js'
import { Pencil, CheckCircle, TrendingUp, Trash2 } from 'lucide-vue-next'

const store = useTaskStore()
const emit = defineEmits(['edit-task', 'progress-task'])

function editTask() {
  const id = store.contextTaskId
  store.closeContextMenu()
  emit('edit-task', id)
}
function completeTask() {
  store.toggleComplete(store.contextTaskId)
  store.closeContextMenu()
}
function progressTask() {
  const id = store.contextTaskId
  store.closeContextMenu()
  emit('progress-task', id)
}
function deleteTask() {
  store.deleteTask(store.contextTaskId)
  store.closeContextMenu()
}
</script>
