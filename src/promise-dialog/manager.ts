import { shallowReactive } from 'vue'
import type {
  DialogDefinition,
  DialogInstance,
  DialogOpenOptions,
  DialogResult,
  OpenDialog,
} from './types'

export const dialogInstances = shallowReactive<DialogInstance[]>([])

let seed = 0
const singletonPromises = new Map<string, Promise<DialogResult<unknown>>>()

function removeDialog(id: number) {
  const index = dialogInstances.findIndex((item) => item.id === id)
  if (index >= 0) dialogInstances.splice(index, 1)
}

export function createPromiseDialog<
  TProps extends object,
  TResult,
>(definition: DialogDefinition<TProps, TResult>): OpenDialog<TProps, TResult> {
  return (props: TProps, options: DialogOpenOptions = {}) => {
    const singletonKey = options.key
      ? `${definition.name}:${options.key}`
      : undefined

    if (singletonKey) {
      const running = singletonPromises.get(singletonKey)
      if (running) return running as Promise<DialogResult<TResult>>
    }

    const id = ++seed
    let settled = false
    let removeAbortListener: (() => void) | undefined

    const promise = new Promise<DialogResult<TResult>>((resolve) => {
      const settle = (result: DialogResult<TResult>) => {
        if (settled) return
        settled = true
        removeAbortListener?.()
        removeDialog(id)
        resolve(result)
      }

      const instance: DialogInstance = {
        id,
        name: definition.name,
        key: options.key,
        component: definition.component,
        props: {
          ...definition.defaultProps,
          ...props,
        } as Record<string, unknown>,
        resolve: (value) => {
          settle({ status: 'confirmed', value: value as TResult })
        },
        cancel: (reason) => {
          settle({ status: 'cancelled', reason })
        },
      }

      dialogInstances.push(instance)

      if (options.signal) {
        const handleAbort = () => instance.cancel(options.signal?.reason)

        if (options.signal.aborted) {
          handleAbort()
        } else {
          options.signal.addEventListener('abort', handleAbort, { once: true })
          removeAbortListener = () =>
            options.signal?.removeEventListener('abort', handleAbort)
        }
      }
    })

    if (singletonKey) {
      const shared = promise as Promise<DialogResult<unknown>>
      singletonPromises.set(singletonKey, shared)
      void shared.finally(() => singletonPromises.delete(singletonKey))
    }

    return promise
  }
}

export function cancelAllDialogs(reason: unknown = { type: 'cancel-all' }) {
  for (const dialog of [...dialogInstances]) dialog.cancel(reason)
}
