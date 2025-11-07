<script setup lang="ts">
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import EventForm from '@/components/EventForm.vue'
import { eventsApi } from '@/api/events'
import { useToastStore } from '@/stores/toast'
import { useRouter } from 'vue-router'
import type {Event, EventDTO} from '@/types/event'

const toast = useToastStore()
const router = useRouter()

async function handleSubmit(payload: EventDTO) {
  const ev: Event | undefined = await eventsApi.create(payload)
  toast.showToast({ title: 'Event created', description: 'Successfully created.' })
  await router.replace({ name: 'eventDetails', params: { id: ev.id } })
}
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <Card>
      <CardHeader><CardTitle>Create Event</CardTitle></CardHeader>
      <EventForm @submit="handleSubmit" />
    </Card>
  </div>
</template>
