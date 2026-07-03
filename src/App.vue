<template>
  <div :class="isMobile ? 'm-app-root' : 'app-wrapper'">
    <LockScreen v-if="authStore.isLocked && settingsStore.settings.pinEnabled" />
    <template v-else>
      <MobileLayout
        v-if="isMobile"
        @open-settings="settingsOpen = true"
        @open-add="openAddModal(null)"
      />
      <template v-else>
        <TopNav @open-settings="settingsOpen = true" @open-add="openAddModal(null)" />
        <div class="main-layout">
          <Sidebar />
          <ContentArea />
        </div>
      </template>
    </template>
    <ContextMenu @edit-task="openAddModal" @progress-task="openProgressModal" />
    <ToastContainer />
    <TaskModal v-model="addOpen" :task-id="editTaskId" />
    <SettingsModal v-model="settingsOpen" @open-pin-change="pinChangeOpen = true" />
    <PinChangeModal v-model="pinChangeOpen" />
    <ProgressModal v-model="progressOpen" :task-id="progressTaskId" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTaskStore } from './stores/taskStore.js'
import { useCategoryStore } from './stores/categoryStore.js'
import { useSettingsStore } from './stores/settingsStore.js'
import { useAuthStore } from './stores/authStore.js'
import { useContextMenuStore } from './stores/contextMenuStore.js'
import { scheduleReminders, clearAllReminders } from './composables/useReminders.js'
import { toastService } from './composables/useToast.js'
import { useDevice } from './composables/useDevice.js'
import LockScreen from './components/LockScreen.vue'
import TopNav from './components/TopNav.vue'
import Sidebar from './components/Sidebar.vue'
import ContentArea from './components/ContentArea.vue'
import ContextMenu from './components/ContextMenu.vue'
import ToastContainer from './components/ToastContainer.vue'
import TaskModal from './components/modals/TaskModal.vue'
import SettingsModal from './components/modals/SettingsModal.vue'
import PinChangeModal from './components/modals/PinChangeModal.vue'
import ProgressModal from './components/modals/ProgressModal.vue'
import MobileLayout from './components/mobile/MobileLayout.vue'

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const contextMenuStore = useContextMenuStore()
const route = useRoute()
const { isMobile } = useDevice()
const addOpen = ref(false)
const editTaskId = ref(null)
const settingsOpen = ref(false)
const pinChangeOpen = ref(false)
const progressOpen = ref(false)
const progressTaskId = ref(null)

function openAddModal(taskId) {
  editTaskId.value = taskId || null
  addOpen.value = true
}

function openProgressModal(taskId) {
  progressTaskId.value = taskId
  progressOpen.value = true
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    addOpen.value = false
    settingsOpen.value = false
    pinChangeOpen.value = false
    progressOpen.value = false
    contextMenuStore.closeContextMenu()
  }
}

function onGlobalClick() {
  contextMenuStore.closeContextMenu()
}

onMounted(() => {
  settingsStore.loadFromStorage()
  authStore.loadFromStorage()
  taskStore.loadFromStorage()
  categoryStore.loadFromStorage()
  if (localStorage.getItem('taskflow_data_v3')) {
    localStorage.removeItem('taskflow_data_v3')
  }
  settingsStore.applyTheme(settingsStore.settings.theme)
  taskStore.syncFromRoute(route)
  scheduleReminders(taskStore.tasks, settingsStore.settings)
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onGlobalClick)
  setTimeout(() => {
    toastService.showToast('✅ 离线缓存已启用，数据自动保存到本地', 'info')
  }, 1200)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onGlobalClick)
  clearAllReminders()
})

watch(() => [taskStore.tasks, settingsStore.settings.notifEnabled, settingsStore.settings.remindAhead], () => {
  scheduleReminders(taskStore.tasks, settingsStore.settings)
}, { deep: true })

watch(() => route.path, () => {
  taskStore.syncFromRoute(route)
})
</script>
