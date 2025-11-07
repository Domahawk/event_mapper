export interface LatLng  {
    lat: number | null
    lng: number | null
}

export interface GeoResult {
    id?: number
    street: string
    house_number: string
    address_line: string
    lat: number
    lng: number
}

export interface EventForm {
    title: string
    description: string
    starts_at: string
    ends_at: string
    street: string
    house_number: string
    address_line: string
    latlng: LatLng | null
    event_latlng: LatLng | null
}
