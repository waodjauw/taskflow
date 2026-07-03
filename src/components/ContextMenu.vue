<template>
  <Teleport to="body">
    <div v-if="ctx.contextTaskId" class="context-menu"
      :style="{ left: ctx.contextMenuPos.x + 'px', top: ctx.contextMenuPos.y + 'px' }">
      <div class="ctx-item" @click="editTask">
        <Pencil :size="14" /> 编辑任务
      </div>
      <div class="ctx-item" @click="completeTask">
        <CheckCircle :size="14" /> {{ ctx.contextTask?.done ? '标记未完成' : '标记完成' }}
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
import { useContextMenuStore } from '../stores/contextMenuStore.js'
import { Pencil, CheckCircle, TrendingUp, Trash2 } from 'lucide-vue-next'

const store = useTaskStore()
const ctx = useContextMenuStore()
const emit = defineEmits(['edit-task', 'progress-task'])

function editTask() {
  const id = ctx.contextTaskId
  ctx.closeContextMenu()
  emit('edit-task', id)
}
function completeTask() {
  store.toggleComplete(ctx.contextTaskId)
  ctx.closeContextMenu()
}
function progressTask() {
  const id = ctx.contextTaskId
  ctx.closeContextMenu()
  emit('progress-task', id)
}
function deleteTask() {
  store.deleteTask(ctx.contextTaskId)
  ctx.closeContextMenu()
}
</script>
