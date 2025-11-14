import type {City} from "@/types/city";

export interface Address {
    id: number
    city_id: number | null
    address_line: string
    street: string
    house_number: string
    lat: number
    lng: number
    city?: City
}
