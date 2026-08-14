import { createPromiseDialog } from '@/promise-dialog'
import ConfirmDialog, { type ConfirmDialogProps } from './ConfirmDialog.vue'
import EditUserDialog, {
  type EditUserDialogProps,
  type EditUserResult,
} from './EditUserDialog.vue'

export const openEditUserDialog = createPromiseDialog<
  EditUserDialogProps,
  EditUserResult
>({
  name: 'edit-user',
  component: EditUserDialog,
})

export const openConfirmDialog = createPromiseDialog<
  ConfirmDialogProps,
  true
>({
  name: 'confirm-submit',
  component: ConfirmDialog,
  defaultProps: { confirmText: '确认提交' },
})
