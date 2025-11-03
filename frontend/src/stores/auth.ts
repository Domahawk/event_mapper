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

    // 1) Restore from localStorage on store creation
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) user.value = JSON.parse(raw) as User
    } catch (_) {
        // ignore bad JSON
        localStorage.removeItem(STORAGE_KEY)
    }

    // 2) Keep localStorage in sync with user state
    watch(
        user,
        (val) => {
            if (val) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
            } else {
                localStorage.removeItem(STORAGE_KEY)
            }
        },
        { deep: true } // capture changes inside the object too
    )


    async function getUser(): Promise<void> {
        try {
            const { data } = await api.get('/user')
            user.value = data
        } catch {
            user.value = null
        }
    }

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
        getUser,
        login,
        logout,
    }
})
