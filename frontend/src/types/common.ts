export interface LatLng  {
    lat: number | null
    lng: number | null
}

export interface GeoResult {
    id: number
    street: string
    house_number: string
    address_line: string
    lat: number
    lng: number
}
