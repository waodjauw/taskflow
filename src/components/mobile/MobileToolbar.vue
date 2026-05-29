<template>
  <div class="m-toolbar">
    <div class="search-box" style="flex:1;">
      <Search :size="15" style="color:var(--text-muted);flex-shrink:0;" />
      <input type="text" v-model="search.local.value" placeholder="搜索…" />
    </div>
    <button class="m-icon-btn" @click="sheetOpen = true" aria-label="筛选">
      <SlidersHorizontal :size="18" />
      <span v-if="activeFilterCount" class="m-filter-dot">{{ activeFilterCount }}</span>
    </button>
    <button class="m-icon-btn" @click="store.toggleBatchMode()" :class="{ active: store.batchMode }" aria-label="批量">
      <CheckSquare :size="18" />
    </button>
  </div>

  <MobileFilterSheet v-model="sheetOpen" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore.js'
import { useDebouncedRef } from '../../composables/useDebouncedRef.js'
import { Search, SlidersHorizontal, CheckSquare } from 'lucide-vue-next'
import MobileFilterSheet from './MobileFilterSheet.vue'

const store = useTaskStore()
const sheetOpen = ref(false)

const search = useDebouncedRef(store.filters.search, 250)
watch(search.debounced, (v) => store.setFilter('search', v))

const activeFilterCount = computed(() => {
  let n = 0
  if (store.filters.cat) n++
  if (store.filters.cycle) n++
  if (store.filters.priority) n++
  return n
})
</script>
