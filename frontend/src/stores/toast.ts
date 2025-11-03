import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Toast } from "@/types/toast.ts"

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])

    function showToast(toast: Omit<Toast, 'id'>) {
        const id = Date.now()
        const duration = toast.duration ?? 4000

        toasts.value.push({ ...toast, id })

        setTimeout(() => removeToast(id), duration)
    }

    function removeToast(id: number) {
        toasts.value = toasts.value.filter((t) => t.id !== id)
    }

    function clearAll() {
        toasts.value = []
    }

    return {
        toasts,
        showToast,
        removeToast,
        clearAll,
    }
})
