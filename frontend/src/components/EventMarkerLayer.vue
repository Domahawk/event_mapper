<script setup lang="ts">
import { onMounted, onBeforeUnmount, shallowRef, watch, defineExpose, markRaw } from 'vue'
import * as L from 'leaflet'
import type { Event } from '@/types/event'

const props = defineProps<{
  map: L.Map | null
  events: Event[]
  iconHtml?: (ev: Event) => string
}>()

const emit = defineEmits<{ (e: 'select', ev: Event): void }>()
const markers = shallowRef<L.Marker[]>([])

const makeIcon = (ev: Event): L.DivIcon  => {
  const html =
      props.iconHtml?.(ev) ??
      `<div class="w-3 h-3 rounded-full bg-neon-pink shadow-neon-pink animate-pulse-neon"></div>`
  return L.divIcon({ className: 'neon-marker', html, iconSize: [16, 16] })
}

const clearMarkers = (): void => {
  markers.value.forEach(m => m.remove())
  markers.value = []
}

const addMarkers = (): void => {
  if (!props.map) return
  clearMarkers()

  for (const ev of props.events) {
    const marker = markRaw(L.marker([ev.lat, ev.lng], { icon: makeIcon(ev) }))
    marker.addTo(props.map)
    marker.on('click', () => emit('select', ev))
    markers.value.push(marker)
  }
}

const fitBounds = (padding: [number, number] = [40, 40]): void => {
  if (!props.map || markers.value.length === 0) return
  const bounds = L.latLngBounds(markers.value.map(m => m.getLatLng()))
  props.map.fitBounds(bounds, { padding })
}

watch(() => props.map, m => (m ? addMarkers() : clearMarkers()))
watch(() => props.events, addMarkers, { deep: true })
onMounted(() => { if (props.map) addMarkers() })
onBeforeUnmount(clearMarkers)
defineExpose({ fitBounds })
</script>

<template></template>
