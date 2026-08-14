import type { Component } from 'vue'

export type DialogId = number

export type DialogResult<T> =
  | { status: 'confirmed'; value: T }
  | { status: 'cancelled'; reason?: unknown }

export interface DialogOpenOptions {
  /** 同一个 key 的弹窗存在时，直接复用它对应的 Promise。 */
  key?: string
  /** 外部取消信号，例如页面卸载或请求终止。 */
  signal?: AbortSignal
}

export interface DialogDefinition<TProps, TResult> {
  name: string
  component: Component
  defaultProps?: Partial<TProps>
}

export interface DialogInstance {
  id: DialogId
  name: string
  key?: string
  component: Component
  props: Record<string, unknown>
  resolve(value: unknown): void
  cancel(reason?: unknown): void
}

export type OpenDialog<TProps, TResult> = (
  props: TProps,
  options?: DialogOpenOptions,
) => Promise<DialogResult<TResult>>
