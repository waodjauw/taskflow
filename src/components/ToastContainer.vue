<template>
  <Teleport to="body">
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', 'toast-' + toast.type, { removing: toast.removing }]">
        <div class="toast-icon">
          <CheckCircle v-if="toast.type === 'success'" :size="14" />
          <AlertCircle v-else-if="toast.type === 'error'" :size="14" />
          <AlertTriangle v-else-if="toast.type === 'warn'" :size="14" />
          <Info v-else :size="14" />
        </div>
        <span class="toast-text">{{ toast.msg }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">✕</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { toastService } from '../composables/useToast.js'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const { toasts, removeToast } = toastService
</script>
