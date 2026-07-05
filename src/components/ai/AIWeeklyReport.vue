<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div style="width:36px;height:36px;background:var(--accent-light);border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--accent);">
            <FileText :size="18" />
          </div>
          <div class="modal-title">AI 本周周报</div>
          <div class="modal-close" @click="close"><X :size="16" /></div>
        </div>
        <div class="modal-body">
          <div v-if="error" style="text-align:center;padding:20px 0;">
            <div style="color:#ef4444;font-size:13px;margin-bottom:10px;">{{ error }}</div>
            <button class="btn-secondary" @click="startGenerate">重新生成</button>
          </div>

          <div class="report-content" ref="reportEl">
            <div v-if="loading && !content" style="text-align:center;padding:32px 0;">
              <Loader :size="28" class="spin" style="color:var(--accent);margin-bottom:12px;" />
              <div style="color:var(--text-muted);font-size:13px;">正在生成周报…</div>
            </div>
            <div v-html="renderedContent" v-if="content"></div>
            <span v-if="streaming" class="report-cursor"></span>
          </div>
        </div>
        <div class="modal-footer" v-if="content && !streaming">
          <button class="btn-secondary" @click="copyReport">
            <Copy :size="14" /> 复制
          </button>
          <button class="btn-secondary" @click="startGenerate">
            <RefreshCw :size="14" /> 重新生成
          </button>
          <button class="btn-primary" @click="close">
            <Check :size="14" /> 完成
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useTaskStore } from '../../stores/taskStore.js'
import { useClaudeAI } from '../../composables/useClaudeAI.js'
import { isThisWeek } from '../../utils/helpers.js'
import { marked } from 'marked'
import { FileText, X, Check, Copy, RefreshCw, Loader } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const taskStore = useTaskStore()
const { streamWeeklyReport } = useClaudeAI()

const content = ref('')
const streaming = ref(false)
const loading = ref(false)
const error = ref('')
const reportEl = ref(null)
let cancelStream = null

const renderedContent = computed(() => {
  if (!content.value) return ''
  return marked.parse(content.value)
})

watch(() => props.modelValue, (val) => {
  if (val) {
    startGenerate()
  } else {
    if (cancelStream) cancelStream()
    streaming.value = false
  }
})

function close() {
  if (cancelStream) cancelStream()
  emit('update:modelValue', false)
}

function startGenerate() {
  content.value = ''
  error.value = ''
  streaming.value = true
  loading.value = true

  const weekTasks = taskStore.tasks.filter(t => isThisWeek(t.deadline))
  const allTasks = taskStore.tasks
  const stats = {
    total: weekTasks.length,
    done: weekTasks.filter(t => t.done).length,
    rate: weekTasks.length ? Math.round(weekTasks.filter(t => t.done).length / weekTasks.length * 100) : 0,
    overdue: allTasks.filter(t => !t.done && t.deadline && new Date(t.deadline) < new Date()).length,
  }

  cancelStream = streamWeeklyReport(allTasks, stats, {
    onChunk(chunk) {
      loading.value = false
      content.value += chunk
      nextTick(() => {
        if (reportEl.value) {
          reportEl.value.scrollTop = reportEl.value.scrollHeight
        }
      })
    },
    onDone() {
      streaming.value = false
      loading.value = false
    },
    onError(msg) {
      error.value = msg
      streaming.value = false
      loading.value = false
    },
  })
}

async function copyReport() {
  try {
    await navigator.clipboard.writeText(content.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = content.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}
</script>
