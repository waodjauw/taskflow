<template>
  <div
    class="task-card"
    :class="[
      'priority-' + task.priority,
      { completed: task.done, selected: isSelected, 'list-view': isListView }
    ]"
    :style="cardPadding"
    @contextmenu.prevent="onContextMenu"
    @touchstart.passive="onTouchStart"
    @touchend="onTouchEnd"
    @touchmove="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <!-- List View -->
    <template v-if="isListView">
      <div v-if="batchMode" class="task-checkbox" :class="{ checked: isSelected }" @click.stop="$emit('toggle-select', task.id)">
        <Check v-if="isSelected" :size="10" color="#fff" />
      </div>
      <div v-else class="task-checkbox" :class="{ checked: task.done }" @click.stop="$emit('toggle-complete', task.id)">
        <Check v-if="task.done" :size="10" color="#fff" />
      </div>
      <div class="list-main">
        <div class="task-title">{{ task.title }}</div>
      </div>
      <div class="task-meta" style="margin-bottom:0;">
        <span class="tag tag-cat" :style="catTagStyle">{{ catName }}</span>
        <span class="tag" :class="priorityTagClass">{{ priorityLabel }}</span>
        <span v-if="task.deadline" class="tag tag-deadline" :class="{ overdue: isOverdue }">
          <AlertCircle v-if="isOverdue" :size="10" /> <Clock v-else :size="10" />
          {{ isOverdue ? '已逾期' : fmtDeadline }}
        </span>
        <span v-if="countdownText" :class="countdownClass">
          <Timer :size="10" />{{ countdownText }}
        </span>
        <span v-if="task.cycle && task.cycle !== 'none'" class="tag" style="background:var(--bg-primary);color:var(--text-muted);border:1px solid var(--border-color);">
          <Repeat :size="10" /> {{ cycleLabel }}
        </span>
      </div>
      <div class="list-right">
        <div v-if="progressDisplay !== 'pct'" class="task-progress-row" style="margin-bottom:0;">
          <div class="task-progress-bar"><div class="task-progress-fill" :style="{ width: (task.progress || 0) + '%' }"></div></div>
          <span v-if="progressDisplay === 'both'" class="task-progress-pct">{{ task.progress || 0 }}%</span>
        </div>
        <span v-if="progressDisplay === 'pct'" class="task-progress-pct">{{ task.progress || 0 }}%</span>
        <button class="task-more" @click.stop="onMoreClick">
          <MoreHorizontal :size="15" />
        </button>
      </div>
    </template>

    <!-- Grid View -->
    <template v-else>
      <div class="task-card-header">
        <div v-if="batchMode" class="task-checkbox" :class="{ checked: isSelected }" @click.stop="$emit('toggle-select', task.id)">
          <Check v-if="isSelected" :size="10" color="#fff" />
        </div>
        <div v-else class="task-checkbox" :class="{ checked: task.done }" @click.stop="$emit('toggle-complete', task.id)">
          <Check v-if="task.done" :size="10" color="#fff" />
        </div>
        <span class="task-title">{{ task.title }}</span>
        <button class="task-more" @click.stop="onMoreClick">
          <MoreHorizontal :size="15" />
        </button>
      </div>
      <div v-if="task.desc" class="task-desc">{{ task.desc }}</div>
      <div class="task-meta">
        <span class="tag tag-cat" :style="catTagStyle">{{ catName }}</span>
        <span class="tag" :class="priorityTagClass">{{ priorityLabel }}</span>
        <span v-if="task.deadline" class="tag tag-deadline" :class="{ overdue: isOverdue }">
          <AlertCircle v-if="isOverdue" :size="10" /> <Clock v-else :size="10" />
          {{ isOverdue ? '已逾期' : fmtDeadline }}
        </span>
        <span v-if="task.cycle && task.cycle !== 'none'" class="tag" style="background:var(--bg-primary);color:var(--text-muted);border:1px solid var(--border-color);">
          <Repeat :size="10" /> {{ cycleLabel }}
        </span>
      </div>
      <div v-if="countdownText" style="margin-bottom:8px;">
        <span :class="countdownClass"><Timer :size="10" />{{ countdownText }}</span>
      </div>
      <!-- Progress -->
      <template v-if="progressDisplay !== 'pct'">
        <div class="task-progress-row">
          <div class="task-progress-bar"><div class="task-progress-fill" :style="{ width: (task.progress || 0) + '%' }"></div></div>
          <span v-if="progressDisplay === 'both'" class="task-progress-pct">{{ task.progress || 0 }}%</span>
        </div>
      </template>
      <div v-if="progressDisplay === 'pct'" class="task-progress-row">
        <span class="task-progress-pct">{{ task.progress || 0 }}%</span>
      </div>
      <div class="task-footer">
        <div class="task-assignee">
          <CalendarCheck :size="12" />
          {{ task.deadline ? fmtDeadline : '无截止' }}
        </div>
        <span v-if="task.done" class="tag" style="background:#f0fdf4;color:#16a34a;font-size:10px;">✓ 已完成</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../stores/taskStore.js'
