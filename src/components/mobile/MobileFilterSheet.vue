<template>
  <Teleport to="body">
    <Transition name="m-sheet">
      <div v-if="modelValue" class="m-sheet-root" @click.self="close">
        <div class="m-sheet-panel" @click.stop>
          <div class="m-sheet-handle"></div>
          <div class="m-sheet-header">
            <div class="m-sheet-title">筛选与显示</div>
            <button class="m-icon-btn" @click="close" aria-label="关闭">
              <X :size="20" />
            </button>
          </div>
          <div class="m-sheet-body">
            <div class="form-group">
              <label class="form-label">类别</label>
              <select class="form-select" :value="store.filters.cat" @change="store.setFilter('cat', $event.target.value)">
                <option value="">全部类别</option>
                <option v-for="cat in catStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">周期</label>
              <select class="form-select" :value="store.filters.cycle" @change="store.setFilter('cycle', $event.target.value)">
                <option value="">全部周期</option>
                <option value="today">今天</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="overdue">已逾期</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">优先级</label>
              <select class="form-select" :value="store.filters.priority" @change="store.setFilter('priority', $event.target.value)">
                <option value="">全部优先级</option>
                <option value="critical">🔴 紧急</option>
                <option value="high">🟠 高</option>
                <option value="medium">🟡 中</option>
                <option value="low">🟢 低</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">布局</label>
              <div class="layout-options">
                <div class="layout-option" :class="{ active: settings.settings.layout === 'grid' }" @click="settings.setLayout('grid')">
                  <LayoutGrid :size="14" /> 网格
                </div>
                <div class="layout-option" :class="{ active: settings.settings.layout === 'list' }" @click="settings.setLayout('list')">
                  <List :size="14" /> 列表
                </div>
              </div>
            </div>
          </div>
          <div class="m-sheet-footer">
            <button class="btn-secondary" style="flex:1" @click="resetFilters">重置</button>
            <button class="btn-primary" style="flex:1" @click="close">完成</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useTaskStore } from '../../stores/taskStore.js'
import { useCategoryStore } from '../../stores/categoryStore.js'
import { useSettingsStore } from '../../stores/settingsStore.js'
import { X, LayoutGrid, List } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])
const store = useTaskStore()
const catStore = useCategoryStore()
const settings = useSettingsStore()

function close() { emit('update:modelValue', false) }
function resetFilters() {
  store.setFilter('cat', '')
  store.setFilter('cycle', '')
  store.setFilter('priority', '')
}
</script>
