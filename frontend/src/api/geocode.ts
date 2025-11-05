import { api } from '@/api/api'
import type {GeoResult} from "@/types/common.ts";


export async function geocode(address: string): Promise<GeoResult[]> {
    const { data } = await api.get('/geocode', {
        params: {
            address: address,
        } })
    return data.data as GeoResult[]
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
    const { data } = await api.get('/reverse', { params: { lat, lng } })
    return data.data
}
