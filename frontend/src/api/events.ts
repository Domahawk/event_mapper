// src/api/events.ts
import { api } from './api'
import type {CreateEventDTO, Event} from "@/types/event.ts";

export const eventsApi = {
    async all() {
        const { data } = await api.get<Event[]>('/events')
        return data
    },

    async get(eventId: number): Promise<Event> {
        const { data } = await api.get(`/events/${eventId}`)
        return data.data
    },

    async create(event: CreateEventDTO): Promise<Event> {
        const { data } = await api.post('/events', event)
        return data.data
    },

    async update(id: number, event: Partial<Event>) {
        const { data } = await api.put<Event>(`/events/${id}`, event)
        return data
    },

    async remove(id: number) {
        await api.delete(`/events/${id}`)
    },
}
