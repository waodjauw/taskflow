<template>
  <nav class="top-nav">
    <div class="logo-mark">
      <CheckSquare :size="18" color="#fff" />
    </div>
    <div>
      <div class="nav-title">TaskFlow Pro</div>
      <div class="nav-subtitle">智能待办管理系统</div>
    </div>
    <div class="progress-overview">
      <span style="font-size:12px;color:var(--text-muted)">总进度</span>
      <div class="progress-bar-mini">
        <div class="progress-bar-mini-fill" :style="{ width: store.overallProgress + '%' }"></div>
      </div>
      <span style="font-size:12px;font-weight:600;color:var(--accent)">{{ store.overallProgress }}%</span>
    </div>
    <div class="nav-spacer"></div>
    <button class="nav-btn" @click="auth.lockApp()">
      <Lock :size="14" /> 锁定
    </button>
    <div style="position:relative;">
      <button class="nav-btn" @click="store.notifyBell()">
        <Bell :size="14" /> 提醒
      </button>
      <div v-if="store.hasAlerts" class="reminder-dot"></div>
    </div>
    <button class="nav-btn" @click="$emit('open-weekly-report')" style="color:var(--accent);">
      <FileText :size="14" /> AI 周报
    </button>
    <button class="nav-btn" @click="$emit('open-settings')">
      <Settings :size="14" /> 设置
    </button>
    <button class="btn-primary" @click="$emit('open-add')">
      <Plus :size="14" /> 新建任务
    </button>
  </nav>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { CheckSquare, Lock, Bell, Settings, Plus, FileText } from 'lucide-vue-next'

const store = useTaskStore()
const auth = useAuthStore()
defineEmits(['open-settings', 'open-add', 'open-weekly-report'])
</script>
