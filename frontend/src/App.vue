<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import Toaster from "@/components/Toaster.vue";
</script>

<template>
  <Navbar />
  <main class="w-full h-full">
    <RouterView />
    <Toaster />
  </main>
</template>

<style scoped>

</style>
