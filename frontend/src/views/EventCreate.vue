<script setup lang="ts">
import {type Ref, ref, watch} from 'vue'
import { useRouter } from 'vue-router'
import MapPicker from '@/components/MapPicker.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import type {GeoResult} from "@/types/common.ts";
import {watchDebounced} from "@vueuse/core";
import DateTimePicker from "@/components/DateTimePicker.vue";
import {useEventForm} from "@/composables/useEventForm.ts";

const router = useRouter()
const { form, errors, results, showResults, geoLoading, pickedThroughMap, search, reverse, submit } = useEventForm()
const resultsMap = ref<GeoResult | null>(null)
const selectedAddressId = ref<number>(0)
const address: Ref<string> = ref('')

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

watch(
    () => form.event_latlng,
    async (pt) => {
      if (!pt || (!pt?.lat || !pt?.lng)) return

      if ((form.street || form.house_number) && !pickedThroughMap.value) {
        pickedThroughMap.value = false
        return
      }

      if (!form.street && !form.house_number) {
        pickedThroughMap.value = true
      }

      resultsMap.value = await reverse(pt.lat, pt.lng)

      if (!resultsMap.value) {
        return
      }

      pickSuggestionMap(resultsMap.value as GeoResult)
    }
)

watchDebounced(address, async (address: string) => await search(address), { debounce: 500 })
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <Card>
      <CardHeader><CardTitle>Create Event</CardTitle></CardHeader>
      <CardContent class="space-y-4 w-full flex flex-col justify-center">
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
                r.address_line.split(',').filter((element: string, index:number) => {
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
        <div class="z-0">
          <MapPicker v-model="form.event_latlng"/>
          <p v-if="errors.event_latlng" class="text-sm text-red-600 mt-1">{{ errors.event_latlng }}</p>
        </div>
      </CardContent>
      <CardFooter class="flex gap-3">
        <Button @click="submit">Save</Button>
        <RouterLink :to="{ name: 'events' }" class="px-4 py-2 rounded-md border">Cancel</RouterLink>
      </CardFooter>
    </Card>
  </div>
</template>
