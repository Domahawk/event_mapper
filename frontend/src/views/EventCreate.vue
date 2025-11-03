<script setup lang="ts">
import {reactive, type Ref, ref, watch} from 'vue'
import { useRouter } from 'vue-router'
import MapPicker from '@/components/MapPicker.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useToastStore } from '@/stores/toast'
import type { CreateEventDTO } from '@/types/event'
import { useAuthStore } from '@/stores/auth'
import {geocode, type GeoResult, reverseGeocode} from "@/api/geocode.ts";
import Event from '@/types/event.ts'
import {watchDebounced} from "@vueuse/core";
import {eventsApi} from "@/api/events.ts";

type LatLng = { lat: number; lng: number }

type Form = {
  title: string
  description: string
  street: string
  house_number: string
  address_line: string
  starts_at: string
  ends_at: string
  latlng: LatLng | null
  event_latlng: LatLng | null
}

const router = useRouter()
const toastStore = useToastStore()
const authStore = useAuthStore()

const form = reactive<Form>({
  title: '',
  description: '',
  street: '',
  house_number: '',
  address_line: '',
  starts_at: '',
  ends_at: '',
  latlng: null,
  event_latlng: null,
})

const results = ref<GeoResult[]>([])
const resultsMap = ref<GeoResult | null>(null)
const showResults = ref(false)
const geoLoading = ref(false)
const errors = reactive<Record<string, string>>({})
const selectedAddressId = ref<number>(0)
const address: Ref<string> = ref('')
const pickedThoughMap: Ref<boolean> = ref(false)

const pickSuggestion = (r: GeoResult): void => {
  selectedAddressId.value = r.id
  form.street = r.street
  form.house_number = r.house_number ?? ''
  form.address_line = r.address_line
  address.value = `${form.street} ${form.house_number}`
  form.latlng = { lat: r.lat, lng: r.lng }
  if (!form.event_latlng) form.event_latlng = form.latlng
  results.value = []
  showResults.value = false
}

const pickSuggestionMap = (r: GeoResult): void => {
  selectedAddressId.value = r.id
  form.street = r.street
  form.house_number = r.house_number ?? ''
  form.address_line = r.address_line
  address.value = `${form.street} ${form.house_number}`
  form.latlng = { lat: r.lat, lng: r.lng }
  results.value = []
}

const validateForm = (): boolean => {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.title.trim()) errors.title = 'Title is mandatory.'
  if (!form.starts_at) errors.starts_at = 'Start date is mandatory.'
  if (!form.ends_at) errors.ends_at = 'End date is mandatory.'
  if (!form.latlng) errors.latlng = 'Map location required.'
  if (!form.street.trim()) errors.street = 'Street is mandatory.'

  return !Object.values(errors).some(Boolean)
}

const submit = async (): Promise<void> => {
  if (!validateForm() || !authStore.user || !form.event_latlng) return

  const payload: CreateEventDTO = {
    title: form.title,
    description: form.description,
    starts_at: form.starts_at,
    ends_at: form.ends_at,
    street: form.street,
    house_number: form.house_number,
    address_line: form.address_line,
    lat: form.latlng === null ? form.event_latlng.lat : form.latlng.lat,
    lng: form.latlng === null ? form.event_latlng.lng : form.latlng.lng,
    event_lat: form.event_latlng.lat,
    event_lng: form.event_latlng.lng,
    address_id: selectedAddressId.value,
  }

  const event: Event = await eventsApi.create(payload)

  toastStore.showToast({
    title: 'Event saved',
    description: 'Event logic executed (no API yet).'
  })

  await router.replace({
    name: 'eventDetails',
    params: {
      id: event.id
    }
  })
}

watch(
    () => form.event_latlng,
    async (pt) => {
      if (!pt) return

      if ((form.street || form.house_number) && !pickedThoughMap.value) {
        pickedThoughMap.value = false
        return
      }

      if (!form.street && !form.house_number) {
        pickedThoughMap.value = true
      }

      resultsMap.value = await reverseGeocode(pt.lat, pt.lng)

      if (!resultsMap.value) {
        return
      }

      pickSuggestionMap(resultsMap.value as GeoResult)
    }
)

