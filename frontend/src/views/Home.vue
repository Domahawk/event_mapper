<script setup lang="ts">
import Map from "@/components/Map.vue";
import {onMounted, type Ref, ref} from "vue";
import type {Event} from "@/types/event.ts";
import {eventsApi} from "@/api/events.ts";
import FilterSidebar from "@/components/FilterSidebar.vue";
import type {EventFilters} from "@/types/filters.ts";

const events: Ref<Event[]> = ref([] as Event[])
const filters: Ref<EventFilters> = ref({})
const sidebarOpen: Ref<boolean> = ref(false)

const load = async (): Promise<void> => {
  events.value = await eventsApi.all(filters.value)
}

const applyFilters = async (f?: EventFilters): Promise<void> => {
  filters.value = f ? {...f} : {}
  await load()
}

const toggleFilters = () => sidebarOpen.value = !sidebarOpen.value

onMounted(load)
</script>

<template>

  <div class="w-full h-full">
    <button
        class="absolute top-35 left-1 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-background/80 backdrop-blur
             hover:bg-black transition"
        @click="toggleFilters"
    >
      Filters
    </button>
    <Map :events="events"></Map>

  </div>

  <FilterSidebar
      v-model="sidebarOpen"
      :initial="filters"
      @apply="applyFilters"
      @reset="applyFilters"
  />
</template>