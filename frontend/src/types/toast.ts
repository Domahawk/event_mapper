export interface Toast {
    id: number
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success' | 'info'
    duration?: number
}