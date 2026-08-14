import type { App, Plugin } from 'vue'
import PromiseDialogHost from './PromiseDialogHost.vue'

export const promiseDialogPlugin: Plugin = {
  install(app: App) {
    app.component('PromiseDialogHost', PromiseDialogHost)
  },
}
