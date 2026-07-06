<template>
  <Teleport to="body">
    <div v-show="modelValue" class="modal-overlay" @click.self="close">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <div class="modal-title">修改 PIN 码</div>
          <div class="modal-close" @click="close"><X :size="16" /></div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">当前 PIN</label>
            <input type="password" class="form-input" v-model="oldPin" placeholder="••••" maxlength="4" />
          </div>
          <div class="form-group">
            <label class="form-label">新 PIN 码</label>
            <input type="password" class="form-input" v-model="newPin" placeholder="••••" maxlength="4" />
          </div>
          <div class="form-group">
            <label class="form-label">确认新 PIN</label>
            <input type="password" class="form-input" v-model="confirmPin" placeholder="••••" maxlength="4" />
          </div>
          <div v-if="errorMsg" class="dup-warning">{{ errorMsg }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="close">取消</button>
          <button class="btn-primary" @click="save">
            <ShieldCheck :size="14" /> 确认修改
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../../stores/authStore.js'
import { X, ShieldCheck } from 'lucide-vue-next'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const store = useAuthStore()
const oldPin = ref('')
const newPin = ref('')
const confirmPin = ref('')
const errorMsg = ref('')

watch(() => props.modelValue, (val) => {
  if (val) { oldPin.value = ''; newPin.value = ''; confirmPin.value = ''; errorMsg.value = '' }
})

function close() { emit('update:modelValue', false) }
function save() {
  const result = store.changePin(oldPin.value, newPin.value, confirmPin.value)
  if (result.ok) { close() }
  else { errorMsg.value = result.msg }
}
</script>
