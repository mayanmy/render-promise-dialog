import { createApp } from 'vue'
import App from './App.vue'
import { promiseDialogPlugin } from './promise-dialog'
import './style.css'

createApp(App).use(promiseDialogPlugin).mount('#app')
