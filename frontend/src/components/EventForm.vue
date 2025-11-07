<script setup lang="ts">
import {ref, type Ref, watch} from 'vue'
import { watchDebounced } from '@vueuse/core'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import DateTimePicker from '@/components/DateTimePicker.vue'
import MapPicker from '@/components/MapPicker.vue'
import type { GeoResult } from '@/types/common'
import type { EventDTO } from '@/types/event'
import { useEventForm } from '@/composables/useEventForm'

const props = defineProps<{
  initial?: EventDTO
  submitLabel?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: EventDTO): void
}>()

const {
  form, errors, results, showResults, geoLoading,
  pickedThroughMap, addressId, search, reverse, serializeData
} = useEventForm(props.initial)

const address: Ref<string> = ref(
    [props.initial?.street, props.initial?.house_number].filter(Boolean).join(' ')
)

const resultsMap = ref<GeoResult | null>(null)

function pickSuggestion(r: GeoResult) {
  addressId.value = r.id
  form.street = r.street
  form.house_number = r.house_number ?? ''
  form.address_line = r.address_line
  form.latlng = { lat: r.lat, lng: r.lng }
  if (!form.event_latlng) form.event_latlng = form.latlng
  address.value = `${form.street} ${form.house_number}`.trim()
  results.value = []
  showResults.value = false
}

function pickSuggestionMap(r: GeoResult) {
  addressId.value = r.id
  form.street = r.street
  form.house_number = r.house_number ?? ''
  form.address_line = r.address_line
  form.latlng = { lat: r.lat, lng: r.lng }
  address.value = `${form.street} ${form.house_number}`.trim()
  results.value = []
}

// reverse-geocode when moving event pin (only if user didn't type address)
watch(
    () => form.event_latlng,
    async (pt) => {
      if (!pt || !pt.lat || !pt.lng) return
      if ((form.street || form.house_number) && !pickedThroughMap.value) {
        pickedThroughMap.value = false
        return
      }
      if (!form.street && !form.house_number) pickedThroughMap.value = true
      resultsMap.value = await reverse(pt.lat, pt.lng)
      if (resultsMap.value) pickSuggestionMap(resultsMap.value)
    }
)

// debounce address search
watchDebounced(
    address,
    async (val) => {
      if (!val) {
        showResults.value = false
        results.value = []
        form.street = ''
        form.house_number = ''
        form.address_line = ''
        form.latlng = null
        pickedThroughMap.value = false
        return
      }
      if (val === `${form.street} ${form.house_number}`.trim()) return
      await search(val)
    },
    { debounce: 500 }
)

async function onSubmit() {
  const payload: EventDTO | undefined = serializeData()
  if (!payload) return
  emit('submit', payload)
}
</script>

<template>
  <CardContent class="space-y-4 w-full flex flex-col justify-center">
    <div>
      <Label for="title">Title</Label>
      <Input id="title" v-model="form.title" placeholder="Event title" />
      <p v-if="errors.title" class="text-sm text-red-600 mt-1">{{ errors.title }}</p>
    </div>

    <div>
      <Label for="desc">Description</Label>
      <textarea id="desc" v-model="form.description" rows="3" class="w-full rounded-md border px-3 py-2" />
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>Start date</Label>
        <DateTimePicker v-model="form.starts_at" />
        <p v-if="errors.starts_at" class="text-sm text-red-600 mt-1">{{ errors.starts_at }}</p>
      </div>
      <div>
        <Label>End date</Label>
        <DateTimePicker v-model="form.ends_at" />
        <p v-if="errors.ends_at" class="text-sm text-red-600 mt-1">{{ errors.ends_at }}</p>
      </div>
    </div>

    <div>
      <Label for="search">Search Address</Label>
      <Input id="search" v-model="address" placeholder="e.g. Ilica 10" />
      <p v-if="errors.street" class="text-sm text-red-600 mt-1">{{ errors.street }}</p>
    </div>

    <div class="relative">
      <div v-if="showResults" class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-black shadow">
        <button
            v-for="(r, i) in results" :key="i" type="button"
            class="block w-full text-left px-3 py-2 hover:bg-gray-500 text-sm"
            @click="pickSuggestion(r)"
        >
          {{ r.address_line.split(',').filter((_, idx) => idx <= 1).join(', ') }}
        </button>
      </div>
      <div v-if="geoLoading" class="text-xs text-gray-500 mt-1">Searching…</div>
    </div>

    <div class="flex flex-col gap-4">
      <div>
        <Label>Full Selected Address</Label>
        <Input v-model="form.address_line" :disabled="true" />
      </div>
      <div>
        <Label>Street</Label>
        <Input v-model="form.street" :disabled="true" />
      </div>
      <div>
        <Label>Street Number</Label>
        <Input v-model="form.house_number" :disabled="true" />
      </div>
    </div>

    <div class="z-0">
      <MapPicker
          v-model="form.event_latlng"
          :zoom="!form.event_latlng ? undefined : 17"
      />
      <p v-if="errors.event_latlng" class="text-sm text-red-600 mt-1">{{ errors.event_latlng }}</p>
    </div>
  </CardContent>

  <CardFooter class="flex gap-3">
    <Button variant="outline" type="button" :disabled="loading" @click="$emit('cancel')">Cancel</Button>
    <Button type="button" :disabled="loading" @click="onSubmit">{{ submitLabel ?? 'Save' }}</Button>
  </CardFooter>
</template>
