<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import MapPicker from '@/components/MapPicker.vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { eventsApi } from '@/api/events'
import type { Event } from '@/types/event'
import { Calendar, MapPin, Clock, User as UserIcon, ArrowLeft, Pencil, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const auth = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)
const eventData = ref<Event | null>(null)

const isOwnerOrAdmin = computed(() => {
  if (!eventData.value || !auth.user) return false
  return auth.isAdmin || eventData.value.organizer?.id === auth.user.id
})

const mapPoint = computed(() => {
  if (!eventData.value) return null

  return { lat: eventData.value.lat, lng: eventData.value.lng }
})

const streetHouseNumber = computed(() => {
  const a = eventData.value?.address
  if (!a) return ''

  if (a.house_number) {
    return `${a.street} ${a.house_number}`
  }

  return a.street
})

const dateRange = computed(() => {
  if (!eventData.value) return ''
  const s = dayjs(eventData.value.starts_at)
  const e = dayjs(eventData.value.ends_at)

  if (s.isSame(e, 'day')) {
    return `${s.format('DD.MM.YYYY. HH:mm')} – ${e.format('HH:mm')}`
  }

  return `${s.format('DD.MM.YYYY. HH:mm')} → ${e.format('DD.MM.YYYY. HH:mm')}`
})

const fetchEvent = async (): Promise<void> => {
  loading.value = true
  error.value = null
  try {
    const id = Number(route.params.id)
    const ev = await eventsApi.get(id)
    eventData.value = ev
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load event.'
  } finally {
    loading.value = false
  }
}

const goBack = ():void => {
  if (window.history.length > 1) router.back()
  else router.replace({ name: 'events' })
}

const deleteEvent = async ():Promise<void> => {
  if (!eventData.value) return
  const ok = window.confirm('Are you sure you want to delete this event?')
  if (!ok) return

  try {
    // await eventsApi.delete(eventData.value.id)
    toast.showToast({ title: 'Event deleted', description: 'The event has been removed.' })
    await router.replace({name: 'events'})
  } catch (e: any) {
    toast.showToast({
      title: 'Delete failed',
      description: e?.response?.data?.message || 'Could not delete the event.',
      variant: 'destructive',
    })
  }
}

const editEvent = ():void => {
  if (!eventData.value) return
  router.push({ name: 'eventEdit', params: { id: eventData.value.id } })
}

onMounted(fetchEvent)
</script>

<template>
  <div class="mx-auto max-w-5xl p-4">
    <Card v-if="loading">
      <CardHeader><CardTitle>Loading event…</CardTitle></CardHeader>
      <CardContent>
        <div class="h-6 w-1/2 animate-pulse rounded bg-muted mb-3"></div>
        <div class="h-4 w-1/3 animate-pulse rounded bg-muted mb-6"></div>
        <div class="h-72 animate-pulse rounded bg-muted"></div>
      </CardContent>
    </Card>

    <Card v-else-if="error">
      <CardHeader><CardTitle>Could not load event</CardTitle></CardHeader>
      <CardContent>
        <p class="text-red-500">{{ error }}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" @click="fetchEvent">Retry</Button>
      </CardFooter>
    </Card>

    <Card v-else>
      <CardHeader class="flex flex-col">
        <CardTitle class="text-2xl">{{ eventData?.title }}</CardTitle>
        <div class="mt-2 flex flex-col gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4" />
            <span>{{ dateRange }}</span>
          </div>
          <div class="flex items-center gap-2" v-if="streetHouseNumber">
            <MapPin class="h-4 w-4" />
            <span>{{ streetHouseNumber }}</span>
          </div>
          <div class="flex gap-2">
            <MapPin class="min-h-4 min-w-4 w-4 h-4" />
            <span>{{ eventData?.address.address_line }}</span>
          </div>
          <div class="flex items-center gap-2" v-if="eventData?.organizer">
            <UserIcon class="h-4 w-4" />
            <span>Organizer: {{ eventData?.organizer?.name }}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <section v-if="eventData?.description">
          <h3 class="mb-2 font-semibold">Description</h3>
          <p class="whitespace-pre-line leading-relaxed">
            {{ eventData?.description }}
          </p>
        </section>

        <section>
          <h3 class="mb-2 font-semibold">Location</h3>
          <div class="rounded-xl border overflow-hidden">
            <MapPicker
                :model-value="mapPoint"
                :readonly="true"
                height-class="h-72"
                :auto-focus="true"
                :focus-zoom="16"
                :zoom="17"
            />
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <Button variant="outline" size="sm"
                    v-if="mapPoint"
                    :as="`a`"
                    :href="`https://www.openstreetmap.org/?mlat=${mapPoint.lat}&mlon=${mapPoint.lng}#map=18/${mapPoint.lat}/${mapPoint.lng}`"
                    target="_blank" rel="noopener">
              <MapPin class="mr-2 h-4 w-4" /> Open in OSM
            </Button>
            <Button variant="outline" size="sm"
                    v-if="mapPoint"
                    :as="`a`"
                    :href="`https://www.google.com/maps/search/?api=1&query=${mapPoint.lat},${mapPoint.lng}`"
                    target="_blank" rel="noopener">
              <Clock class="mr-2 h-4 w-4" /> Open in Google Maps
            </Button>
          </div>
        </section>
      </CardContent>

      <CardFooter class="flex gap-3">
        <Button variant="outline" @click="goBack">
          <ArrowLeft class="mr-2 h-4 w-4" /> Back
        </Button>
        <div class="ml-auto flex items-center gap-2" v-if="isOwnerOrAdmin">
          <Button variant="outline" @click="editEvent">
            <Pencil class="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" @click="deleteEvent">
            <Trash2 class="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  </div>
</template>
