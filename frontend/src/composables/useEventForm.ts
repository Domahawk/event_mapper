import {reactive, type Ref, ref} from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { EventDTO } from '@/types/event'
import {geocode, reverseGeocode} from "@/api/geocode.ts";
import type {GeoResult, EventForm} from "@/types/common.ts";
import dayjs from "dayjs";

export function useEventForm(initial?: Partial<EventDTO>) {
    const auth = useAuthStore()
    const pickedThroughMap: Ref<boolean> = ref(false)
    const addressId: Ref<number | undefined> = ref()

    const form: EventForm = reactive({
        title: initial?.title ?? '',
        description: initial?.description ?? '',
        starts_at: initial?.starts_at ?? '',
        ends_at: initial?.ends_at ?? '',
        street: initial?.street ?? '',
        house_number: initial?.house_number ?? '',
        address_line: initial?.address_line ?? '',
        latlng: !initial?.lat || !initial.lng ? null : {
            lat: initial.lat,
            lng: initial.lng
        },
        event_latlng: !initial?.event_lat || !initial.event_lng ? null : {
            lat: initial.event_lat,
            lng: initial.event_lng
        },
    })

    const errors = reactive<Record<string, string>>({})

    const results = ref<GeoResult[]>([])
    const showResults = ref(false)
    const geoLoading = ref(false)

    async function search(address: string) {
        if (!address) {
            showResults.value = false
            results.value = []

            form.street = ''
            form.house_number = ''
            form.address_line = ''
            form.latlng = null
            form.event_latlng = null
            pickedThroughMap.value = false

            return
        }

        if (address === `${form.street} ${form.house_number}`) return

        geoLoading.value = true
        results.value = await geocode(address)
        showResults.value = results.value.length > 0
        geoLoading.value = false
    }

    async function reverse(lat: number, lng: number) {
        return await reverseGeocode(lat, lng)
    }

    const validate = (): boolean => {
        Object.keys(errors).forEach(k => delete errors[k])
        if (!form.title.trim()) errors.title = 'Title is mandatory.'
        if (!form.starts_at) errors.starts_at = 'Start date is mandatory.'
        if (!form.ends_at) errors.ends_at = 'End date is mandatory.'
        if (!form.latlng) errors.latlng = 'Map location required.'
        // if (!form.street.trim()) errors.street = 'Street is mandatory.'
        return !Object.values(errors).some(Boolean)
    }

    const serializeData = (): EventDTO | undefined => {
        if (!validate() || !auth.user) return

        return {
            title: form?.title ?? '',
            description: form?.description ?? '',
            starts_at: dayjs(form.starts_at).format('YYYY-MM-DD HH:mm:ss') ?? '',
            ends_at: dayjs(form.ends_at).format('YYYY-MM-DD HH:mm:ss') ?? '',
            street: form.street ?? '',
            house_number: form.house_number ?? '',
            address_line: form.address_line ?? '',
            lat:form.latlng?.lat as number,
            lng: form.latlng?.lng as number,
            event_lat: form.event_latlng?.lat as number,
            event_lng: form.event_latlng?.lng as number,
            organizer_id: auth.user.id,
            address_id: addressId.value ?? undefined
        }
    }

    return { form, errors, results, showResults, geoLoading, pickedThroughMap, addressId, search, reverse, validate, serializeData }
}
