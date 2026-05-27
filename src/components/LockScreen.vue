<template>
  <div class="lock-screen">
    <div class="lock-logo">
      <ShieldCheck :size="32" color="#fff" />
    </div>
    <div>
      <div class="lock-title">待办事项管理系统</div>
      <div class="lock-sub">请输入 PIN 码解锁</div>
    </div>
    <div class="pin-dots">
      <div v-for="i in 4" :key="i" class="pin-dot" :class="{ filled: pinBuffer.length >= i }"></div>
    </div>
    <div class="pin-error">{{ errorMsg }}</div>
    <div class="pin-keypad">
      <button v-for="k in keyOrder" :key="k" class="pin-key" @click="pressKey(k)">
        {{ k === 'del' ? '⌫' : k === 'clear' ? '清除' : k }}
      </button>
    </div>
    <div style="color:#475569;font-size:12px;">默认 PIN: 1234</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTaskStore } from '../stores/taskStore.js'
import { ShieldCheck } from 'lucide-vue-next'

const store = useTaskStore()
const pinBuffer = ref('')
const errorMsg = ref('')

const keyOrder = ['1','2','3','4','5','6','7','8','9','clear','0','del']

function pressKey(k) {
  if (k === 'del') {
    pinBuffer.value = pinBuffer.value.slice(0, -1)
  } else if (k === 'clear') {
    pinBuffer.value = ''
  } else {
    if (pinBuffer.value.length >= 4) return
    pinBuffer.value += k
    if (pinBuffer.value.length === 4) tryPin()
  }
}

function tryPin() {
  const ok = store.verifyPin(pinBuffer.value)
  if (!ok) {
    errorMsg.value = 'PIN 码错误，请重试'
    pinBuffer.value = ''
    setTimeout(() => { errorMsg.value = '' }, 1500)
  } else {
    pinBuffer.value = ''
  }
}

function onKeydown(e) {
  if (e.key >= '0' && e.key <= '9') pressKey(e.key)
  else if (e.key === 'Backspace') pressKey('del')
  else if (e.key === 'Escape') pressKey('clear')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>
