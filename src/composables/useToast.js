import { reactive } from 'vue'

const toasts = reactive([])
let idCounter = 0

function showToast(msg, type = 'success') {
  const id = ++idCounter
  toasts.push({ id, msg, type, removing: false })
  setTimeout(() => removeToast(id), 3500)
}

function removeToast(id) {
  const idx = toasts.findIndex(t => t.id === id)
  if (idx === -1) return
  toasts[idx].removing = true
  setTimeout(() => {
    const i = toasts.findIndex(t => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }, 300)
}

export const toastService = { toasts, showToast, removeToast }

export function useToast() {
  return toastService
}
