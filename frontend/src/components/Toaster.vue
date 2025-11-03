<script setup lang="ts">
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<template>
  <div class="fixed top-4 right-4 z-50 flex flex-col space-y-3">
    <transition-group name="toast-slide" tag="div">
      <div
          v-for="t in toastStore.toasts"
          :key="t.id"
          class="relative w-80 rounded-lg border p-4 shadow-lg text-sm backdrop-blur-sm transition-all"
          :class="{
          'bg-neutral-900/90 border-neutral-700 text-neutral-100': t.variant === 'default' || !t.variant,
          'bg-green-600/90 border-green-500 text-white': t.variant === 'success',
          'bg-red-600/90 border-red-500 text-white': t.variant === 'destructive',
          'bg-blue-600/90 border-blue-500 text-white': t.variant === 'info',
        }"
      >
        <button
            @click="toastStore.removeToast(t.id)"
            class="absolute top-2 right-2 text-white/70 hover:text-white transition"
            aria-label="Close toast"
        >
          ✕
        </button>

        <div class="flex flex-col pr-6">
          <span v-if="t.title" class="font-medium text-base mb-0.5">
            {{ t.title }}
          </span>
          <span v-if="t.description" class="opacity-90 leading-snug">
            {{ t.description }}
          </span>
        </div>
      </div>
    </transition-group>
  </div>
</template>
