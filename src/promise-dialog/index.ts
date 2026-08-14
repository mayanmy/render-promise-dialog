export {
  createPromiseDialog,
  cancelAllDialogs,
  dialogInstances,
  getDialogInstances,
  subscribeDialogs,
} from './manager'
export { promiseDialogPlugin } from './plugin'
export { default as PromiseDialogHost } from './PromiseDialogHost.vue'
export type {
  DialogOpenOptions,
  DialogResult,
  DialogComponent,
  OpenDialog,
} from './types'
