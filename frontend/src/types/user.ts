export interface User {
    id: number
    name: string
    email: string
    role: 'user'|'admin'
    created_at: string
}

export interface UsersQuery {
    search?:string
    role?:'user'|'admin'|''
    page?:number
    per_page?:number
    sort?:string
    dir?:'asc'|'desc'
}

export interface UserListResponse {
    data: User[],
    current_page: number,
    last_page: number,
    total: number,
}
