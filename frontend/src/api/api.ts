import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useToastStore } from '@/stores/toast'

const http = axios.create({
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
})

export const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
})

// --- CSRF bootstrap + refresh ---
let csrfReady = false
let refreshing: Promise<void> | null = null

export async function fetchCsrf(): Promise<void> {
    if (csrfReady) return
    if (!refreshing) {
        refreshing = http.get('/sanctum/csrf-cookie').then(() => { csrfReady = true })
            .finally(() => { refreshing = null })
    }
    return refreshing
}

async function refreshCsrf(): Promise<void> {
    csrfReady = false
    return fetchCsrf()
}

api.interceptors.response.use(
    (res) => res,
    async (error: AxiosError<any>) => {
        const toast = useToastStore()
        const cfg = error.config as (InternalAxiosRequestConfig & { _retried?: boolean })

        const status = error.response?.status
        const message = (error.response?.data as any)?.message

        if (status === 419 && !cfg?._retried) {
            try {
                await refreshCsrf()
                cfg._retried = true
                return api.request(cfg)
            } catch {/* fallthrough to error handler */}
        }

        if (status) {
            toast.showToast({
                title: `Error ${status}`,
                description: message || `Error ${status}`,
                variant: 'destructive',
            })
        } else {
            toast.showToast({
                title: 'Network error',
                description: 'Could not connect to the server.',
                variant: 'destructive',
            })
        }

        return Promise.reject(error)
    }
)
