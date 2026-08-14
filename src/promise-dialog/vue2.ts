import * as VueRuntime from 'vue'
import {
  cancelAllDialogs,
  createPromiseDialog,
  dialogInstances,
  getDialogInstances,
  subscribeDialogs,
} from './manager'
import type { DialogInstance } from './types'

// Vue 2 exposes the constructor as the CommonJS/default export. Using this
// fallback keeps the adapter stable across bundlers and Vue 2.6/2.7 builds.
const Vue2 = ((VueRuntime as unknown as { default?: unknown }).default ??
  VueRuntime) as {
  extend(options: Record<string, unknown>): unknown
}

export const PromiseDialogHost = Vue2.extend({
  name: 'PromiseDialogHost',

  data() {
    return {
      instances: [...getDialogInstances()] as DialogInstance[],
      unsubscribeDialogs: null as null | (() => void),
    }
  },

  created(this: {
    instances: DialogInstance[]
    unsubscribeDialogs: null | (() => void)
  }) {
    this.unsubscribeDialogs = subscribeDialogs(() => {
      this.instances = [...getDialogInstances()]
    })
  },

  beforeDestroy(this: { unsubscribeDialogs: null | (() => void) }) {
    this.unsubscribeDialogs?.()
  },

  render(this: { instances: DialogInstance[] }, h: (...args: unknown[]) => unknown) {
    const dialogs = this.instances.map((dialog) =>
      h(dialog.component, {
        key: dialog.id,
        props: dialog.props,
        on: {
          resolve: dialog.resolve,
          cancel: dialog.cancel,
        },
      }),
    )

    return h('div', { attrs: { 'data-promise-dialog-host': '' } }, dialogs)
  },
})

export const promiseDialogPlugin = {
  install(Vue: { component(name: string, component: unknown): void }) {
    Vue.component('PromiseDialogHost', PromiseDialogHost)
  },
}

export {
  cancelAllDialogs,
  createPromiseDialog,
  dialogInstances,
  getDialogInstances,
  subscribeDialogs,
}

export type {
  DialogComponent,
  DialogOpenOptions,
  DialogResult,
  OpenDialog,
} from './types'
