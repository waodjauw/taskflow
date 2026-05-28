<template>
  <div class="tasks-container">
    <div class="m-task-grid">
      <template v-if="store.filteredTasks.length === 0">
        <div class="empty-state">
          <div class="empty-icon"><Inbox :size="28" /></div>
          <div class="empty-title">暂无任务</div>
          <div class="empty-sub">当前筛选条件下没有找到任务，点击右上角「+」开始添加</div>
        </div>
      </template>
      <TaskCard
        v-for="task in store.filteredTasks"
        :key="task.id"
        :task="task"
        :is-list-view="store.settings.layout === 'list'"
        @toggle-complete="store.toggleComplete"
        @toggle-select="store.toggleSelectTask"
        @open-context="openContext"
      />
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '../../stores/taskStore.js'
import TaskCard from '../TaskCard.vue'
import { Inbox } from 'lucide-vue-next'

const store = useTaskStore()

function openContext(taskId, x, y) {
  store.openContextMenu(taskId, x, y)
}
</script>
