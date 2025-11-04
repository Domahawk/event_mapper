<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue'
import L, {latLng, Map as LMap, Marker} from 'leaflet'

type LatLng = { lat: number; lng: number }

const props = withDefaults(defineProps<{
  /** Two-way bound value */
  modelValue: LatLng | null
  /** Initial center if modelValue is null */
  center?: LatLng
  /** Initial zoom */
  zoom?: number
  /** Tailwind height class */
  heightClass?: string
  /** Show coords readout under the map */
  showCoords?: boolean
  /** Disable interactions (read-only view) */
  readonly?: boolean
  autoFocus?: boolean
  focusZoom?: number
}>(), {
  center: () => ({ lat: 45.8150, lng: 15.9819 }), // Zagreb
  zoom: 12,
  heightClass: 'h-72',
  showCoords: true,
  readonly: false,
  autoFocus: true,
  focusZoom: 16,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LatLng | null): void
  (e: 'change', value: LatLng | null): void
}>()

const mapEl = ref<HTMLDivElement | null>(null)
const map = ref<LMap | null>(null)
let marker: Marker | null = null

// Fix default Leaflet marker icons in bundlers
// (prevents missing marker icons when using Vite)
const DefaultIcon = L.icon({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString(),
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString(),
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const currentValue = computed<LatLng | null>({
  get: () => props.modelValue,
  set: (v) => {
    emit('update:modelValue', v)
    emit('change', v)
  }
})

function placeMarker(pos: LatLng) {
  if (!map.value) return
  stopAnimations()
  if (!marker) {
    marker = L.marker([pos.lat, pos.lng], { draggable: !props.readonly }).addTo(map.value as LMap)
    if (!props.readonly) {
      marker.on('dragend', () => {
        const { lat, lng } = marker!.getLatLng()
        currentValue.value = { lat, lng }
      })
    }
  } else {
    marker.setLatLng([pos.lat, pos.lng])
  }
}

function moveMapTo(pos: LatLng, zoom?: number) {
  if (!map.value || !pos) return
  stopAnimations()
  map.value.setView([pos.lat, pos.lng], zoom ?? map.value.getZoom(), { animate: true })
}

function setFromMapClick(e: any) {
  const { lat, lng } = e.latlng
  placeMarker({ lat, lng })
  currentValue.value = { lat, lng }
}

function useMyLocation() {
  if (!navigator.geolocation || !map.value || props.readonly) return
  navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        placeMarker(coords)
        moveMapTo(coords, 14)
        currentValue.value = coords
      },
      () => {
        // silently ignore; you can hook your toast here if desired
      },
      { enableHighAccuracy: true, timeout: 8000 }
  )
}
const stopAnimations = ():void => {
  (map.value as any)?.stop?.()
}

onMounted(() => {
  const start = props.modelValue ?? props.center
  map.value = L.map(mapEl.value as HTMLDivElement, {
    zoomControl: true,
    attributionControl: true,
    dragging: !props.readonly,
    scrollWheelZoom: !props.readonly,
    doubleClickZoom: !props.readonly,
    boxZoom: !props.readonly,
    keyboard: !props.readonly,
    tap: !props.readonly as any,
    markerZoomAnimation: false,
  }).setView([start.lat, start.lng], props.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value as LMap)

  if (props.modelValue) {
    placeMarker(props.modelValue)
  }

  if (!props.readonly) {
    map.value.on('click', setFromMapClick)
  }
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.off()
    map.value.remove()
    map.value = null
  }
  marker = null
})

// Keep marker in sync if v-model changes from outside
watch(() => props.modelValue, (v) => {
  if (!map.value) return

  stopAnimations()

  if (!v) {
    // Remove marker and reset view to default center/zoom
    if (marker) {
      marker.remove()
      marker = null
    }
    moveMapTo(props.center, props.zoom)  // reset
    return
  }

  placeMarker(v)

  if (props.autoFocus) {
    moveMapTo(v, props.focusZoom)
  }
})

// Expose an imperative API if parent wants to call it via ref
defineExpose({ useMyLocation, moveMapTo })
</script>

<template>
  <div class="w-full">
    <div :class="['relative w-full overflow-hidden rounded-xl border z-0', heightClass]">
      <div ref="mapEl" class="absolute inset-0"></div></div>
    </div>
  <!-- Controls -->
  <div class="left-2 top-2 flex gap-2">
    <div v-if="showCoords && modelValue" class="mt-2 text-xs text-gray-600">
      Lat: {{ modelValue.lat }}, Lng: {{ modelValue.lng }}
    </div>
  </div>
</template>
