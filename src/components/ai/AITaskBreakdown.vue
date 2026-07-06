<template>
  <Teleport to="body">
    <div v-show="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div style="width:36px;height:36px;background:var(--accent-light);border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--accent);">
            <Sparkles :size="18" />
          </div>
          <div class="modal-title">AI 任务拆解</div>
          <div class="modal-close" @click="close"><X :size="16" /></div>
        </div>
        <div class="modal-body">
          <div v-if="!results.length && !loading && !error" class="form-group">
            <label class="form-label">描述你的大目标</label>
            <textarea class="form-textarea" v-model="goal" placeholder="例如：准备下周五的技术分享、策划部门团建活动…" rows="2"></textarea>
            <button class="btn-primary" @click="doBreakdown" :disabled="!goal.trim()" style="margin-top:10px;display:flex;align-items:center;gap:6px;">
              <Sparkles :size="14" /> 开始拆解
            </button>
          </div>

          <div v-if="loading" style="text-align:center;padding:32px 0;">
            <Loader :size="28" class="spin" style="color:var(--accent);margin-bottom:12px;" />
            <div style="color:var(--text-muted);font-size:13px;">AI 正在拆解任务…</div>
          </div>

          <div v-if="error" style="text-align:center;padding:20px 0;">
            <div style="color:#ef4444;font-size:13px;margin-bottom:10px;">{{ error }}</div>
            <button class="btn-secondary" @click="error = ''; results = []">重新输入</button>
          </div>

          <div v-if="results.length && !loading">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">
              已拆解为 {{ results.length }} 个子任务，可编辑后选择添加
            </div>
            <div class="breakdown-list">
              <div v-for="(item, i) in results" :key="i" class="breakdown-item" :class="{ selected: item._selected !== false }">
                <input type="checkbox" v-model="item._selected" style="flex-shrink:0;" />
                <div class="breakdown-item-main">
                  <input type="text" class="form-input" v-model="item.title" style="margin-bottom:4px;font-size:13px;" />
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <select class="filter-select" v-model="item.priority" style="font-size:11px;padding:2px 6px;">
                      <option value="medium">🟡 中</option>
                      <option value="critical">🔴 紧急</option>
                      <option value="high">🟠 高</option>
                      <option value="low">🟢 低</option>
                    </select>
                    <select class="filter-select" v-model="item.cat" style="font-size:11px;padding:2px 6px;">
                      <option v-for="cat in catStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                  </div>
                </div>
                <button class="m-icon-btn" @click="results.splice(i, 1)" style="flex-shrink:0;color:var(--text-muted);">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="results.length && !loading">
          <button class="btn-secondary" @click="close">取消</button>
          <button class="btn-primary" @click="addAll">
            <Check :size="14" /> 添加选中任务 ({{ selectedCount }})
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore.js'
import { useCategoryStore } from '../../stores/categoryStore.js'
import { useClaudeAI } from '../../composables/useClaudeAI.js'
import { toastService } from '../../composables/useToast.js'
import { Sparkles, X, Check, Loader, Trash2 } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const taskStore = useTaskStore()
const catStore = useCategoryStore()
const { breakdownGoal } = useClaudeAI()

const goal = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')

const selectedCount = computed(() => results.value.filter(r => r._selected !== false).length)

function close() {
  emit('update:modelValue', false)
  goal.value = ''
  results.value = []
  loading.value = false
  error.value = ''
}

async function doBreakdown() {
  if (!goal.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const existingTitles = taskStore.tasks.map(t => t.title)
    const items = await breakdownGoal(goal.value, existingTitles)
    results.value = (items || []).map(item => ({
      ...item,
      deadline: item.deadline || '',
      cycle: item.cycle || 'none',
      progress: 0,
      _selected: true,
    }))
    if (!results.value.length) throw new Error('AI 未返回有效的子任务')
  } catch (e) {
    error.value = e.message || '拆解失败，请重试'
  } finally {
    loading.value = false
  }
}

function addAll() {
  const selected = results.value.filter(r => r._selected !== false)
  if (!selected.length) {
    toastService.showToast('请至少选择一个任务', 'warn')
    return
  }
  const defaultCat = catStore.categories[0]?.id || 'work'
  selected.forEach(item => {
    taskStore.addTask({
      title: item.title,
      desc: item.desc || '',
      cat: item.cat && catStore.categories.find(c => c.id === item.cat) ? item.cat : defaultCat,
      priority: ['critical', 'high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
      deadline: item.deadline || '',
      cycle: item.cycle || 'none',
      progress: item.progress || 0,
    })
  })
  toastService.showToast(`已添加 ${selected.length} 个任务`, 'success')
  close()
}
</script>
