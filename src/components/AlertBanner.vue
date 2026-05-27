<template>
  <div>
    <div v-if="store.settings.overdueAlert && store.alertTasks.overdue.length > 0" class="alert-banner alert-critical">
      <AlertCircle :size="16" style="flex-shrink:0;" />
      <strong>{{ store.alertTasks.overdue.length }} 个任务已逾期</strong>，请尽快处理：{{ overdueNames }}
    </div>
    <div v-if="store.settings.overdueAlert && store.alertTasks.urgent.length > 0" class="alert-banner alert-warning">
      <AlertTriangle :size="16" style="flex-shrink:0;" />
      <strong>{{ store.alertTasks.urgent.length }} 个任务</strong> 将在 2 小时内到期，请关注：{{ urgentNames }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../stores/taskStore.js'
import { AlertCircle, AlertTriangle } from 'lucide-vue-next'

const store = useTaskStore()

const overdueNames = computed(() => {
  const items = store.alertTasks.overdue.slice(0, 3).map(t => '「' + t.title + '」')
  return items.join('、') + (store.alertTasks.overdue.length > 3 ? '等…' : '')
})
const urgentNames = computed(() => {
  const items = store.alertTasks.urgent.slice(0, 2).map(t => '「' + t.title + '」')
  return items.join('、')
})
</script>
