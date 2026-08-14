import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  cancelAllDialogs,
  createPromiseDialog,
  dialogInstances,
} from './manager'

const TestDialog = defineComponent({ template: '<div />' })

describe('promise dialog manager', () => {
  beforeEach(() => cancelAllDialogs())

  it('resolves a confirmed result and cleans up', async () => {
    const open = createPromiseDialog<{ id: string }, { id: string }>({
      name: 'test',
      component: TestDialog,
    })

    const promise = open({ id: '1' })
    expect(dialogInstances).toHaveLength(1)

    dialogInstances[0]!.resolve({ id: '1' })

    await expect(promise).resolves.toEqual({
      status: 'confirmed',
      value: { id: '1' },
    })
    expect(dialogInstances).toHaveLength(0)
  })

  it('treats cancellation as a normal result', async () => {
    const open = createPromiseDialog<Record<string, never>, void>({
      name: 'cancel-test',
      component: TestDialog,
    })

    const promise = open({})
    dialogInstances[0]!.cancel('user')

    await expect(promise).resolves.toEqual({
      status: 'cancelled',
      reason: 'user',
    })
  })

  it('reuses a keyed in-flight dialog', () => {
    const open = createPromiseDialog<{ id: string }, string>({
      name: 'singleton',
      component: TestDialog,
    })

    const first = open({ id: '1' }, { key: '1' })
    const second = open({ id: '1' }, { key: '1' })

    expect(first).toBe(second)
    expect(dialogInstances).toHaveLength(1)
  })

  it('supports AbortSignal cancellation', async () => {
    const controller = new AbortController()
    const open = createPromiseDialog<Record<string, never>, void>({
      name: 'abort-test',
      component: TestDialog,
    })

    const promise = open({}, { signal: controller.signal })
    controller.abort('route-change')

    await expect(promise).resolves.toEqual({
      status: 'cancelled',
      reason: 'route-change',
    })
    expect(dialogInstances).toHaveLength(0)
  })
})
