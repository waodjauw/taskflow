<template>
  <div class="m-layout">
    <MobileTopNav @toggle-drawer="drawerOpen = !drawerOpen" @open-add="$emit('open-add')" />
    <MobileDrawer v-model="drawerOpen" @open-settings="$emit('open-settings')" />
    <main class="m-content">
      <AlertBanner />
      <MobileStatsRow />
      <MobileToolbar />
      <BatchBar v-if="store.batchMode" />
      <MobileTaskGrid />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBatchStore } from '../../stores/batchStore.js'
import MobileTopNav from './MobileTopNav.vue'
import MobileDrawer from './MobileDrawer.vue'
import MobileStatsRow from './MobileStatsRow.vue'
import MobileToolbar from './MobileToolbar.vue'
import MobileTaskGrid from './MobileTaskGrid.vue'
import AlertBanner from '../AlertBanner.vue'
import BatchBar from '../BatchBar.vue'

const store = useBatchStore()
const drawerOpen = ref(false)

defineEmits(['open-settings', 'open-add'])
</script>
