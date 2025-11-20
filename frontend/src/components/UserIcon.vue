<!-- src/components/icons/UserIcon.vue -->
<script setup lang="ts">
const props = withDefaults(
    defineProps<{
      size?: 'sm' | 'md' | 'lg' | 'xl'
      color?: 'default' | 'muted' | 'primary' | 'destructive'
    }>(),
    {
      size: 'md',
      color: 'default',
    }
)

const sizeClass = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
}[props.size]

const colorClass = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  primary: 'text-primary',
  destructive: 'text-destructive',
}[props.color]
</script>

<template>
  <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      :class="[sizeClass, colorClass]"
  >
    <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5.121 17.804A9 9 0 1118.88 17.8M12 14a5 5 0 100-10 5 5 0 000 10z"
    />
  </svg>
</template>
