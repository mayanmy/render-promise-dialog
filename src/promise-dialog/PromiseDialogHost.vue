<script setup lang="ts">
import { dialogInstances } from './manager'
</script>

<template>
  <Teleport to="body">
    <component
      :is="dialog.component"
      v-for="dialog in dialogInstances"
      :key="dialog.id"
      v-bind="dialog.props"
      @resolve="dialog.resolve"
      @cancel="dialog.cancel"
    />
  </Teleport>
</template>
