<script setup lang="ts">
import { reactive, ref } from 'vue'

export interface EditUserDialogProps {
  userId: string
  initialName?: string
}

export interface EditUserResult {
  id: string
  name: string
}

const props = defineProps<EditUserDialogProps>()
const emit = defineEmits<{
  resolve: [result: EditUserResult]
  cancel: [reason?: unknown]
}>()

const form = reactive({ name: props.initialName ?? '' })
const submitting = ref(false)
let finished = false

async function confirm() {
  if (finished || submitting.value || !form.name.trim()) return
  submitting.value = true

  // 模拟保存接口；真实项目在这里调用 API，失败时保留弹窗。
  await new Promise((resolve) => setTimeout(resolve, 350))

  finished = true
  emit('resolve', { id: props.userId, name: form.name.trim() })
}

function cancel(reason: unknown = { type: 'user' }) {
  if (finished || submitting.value) return
  finished = true
  emit('cancel', reason)
}
</script>

<template>
  <div class="dialog-mask" @mousedown.self="cancel({ type: 'mask' })">
    <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <header>
        <div>
          <span class="eyebrow">Promise Dialog</span>
          <h2 id="edit-title">编辑用户</h2>
        </div>
        <button class="icon-button" aria-label="关闭" :disabled="submitting" @click="cancel()">×</button>
      </header>

      <label class="field">
        <span>用户名称</span>
        <input v-model="form.name" autofocus placeholder="请输入名称" @keydown.enter="confirm" />
      </label>

      <p class="hint">确认后结果会通过 Promise 返回，组件随即卸载。</p>

      <footer>
        <button class="button ghost" :disabled="submitting" @click="cancel()">取消</button>
        <button class="button primary" :disabled="submitting || !form.name.trim()" @click="confirm">
          {{ submitting ? '保存中…' : '保存并继续' }}
        </button>
      </footer>
    </section>
  </div>
</template>
