import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

import './style/variables.css'
import './style/base.css'
import './style/components.css'
import './style/mobile.css'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
