<script setup lang="ts">
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import type { Event } from '@/types/event.ts'
import { eventsApi } from '@/api/events.ts'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {router} from "@/router";
import type {EventFilters} from "@/types/filters.ts";
import {Button} from "@/components/ui/button";
import FilterSidebar from "@/components/FilterSidebar.vue";

const events = ref<Event[]>([])
const filters = ref<EventFilters>({})
const sidebarOpen = ref<boolean>(false)

const fetchEvents = async (): Promise<void> => {
  events.value = await eventsApi.all(filters.value)
}

const toggleFilters = (): void => {
  sidebarOpen.value = !sidebarOpen.value
}

const applyFilters = async (f?: EventFilters): Promise<void> => {
  filters.value = f ? { ...f } : {}
  await fetchEvents()
}

function goToDetail(eventId: number) {
  router.push('/events/' + eventId)
}

onMounted(fetchEvents)
</script>

<template>
  <div class="w-full flex flex-col items-center">
    <div class="flex justify-items-start w-full mt-4 px-6">
      <Button variant="outline" @click="toggleFilters" class="flex items-center gap-2">
        Filters
      </Button>
    </div>

    <!-- Sidebar -->
    <FilterSidebar
        v-model="sidebarOpen"
        :initial="filters"
        @apply="applyFilters"
        @reset="applyFilters"
    />
    <div class="m-[20px] p-[20px] bg-zinc-900/80 rounded-2xl w-full md:w-[70%]">
      <Table>
        <TableCaption>List of all upcoming events</TableCaption>
        <TableHeader>
          <TableRow class="flex flex-row">
            <TableHead class="w-1/2 md:w-1/4">Title</TableHead>
            <TableHead class="md:block w-1/4">Start</TableHead>
            <TableHead class="hidden md:block w-1/4">End</TableHead>
            <TableHead class="hidden md:block w-1/4">Organizer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
              v-for="event in events"
              :key="event.id"
              @click="goToDetail(event.id)"
              class="flex flex-row w-full"
          >
            <TableCell class="w-1/2 md:w-1/4 truncate">
              {{ event.title }}
            </TableCell>
            <TableCell class="w-1/2 md:w-1/4">
              {{ dayjs(event.starts_at).format('HH:mm ddd DD/MM') }}
            </TableCell>
            <TableCell class="hidden md:block w-1/4">
              {{ dayjs(event.ends_at).format('HH:mm ddd DD/MM') }}
            </TableCell>
            <TableCell class="hidden md:block w-1/4">
              {{ event.organizer.name }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
