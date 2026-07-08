import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router/index.js'

import './style/variables.css'
import './style/base.css'
import './style/components.css'
import './style/mobile.css'

// 从旧 key 迁移数据（一次性）
const OLD_KEY = 'taskflow_data_v3'
if (localStorage.getItem(OLD_KEY)) {
  try {
    const old = JSON.parse(localStorage.getItem(OLD_KEY))
    if (old.tasks && !localStorage.getItem('taskflow_tasks'))
      localStorage.setItem('taskflow_tasks', JSON.stringify(old.tasks))
    if (old.categories && !localStorage.getItem('taskflow_categories'))
      localStorage.setItem('taskflow_categories', JSON.stringify(old.categories))
    localStorage.removeItem(OLD_KEY)
  } catch (e) { /* ignore */ }
}

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
