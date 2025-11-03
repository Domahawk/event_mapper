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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {router} from "@/router";

const events = ref<Event[]>([])

const fetchEvents = async (): Promise<void> => {
  events.value = await eventsApi.all()
}

function goToDetail(eventId: number) {
  router.push('/events/' + eventId)
}

function editEvent(eventId: number) {
  console.log(`Edit event: ${eventId}`)
}

function deleteEvent(eventId: number) {
  console.log(`Delete event: ${eventId}`)
}

onMounted(fetchEvents)
</script>

<template>
  <div class="m-[20px] p-[20px] bg-zinc-900/80 rounded-2xl">
    <!-- Header -->
    <div>
      <h1>Events</h1>
      <Button>+ Add Event</Button>
    </div>

    <!-- Table -->
    <div>
      <Table>
        <TableCaption>List of all upcoming events</TableCaption>
        <TableHeader>
          <TableRow class="flex flex-row">
            <TableHead class="w-3/4 md:w-1/4 lg:w-1/5">Title</TableHead>
            <TableHead class="hidden md:block w-1/4 lg:w-1/5">Start</TableHead>
            <TableHead class="hidden md:block w-1/4 lg:w-1/5">End</TableHead>
            <TableHead class="hidden lg:block w-1/5">Organizer</TableHead>
            <TableHead class="w-1/4 md:w-1/4 lg:w-1/5 text-end">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
              v-for="event in events"
              :key="event.id"
              @click="goToDetail(event.id)"
              class="flex flex-row w-full"
          >
            <TableCell class="w-3/4 md:w-1/4 lg:w-1/5 truncate">
              {{ event.title }}
            </TableCell>
            <TableCell class="hidden md:block w-1/4 lg:w-1/5">
              {{ dayjs(event.starts_at).format('HH:mm ddd DD/MM') }}
            </TableCell>
            <TableCell class="hidden md:block w-1/4 lg:w-1/5">
              {{ dayjs(event.ends_at).format('HH:mm ddd DD/MM') }}
            </TableCell>
            <TableCell class="hidden lg:block w-1/5">
              {{ event.organizer.name }}
            </TableCell>

            <TableCell @click.stop class="flex justify-end w-1/4 md:w-1/4 lg:w-1/5">
              <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                        size="icon"
                        variant="ghost"
                        class="text-neutral-400 hover:text-white hover:bg-neutral-700/30 rounded-full"
                    >
                      <span class="text-base leading-none">⋯</span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                      align="end"
                      class="w-32 bg-neutral-900 border border-neutral-800 text-neutral-200"
                  >
                    <DropdownMenuItem
                        class="hover:bg-neutral-800 cursor-pointer"
                        @click="editEvent(event.id)"
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        class="hover:bg-red-600/20 text-red-400 cursor-pointer"
                        @click="deleteEvent(event.id)"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
