export interface EventFilters {
    q?: string
    city?: string
    starts_at?: string // ISO or 'YYYY-MM-DDTHH:mm'
    ends_at?: string   // same format
    mine?: boolean
}