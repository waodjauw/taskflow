<template>
  <Teleport to="body">
    <div v-show="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <div class="modal-title">更新任务进度</div>
          <div class="modal-close" @click="close"><X :size="16" /></div>
        </div>
        <div class="modal-body">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:14px;">{{ taskTitle }}</div>
          <label class="form-label">进度 <span style="color:var(--accent);font-weight:700;">{{ progressVal }}%</span></label>
          <input type="range" v-model.number="progressVal" min="0" max="100" style="width:100%;accent-color:var(--accent);" />
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="close">取消</button>
          <button class="btn-primary" @click="save">
            <Save :size="14" /> 保存进度
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useTaskStore } from '../../stores/taskStore.js'
import { X, Save } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean, taskId: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const store = useTaskStore()
const progressVal = ref(0)
const taskTitle = computed(() => {
  const t = store.tasks.find(x => x.id === props.taskId)
  return t ? t.title : ''
})

watch(() => props.modelValue, (val) => {
  if (val && props.taskId) {
    const t = store.tasks.find(x => x.id === props.taskId)
    progressVal.value = t ? (t.progress || 0) : 0
  }
})

function close() { emit('update:modelValue', false) }
function save() {
  store.updateProgress(props.taskId, progressVal.value)
  close()
}
</script>
