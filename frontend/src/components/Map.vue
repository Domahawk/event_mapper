<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import * as L from 'leaflet'
import dayjs from 'dayjs'
import { eventsApi } from '@/api/events'
import type { Event } from '@/types/event'
import EventMarkerLayer from '@/components/EventMarkerLayer.vue'
import { useRouter } from 'vue-router'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {Calendar, MapPin} from "lucide-vue-next";

const mapRef = ref<L.Map>()
const events = ref<Event[]>([])
const selected = ref<Event | null>(null)
const open = ref(false)
const router = useRouter()

function onSelect(ev: Event) {
  selected.value = ev
  open.value = true
}

const dateRange = computed(() => {
  const ev = selected.value
  if (!ev) return ''
  const s = dayjs(ev.starts_at)
  const e = dayjs(ev.ends_at)
  return s.isSame(e, 'day')
      ? `${s.format('DD.MM.YYYY. HH:mm')} – ${e.format('HH:mm')}`
      : `${s.format('DD.MM.YYYY. HH:mm')} → ${e.format('DD.MM.YYYY. HH:mm')}`
})

onMounted(async () => {
  mapRef.value = L.map('map').setView([45.815, 15.981], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(mapRef.value)

  events.value = await eventsApi.all()
})
</script>

<template>
  <div class="w-full h-full">
    <div id="map" class="h-[95vh] w-full rounded-lg overflow-hidden shadow-lg border border-zinc-800 map-dark"></div>
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#ff00ff11] via-[#ff00ff0d] to-[#ffffff0a] mix-blend-screen"></div>
  </div>

  <!-- Marker layer -->
  <EventMarkerLayer :map="mapRef as L.Map" :events="events" @select="onSelect" />

  <!-- Modal -->
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-lg bg-black" :dialogClose="false">
      <DialogHeader>
        <DialogTitle class="text-xl">{{ selected?.title }}</DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          <div class="flex gap-2">
            <Calendar class="h-4 w-4" />
            <p>{{ dateRange }}</p>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-3">
        <div v-if="selected?.address?.street" class="text-sm flex">
          <MapPin class="min-h-4 min-w-4 w-4 h-4" />
          <span class="ml-2">{{ selected.address.street }} {{ selected.address.house_number }}</span>
        </div>
        <div v-if="selected?.description" class="text-sm leading-relaxed">
          <span class="font-medium">About:</span>
          <p class="mt-1 whitespace-pre-line">{{ selected.description }}</p>
        </div>
      </div>

      <DialogFooter class="mt-6 gap-2 sm:gap-3">
        <Button variant="outline" @click="open=false">Close</Button>
        <Button
            variant="outline"
            @click="() => { open=false; router.push({ name: 'eventDetails', params: { id: selected!.id } }) }"
        >
          View details
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
