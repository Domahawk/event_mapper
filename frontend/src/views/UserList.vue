<!-- src/views/admin/UsersList.vue -->
<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import { usersApi } from '@/api/users.ts'
import type {User, UserListResponse, UsersQuery} from '@/types/user'
import { useToastStore } from '@/stores/toast'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { watchDebounced } from "@vueuse/core";

interface Meta {
  current_page:number
  last_page:number
  total:number
}

const router = useRouter()
const toast = useToastStore()

const rows = ref<User[]>([])
const loading = ref(false)
const meta = ref<Meta>({
  current_page: 0,
  last_page: 0,
  total: 0,
})

const q = ref<UsersQuery>({
  search: '',
  role: '',
  page: 1,
  per_page: 10,
  sort: 'created_at',
  dir: 'desc',
})

async function load() {
  loading.value = true
  try {
    const res: UserListResponse = await usersApi.index(q.value)
    rows.value = res.data
    meta.value = {
      current_page: res.current_page,
      last_page: res.last_page,
      total: res.total,
    }
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  q.value.search = ''
  q.value.role = ''
  q.value.page = 1
  load()
}

function nextPage() {
  if (!meta.value) return
  if (q.value.page! < meta.value.last_page) {
    q.value.page!++
    load()
  }
}
function prevPage() {
  if (!meta.value) return
  if (q.value.page! > 1) {
    q.value.page!--
    load()
  }
}

function createUser() {
  router.push({ name: 'adminUsersCreate' })
}
function editUser(u: User) {
  router.push({ name: 'adminUsersEdit', params: { id: u.id } })
}
async function deleteUser(u: User) {
  const ok = window.confirm(`Delete user "${u.email}"?`)
  if (!ok) return
  try {
    await usersApi.remove(u.id)
    toast.showToast({ title: 'Deleted', description: 'User removed.' })
    await load()
  } catch (e:any) {
    toast.showToast({ title: 'Error', description: e?.response?.data?.message ?? 'Delete failed.', variant: 'destructive' })
  }
}

const toUser = async (id: number): Promise<void> => {
  await router.replace({name: 'userView', params: { id: id }})
}

watchDebounced(
    q,
    () => load(),
    {
      deep: true,
      debounce: 400
    }
)

onMounted(load)
</script>

<template>
  <Card>
    <CardHeader class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <CardTitle>Users</CardTitle>
      <div class="flex flex-wrap gap-2">
        <Input v-model="q.search" placeholder="Search name or email…" @keyup.enter="q.page = 1; load()" />
        <select v-model="q.role" class="rounded-md border bg-black px-3 py-2 text-sm">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <Button variant="outline" @click="resetFilters">Reset</Button>
        <Button @click="createUser">New user</Button>
      </div>
    </CardHeader>

    <CardContent>
      <Table>
        <TableCaption v-if="!loading && rows?.length === 0">No users found</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead class="w-1/4">Name</TableHead>
            <TableHead class="w-1/4">Email</TableHead>
            <TableHead class="w-1/6">Role</TableHead>
            <TableHead class="w-1/6">Created</TableHead>
            <TableHead class="w-1/6 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="u in rows" :key="u.id" class="hover:bg-zinc-800/40" @click="toUser(u.id)">
            <TableCell>{{ u.name }}</TableCell>
            <TableCell class="truncate">{{ u.email }}</TableCell>
            <TableCell class="uppercase text-xs">{{ u.role }}</TableCell>
            <TableCell>{{ new Date(u.created_at).toLocaleDateString() }}</TableCell>
            <TableCell class="text-right space-x-2">
              <Button size="sm" variant="outline" @click="editUser(u)">Edit</Button>
              <Button size="sm" variant="destructive" @click="deleteUser(u)">Delete</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Page {{ meta?.current_page ?? 0 }} / {{ meta?.last_page ?? 0 }} • {{ meta?.total ?? 0 }} total
        </div>
        <div class="space-x-2">
          <Button variant="outline" :disabled="(meta?.current_page ?? 1) <= 1" @click="prevPage">Prev</Button>
          <Button variant="outline" :disabled="(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)" @click="nextPage">Next</Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
