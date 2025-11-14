import { api } from '@/api/api'
import type { User, UsersQuery, UserListResponse } from '@/types/user'

export const usersApi = {
    async index(params?: UsersQuery): Promise<UserListResponse> {
        const { data } = await api.get('/users',{ params })
        return data
    },

    async get(id:number): Promise<User>{
        const { data } = await api.get(`/users/${id}`)
        return data.data
    },

    async create(payload: Partial<User> & {password:string}): Promise<User>{
        const { data } = await api.post('/users', payload)
        return data.data
    },

    async update(id:number, payload: Partial<User> & {password?:string}): Promise<User>{
        const { data } = await api.put(`/users/${id}`, payload)
        return data.data
    },

    async remove(id:number): Promise<void>{
        await api.delete(`/users/${id}`)
    },
}