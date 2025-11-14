<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="mx-auto max-w-6xl p-4">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Admin</h1>
      <nav class="flex gap-3 text-sm">
        <RouterLink class="underline-offset-4 hover:underline" :to="{ name: 'adminUsers' }">Users</RouterLink>
        <RouterLink class="underline-offset-4 hover:underline" :to="{ name: 'home' }">Back to app</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>