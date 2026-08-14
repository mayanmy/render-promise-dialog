<script setup lang="ts">
export interface ConfirmDialogProps {
  title: string
  content: string
  confirmText?: string
}

defineProps<ConfirmDialogProps>()
const emit = defineEmits<{
  resolve: [value: true]
  cancel: [reason?: unknown]
}>()
</script>

<template>
  <div class="dialog-mask" @mousedown.self="emit('cancel', { type: 'mask' })">
    <section class="dialog-card compact" role="alertdialog" aria-modal="true">
      <span class="eyebrow">下一步</span>
      <h2>{{ title }}</h2>
      <p class="dialog-copy">{{ content }}</p>
      <footer>
        <button class="button ghost" @click="emit('cancel', { type: 'user' })">暂不提交</button>
        <button class="button primary" @click="emit('resolve', true)">{{ confirmText ?? '确认提交' }}</button>
      </footer>
    </section>
  </div>
</template>
