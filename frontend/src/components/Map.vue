<script setup lang="ts">
import {onMounted, type Ref, ref} from 'vue'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import type {Event} from "@/types/event.ts";
import {eventsApi} from "@/api/events.ts";

const mapRef = ref<L.Map | null>(null) as Ref<L.Map | null>
const events = ref<Event[]>([])

onMounted(async () => {
  // Initialize map centered on Zagreb
  mapRef.value = L.map('map').setView([45.815, 15.981], 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapRef.value)

  events.value = await eventsApi.all()

  events.value.forEach((event) => {
    const icon = L.divIcon({
      className: 'neon-marker',
      html: `
        <div class="w-3 h-3 rounded-full bg-neon-pink shadow-neon-pink animate-pulse-neon"></div>
      `,
      iconSize: [16, 16],
    })

    const marker = L.marker([event.lat, event.lng], { icon }).addTo(mapRef.value!)
    marker.bindPopup(`<strong>${event.title}</strong>`)
  })
})
</script>

<template>
  <div class="relative flex justify-center items-center w-full">
    <div
        id="map"
        class="h-[90vh] w-[90vw] rounded-lg overflow-hidden shadow-lg border border-zinc-800 map-dark"
    ></div>
    <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#ff00ff11] via-[#ff00ff0d] to-[#ffffff0a] mix-blend-screen"
    ></div>
  </div>
</template>