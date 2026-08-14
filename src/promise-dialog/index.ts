export { createPromiseDialog, cancelAllDialogs, dialogInstances } from './manager'
export { promiseDialogPlugin } from './plugin'
export { default as PromiseDialogHost } from './PromiseDialogHost.vue'
export type {
  DialogOpenOptions,
  DialogResult,
  OpenDialog,
} from './types'
