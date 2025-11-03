import type {User} from "@/types/user.ts";
import type {Address} from "@/types/address.ts";

export interface Event {
    id: number
    title: string
    description: string
    address: Address
    starts_at: string
    ends_at: string
    organizer: User
    lat: number,
    lng: number,
}

export interface CreateEventDTO {
    title: string
    description: string
    street: string
    house_number: string
    address_line: string
    lat: number,
    lng: number,
    event_lat: number,
    event_lng: number,
    starts_at: string
    ends_at: string
    address_id: number
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}
