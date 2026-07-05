<template>
  <div class="toolbar">
    <div class="search-box">
      <Search :size="15" style="color:var(--text-muted);flex-shrink:0;" />
      <input type="text" v-model="search.local.value" placeholder="搜索任务名称或描述…" />
    </div>
    <select class="filter-select" :value="store.filters.cat" @change="store.setFilter('cat', $event.target.value)">
      <option value="">全部类别</option>
      <option v-for="cat in catStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
    </select>
    <select class="filter-select" :value="store.filters.cycle" @change="store.setFilter('cycle', $event.target.value)">
      <option value="">全部周期</option>
      <option value="today">今天</option>
      <option value="week">本周</option>
      <option value="month">本月</option>
      <option value="overdue">已逾期</option>
    </select>
    <select class="filter-select" :value="store.filters.priority" @change="store.setFilter('priority', $event.target.value)">
      <option value="">全部优先级</option>
      <option value="critical">🔴 紧急</option>
      <option value="high">🟠 高</option>
      <option value="medium">🟡 中</option>
      <option value="low">🟢 低</option>
    </select>
    <button class="btn-secondary" @click="batch.toggleBatchMode()">
      <CheckSquare :size="14" /> 批量操作
    </button>
    <button class="btn-secondary" @click="$emit('open-breakdown')" title="AI 拆解任务">
      <Sparkles :size="14" /> AI 拆解
    </button>
    <button class="btn-secondary" :class="{ active: settings.settings.layout === 'grid' }" @click="settings.setLayout('grid')" title="网格布局">
      <LayoutGrid :size="14" />
    </button>
    <button class="btn-secondary" :class="{ active: settings.settings.layout === 'list' }" @click="settings.setLayout('list')" title="列表布局">
      <List :size="14" />
    </button>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useTaskStore } from '../stores/taskStore.js'
import { useCategoryStore } from '../stores/categoryStore.js'
import { useSettingsStore } from '../stores/settingsStore.js'
import { useBatchStore } from '../stores/batchStore.js'
import { useDebouncedRef } from '../composables/useDebouncedRef.js'
import { Search, CheckSquare, LayoutGrid, List, Sparkles } from 'lucide-vue-next'

const store = useTaskStore()
const catStore = useCategoryStore()
const settings = useSettingsStore()
const batch = useBatchStore()
defineEmits(['open-breakdown'])
const search = useDebouncedRef(store.filters.search, 250)
watch(search.debounced, (v) => store.setFilter('search', v))
</script>
