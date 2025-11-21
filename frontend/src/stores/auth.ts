// src/stores/auth.ts
import {ref, computed, watch} from 'vue'
import { defineStore } from 'pinia'
import {api, fetchCsrf} from "@/api/api.ts";
import type {User} from "@/types/user.ts";
import type {AxiosResponse} from "axios";

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isAuthenticated = computed(() => !!user.value)
    const STORAGE_KEY: string = 'user_data'
    const isAdmin = computed(() => user.value?.role === 'admin')

    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) user.value = JSON.parse(raw) as User
    } catch (_) {
        localStorage.removeItem(STORAGE_KEY)
    }

    watch(
        user,
        (val) => {
            if (val) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
            } else {
                localStorage.removeItem(STORAGE_KEY)
            }
        },
        { deep: true }
    )

    async function login(payload: { email: string; password: string }): Promise<void> {
        await fetchCsrf()
        const { data } = await api.post('/login', payload)
        user.value = data
    }

    async function logout(): Promise<AxiosResponse> {
        try {
            const response = await api.post('/logout')
            user.value = null
            return response
        } catch (error) {
            user.value = null
            throw error
        }
    }

    return {
        user,
        isAuthenticated,
        login,
        logout,
        isAdmin,
    }
})
