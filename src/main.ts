import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from '@/ui/App.vue'
import { vHint } from '@/ui/hint'
import './assets/fonts/kai-subset.css'
import './style.css'

const app = createApp(App)
app.directive('hint', vHint)
app.use(createPinia()).mount('#app')

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 离线缓存不可用时游戏仍可正常运行
    })
  })
}
