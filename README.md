# render-promise-dialog

Type-safe Promise dialog manager for Vue 3. It turns dialog interaction into a linear, awaitable business flow without scattering `visible` state and callbacks across the page.

## Install

```bash
npm install render-promise-dialog
```

Vue is a peer dependency. This package requires Vue 3.3 or newer.

## Setup

Register the optional plugin and mount one host near the root of the application:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { promiseDialogPlugin } from 'render-promise-dialog'

createApp(App)
  .use(promiseDialogPlugin)
  .mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { PromiseDialogHost } from 'render-promise-dialog'
</script>

<template>
  <RouterView />
  <PromiseDialogHost />
</template>
```

Because dialogs are rendered by a host inside the existing Vue application, they inherit Pinia, Router, i18n, global components, and `provide/inject` context.

## Create a dialog

A dialog component receives normal props and emits one of two events:

```vue
<!-- EditUserDialog.vue -->
<script setup lang="ts">
interface Props {
  userId: string
}

interface UserResult {
  id: string
  name: string
}

defineProps<Props>()

const emit = defineEmits<{
  resolve: [value: UserResult]
  cancel: [reason?: unknown]
}>()
</script>

<template>
  <YourDialog>
    <button @click="emit('cancel', { type: 'user' })">Cancel</button>
    <button @click="emit('resolve', { id: userId, name: 'Alice' })">
      Save
    </button>
  </YourDialog>
</template>
```

Create a typed open function:

```ts
import { createPromiseDialog } from 'render-promise-dialog'
import EditUserDialog from './EditUserDialog.vue'

interface EditUserProps {
  userId: string
}

interface EditUserResult {
  id: string
  name: string
}

export const openEditUserDialog = createPromiseDialog<
  EditUserProps,
  EditUserResult
>({
  name: 'edit-user',
  component: EditUserDialog,
})
```

## Await the result

```ts
const edited = await openEditUserDialog({ userId: 'U-1001' })

if (edited.status === 'cancelled') {
  return
}

await updateUser(edited.value)
```

Cancellation is represented as a normal resolved result instead of a rejected Promise:

```ts
type DialogResult<T> =
  | { status: 'confirmed'; value: T }
  | { status: 'cancelled'; reason?: unknown }
```

## Prevent duplicate dialogs

Pass a key to reuse an in-flight Promise for the same business entity:

```ts
const result = await openEditUserDialog(
  { userId: 'U-1001' },
  { key: 'U-1001' },
)
```

## Abort and clean up

Use an `AbortSignal` for page-scoped flows:

```ts
const controller = new AbortController()

const resultPromise = openEditUserDialog(
  { userId: 'U-1001' },
  { signal: controller.signal },
)

controller.abort({ type: 'route-change' })
```

Or close every active dialog:

```ts
import { cancelAllDialogs } from 'render-promise-dialog'

cancelAllDialogs({ type: 'route-change' })
```

## Local development

```bash
npm install
npm run dev
npm test
npm run build
npm run pack:check
```

The Vite demo application is used only for local development. The published package contains the library build from `src/promise-dialog` plus this README and the license.
