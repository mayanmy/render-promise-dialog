<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import { getDialogInstances, subscribeDialogs } from './manager'

const instances = shallowRef([...getDialogInstances()])
const unsubscribe = subscribeDialogs(() => {
  instances.value = [...getDialogInstances()]
})

onBeforeUnmount(unsubscribe)
</script>

<template>
  <Teleport to="body">
    <component
      :is="dialog.component"
      v-for="dialog in instances"
      :key="dialog.id"
      v-bind="dialog.props"
      @resolve="dialog.resolve"
      @cancel="dialog.cancel"
    />
  </Teleport>
</template>
