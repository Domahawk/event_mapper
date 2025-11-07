<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import EventForm from '@/components/EventForm.vue'
import { eventsApi } from '@/api/events'
import { useToastStore } from '@/stores/toast'
import type { EventDTO, Event } from '@/types/event'
import {router} from "@/router";

const route = useRoute()
const toast = useToastStore()

const loading = ref(true)
const initial = ref<EventDTO>()

const setEventValues = (ev: Event): void => {
  initial.value = {
    title: ev.title,
    description: ev.description,
    starts_at: ev.starts_at,
    ends_at: ev.ends_at,
    street: ev.address?.street,
    house_number: ev.address?.house_number,
    address_line: ev.address?.address_line,
    lat: ev.address?.lat,
    lng: ev.address?.lng,
    event_lat: (ev as any).event_lat ?? ev.lat,
    event_lng: (ev as any).event_lng ?? ev.lng,
  }
}

const handleSubmit = async (payload: EventDTO): Promise<void> => {
  const id = Number(route.params.id)
  const ev: Event = await  eventsApi.update(id, payload)
  toast.showToast({ title: 'Event updated', description: 'Changes saved.' })

  await router.replace({name: 'eventDetails', params: {id: ev.id}})
}

onMounted(async () => {
  const ev = await eventsApi.get(Number(route.params.id))
  setEventValues(ev)
  loading.value = false
})
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <Card>
      <CardHeader><CardTitle>Edit Event</CardTitle></CardHeader>
      <EventForm v-if="initial" :initial="initial" :loading="loading" submit-label="Save changes" @submit="handleSubmit" />
    </Card>
  </div>
</template>