watchDebounced(address, async (address: string) => {
      if (!address) {
        showResults.value = false
        results.value = []

        form.street = ''
        form.house_number = ''
        form.address_line = ''
        form.latlng = null
        form.event_latlng = null
        pickedThoughMap.value = false

        return
      }

      if (address === `${form.street} ${form.house_number}`) return

      geoLoading.value = true
      results.value = await geocode(address)
      showResults.value = results.value.length > 0
      geoLoading.value = false
    },
    { debounce: 500 }
)
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <Card>
      <CardHeader><CardTitle>Create Event</CardTitle></CardHeader>
      <CardContent class="space-y-4 w-full flex flex-col justify-center">

        <!-- Basic info -->
        <div>
          <Label for="title">Title</Label>
          <Input id="title" v-model="form.title" placeholder="Event title" />
          <p v-if="errors.title" class="flex-auto text-sm text-red-600 mt-1">{{ errors.title }}</p>
        </div>

        <div>
          <Label for="desc">Description</Label>
          <textarea id="desc" v-model="form.description" rows="3" class="w-full rounded-md border px-3 py-2" />
        </div>

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <Label for="start">Start date</Label>
            <Input id="start" type="datetime-local" v-model="form.starts_at" />
            <p v-if="errors.starts_at" class="text-sm text-red-600 mt-1">{{ errors.starts_at }}</p>
          </div>
          <div>
            <Label for="end">End date</Label>
            <Input id="end" type="datetime-local" v-model="form.ends_at" />
            <p v-if="errors.ends_at" class="text-sm text-red-600 mt-1">{{ errors.ends_at }}</p>
          </div>
        </div>

        <!-- Address search -->
        <div>
          <Label for="street">Search Address</Label>
          <Input
              id="street"
              v-model="address"
              placeholder="e.g. Ilica"
          />
          <p v-if="errors.street" class="text-sm text-red-600 mt-1">{{ errors.street }}</p>
        </div>
        <div class="relative">
          <div
              v-if="showResults"
              class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-black shadow"
          >
            <button
                v-for="(r, i) in results"
                :key="i"
                type="button"
                class="block w-full text-left px-3 py-2 hover:bg-gray-500 text-sm"
                @click="pickSuggestion(r)"
            >
              {{
                r.address_line.split(',').filter((element, index) => {
                  if (index === 0 || index === 1) {
                    return element
                  }
                }).join(', ')
              }}
            </button>
          </div>
          <div v-if="geoLoading" class="text-xs text-gray-500 mt-1">Searching…</div>
        </div>
        <div class="flex flex-col items-start justify-around w-full">
          <div class="w-full mb-5">
            <Label for="street">Full Selected Address</Label>
            <Input id="street" v-model="form.address_line" :disabled="true"/>
          </div>
          <div class="w-full mb-5">
            <Label for="street">Street</Label>
            <Input id="street" v-model="form.street" :disabled="true"/>
          </div>
          <div class="w-full">
            <Label for="street">Street Number</Label>
            <Input id="street" v-model="form.house_number" :disabled="true"/>
          </div>
          <p v-if="errors.street" class="text-sm text-red-600 mt-1">{{ errors.street }}</p>
        </div>

        <!-- Map -->
        <div class="z-0">
          <MapPicker v-model="form.event_latlng"/>
          <p v-if="errors.event_latlng" class="text-sm text-red-600 mt-1">{{ errors.event_latlng }}</p>
        </div>

        <div>
          <p> Address LatLng {{ form.latlng }} Event LatLng{{ form.event_latlng }}</p>
        </div>
      </CardContent>

      <CardFooter class="flex gap-3">
        <Button @click="submit">Save</Button>
        <RouterLink :to="{ name: 'events' }" class="px-4 py-2 rounded-md border">Cancel</RouterLink>
      </CardFooter>
    </Card>
  </div>
</template>
