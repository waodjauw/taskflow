<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="modal-box">
        <div class="modal-header">
          <div style="width:36px;height:36px;background:var(--accent-light);border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--accent);">
            <PlusCircle :size="18" />
          </div>
          <div class="modal-title">{{ taskId ? '编辑任务' : '新建任务' }}</div>
          <div class="modal-close" @click="$emit('update:modelValue', false)">
            <X :size="16" />
          </div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">任务标题 *</label>
            <input type="text" class="form-input" v-model="form.title" @input="checkDup" placeholder="输入任务标题…" maxlength="80" />
            <div v-if="showDupWarning" class="dup-warning">⚠️ 相同日期已存在同名任务，请修改标题或日期</div>
            <div class="form-hint">最多 80 字符，同一日期内不可重复</div>
          </div>
          <div class="form-group">
            <label class="form-label">描述</label>
            <textarea class="form-textarea" v-model="form.desc" placeholder="详细说明（可选）…"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">类别 *</label>
              <select class="form-select" v-model="form.cat">
                <option value="">选择类别…</option>
                <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">周期</label>
              <select class="form-select" v-model="form.cycle">
                <option value="none">无周期</option>
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="monthly">每月</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">优先级 *</label>
            <div class="priority-radios">
              <template v-for="p in priorities" :key="p.value">
                <input type="radio" :id="'pr-' + p.value" :value="p.value" v-model="form.priority" class="priority-radio-item" />
                <label :for="'pr-' + p.value" :class="['priority-radio-label', 'p-' + p.value]">{{ p.label }}</label>
              </template>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">截止时间</label>
              <input type="datetime-local" class="form-input" v-model="form.deadline" @change="checkDup" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">提醒时间</label>
              <input type="datetime-local" class="form-input" v-model="form.reminder" />
            </div>
          </div>
          <div class="form-group" style="margin-top:14px;">
            <label class="form-label">初始进度 <span style="color:var(--accent);font-weight:700;">{{ form.progress }}%</span></label>
            <input type="range" v-model.number="form.progress" min="0" max="100" style="width:100%;accent-color:var(--accent);" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="$emit('update:modelValue', false)">取消</button>
          <button class="btn-primary" @click="save">
            <Check :size="14" /> 保存任务
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTaskStore } from '../../stores/taskStore.js'
import { toastService } from '../../composables/useToast.js'
import { PlusCircle, X, Check } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean, taskId: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const store = useTaskStore()
const showDupWarning = ref(false)
const priorities = [
  { value: 'critical', label: '🔴 紧急' },
  { value: 'high', label: '🟠 高' },
  { value: 'medium', label: '🟡 中' },
  { value: 'low', label: '🟢 低' },
]

const form = ref({ title: '', desc: '', cat: '', cycle: 'none', priority: 'medium', deadline: '', reminder: '', progress: 0 })

watch(() => props.modelValue, (val) => {
  if (!val) return
  showDupWarning.value = false
  if (props.taskId) {
    const t = store.tasks.find(x => x.id === props.taskId)
    if (t) {
      form.value = { title: t.title, desc: t.desc || '', cat: t.cat || '', cycle: t.cycle || 'none', priority: t.priority || 'medium', deadline: t.deadline || '', reminder: t.reminder || '', progress: t.progress || 0 }
    }
  } else {
    form.value = { title: '', desc: '', cat: '', cycle: 'none', priority: 'medium', deadline: '', reminder: '', progress: 0 }
  }
})

function checkDup() {
  if (!form.value.title.trim()) { showDupWarning.value = false; return }
  const dup = store.isDuplicateTask(form.value.title, form.value.deadline, props.taskId || null)
  showDupWarning.value = dup
}

function save() {
  if (!form.value.title.trim()) { toastService.showToast('请输入任务标题', 'error'); return }
  if (!form.value.cat) { toastService.showToast('请选择类别', 'error'); return }
  if (showDupWarning.value) { toastService.showToast('任务重复！相同标题+日期已存在', 'error'); return }

  const payload = { ...form.value }
  let ok
  if (props.taskId) {
    ok = store.updateTask(props.taskId, payload)
  } else {
    ok = store.addTask(payload)
  }
  if (ok) emit('update:modelValue', false)
}
</script>
