// src/api/events.ts
import { api } from './api'
import type {EventDTO, Event} from "@/types/event.ts";
import type {EventFilters} from "@/types/filters.ts";

export const eventsApi = {
    async all(params?: EventFilters) {
        const { data } = await api.get<Event[]>('/events', { params })
        return data
    },

    async get(eventId: number): Promise<Event> {
        const { data } = await api.get(`/events/${eventId}`)
        return data.data
    },

    async create(event: EventDTO): Promise<Event> {
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
