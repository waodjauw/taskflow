<template>
  <div class="tasks-container">
    <div :class="settings.settings.layout === 'list' ? 'task-list' : 'task-grid'">
      <template v-if="store.filteredTasks.length === 0">
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="empty-icon"><Inbox :size="28" /></div>
          <div class="empty-title">暂无任务</div>
          <div class="empty-sub">当前筛选条件下没有找到任务，点击「新建任务」开始添加</div>
        </div>
      </template>
      <TaskCard
        v-for="task in store.filteredTasks"
        :key="task.id"
        :task="task"
        :is-list-view="settings.settings.layout === 'list'"
        @toggle-complete="store.toggleComplete"
        @toggle-select="batch.toggleSelectTask"
        @open-context="openContext"
      />
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore.js'
import { useSettingsStore } from '../stores/settingsStore.js'
import { useBatchStore } from '../stores/batchStore.js'
import { useContextMenuStore } from '../stores/contextMenuStore.js'
import TaskCard from './TaskCard.vue'
import { Inbox } from 'lucide-vue-next'

const store = useTaskStore()
const settings = useSettingsStore()
const batch = useBatchStore()
const ctx = useContextMenuStore()

function openContext(taskId, x, y) {
  ctx.openContextMenu(taskId, x, y)
}
</script>
