<template>
  <nav class="m-top-nav">
    <button class="m-icon-btn" @click="$emit('toggle-drawer')" aria-label="菜单">
      <Menu :size="22" />
    </button>
    <div class="m-logo-mark">
      <CheckSquare :size="16" color="#fff" />
    </div>
    <div class="m-title-wrap">
      <div class="m-nav-title">TaskFlow</div>
      <div class="m-nav-sub">{{ store.overallProgress }}%</div>
    </div>
    <div class="m-nav-spacer"></div>
    <button class="m-icon-btn" @click="$emit('open-weekly-report')" aria-label="AI 周报" style="color:var(--accent);">
      <FileText :size="20" />
    </button>
    <button class="m-icon-btn" @click="store.notifyBell()" aria-label="提醒">
      <Bell :size="20" />
      <span v-if="store.hasAlerts" class="reminder-dot"></span>
    </button>
    <button class="m-icon-btn" @click="$emit('open-add')" aria-label="新建任务">
      <Plus :size="22" />
    </button>
  </nav>
</template>

<script setup>
import { useTaskStore } from '../../stores/taskStore.js'
import { Menu, CheckSquare, Bell, Plus, FileText } from 'lucide-vue-next'

const store = useTaskStore()
defineEmits(['toggle-drawer', 'open-add', 'open-weekly-report'])
</script>