import { useCategoryStore } from '../stores/categoryStore.js'
import { useBatchStore } from '../stores/batchStore.js'
import { useSettingsStore } from '../stores/settingsStore.js'
import { formatDeadline, getPriorityLabel, getPriorityTagClass, isOverdue as checkOverdue } from '../utils/helpers.js'
import { useCountdown } from '../composables/useCountdown.js'
import { Check, MoreHorizontal, AlertCircle, Clock, Timer, Repeat, CalendarCheck } from 'lucide-vue-next'

const props = defineProps({
  task: { type: Object, required: true },
  isListView: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle-complete', 'toggle-select', 'open-context'])

const store = useTaskStore()
const catStore = useCategoryStore()
const batch = useBatchStore()
const settings = useSettingsStore()

const isSelected = computed(() => batch.selectedTasks.includes(props.task.id))
const batchMode = computed(() => batch.batchMode)
const progressDisplay = computed(() => settings.settings.progressDisplay)
const isOverdue = computed(() => checkOverdue(props.task))

const deadlineRef = computed(() => props.task.done ? null : props.task.deadline)
const { countdownText, countdownClass } = useCountdown(deadlineRef)

const catName = computed(() => {
  const cat = catStore.categories.find(c => c.id === props.task.cat)
  return cat ? cat.name : '未分类'
})
const catTagStyle = computed(() => {
  const cat = catStore.categories.find(c => c.id === props.task.cat)
  const color = cat ? cat.color : '#94a3b8'
  return { background: color + '22', color }
})
const priorityLabel = computed(() => getPriorityLabel(props.task.priority))
const priorityTagClass = computed(() => getPriorityTagClass(props.task.priority))
const fmtDeadline = computed(() => formatDeadline(props.task.deadline))
const cycleLabel = computed(() => ({ daily: '每日', weekly: '每周', monthly: '每月' })[props.task.cycle] || props.task.cycle)

const cardPadding = computed(() => {
  if (settings.settings.cardStyle === 'compact') return { padding: '10px 12px' }
  if (settings.settings.cardStyle === 'spacious') return { padding: '20px' }
  return {}
})

function onMoreClick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  emit('open-context', props.task.id, rect.left - 100, rect.bottom + 4)
}

function onContextMenu(e) {
  emit('open-context', props.task.id, e.clientX, e.clientY)
}

let longPressTimer = null
let longPressFired = false
function onTouchStart(e) {
  longPressFired = false
  if (longPressTimer) clearTimeout(longPressTimer)
  const touch = e.touches[0]
  const x = touch.clientX
  const y = touch.clientY
  longPressTimer = setTimeout(() => {
    longPressFired = true
    emit('open-context', props.task.id, x, y)
    if (navigator.vibrate) navigator.vibrate(30)
  }, 500)
}
function onTouchEnd() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}
</script>
