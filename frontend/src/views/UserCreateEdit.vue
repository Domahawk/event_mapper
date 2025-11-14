<!-- src/views/admin/UserEdit.vue -->
<script setup lang="ts">
import {onMounted, ref, computed, reactive} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usersApi } from '@/api/users.ts'
import { type User } from '@/types/user'
import { useToastStore } from '@/stores/toast'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import UserForm, { type UserFormData } from '@/components/UserForm.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const id = computed(() => Number(route.params.id))
const isEdit = computed(() => !!route.params.id)

const form = ref<UserFormData>({})

const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const u = await usersApi.get(id.value)
    form.value = { name: u.name, email: u.email, role: u.role, password: '' }
  } catch (e:any) {
    toast.showToast({
      variant: 'destructive',
      title: 'Error',
      description: e
    })
  } finally {
    loading.value = false
  }
})

const handleSubmit = async (payload):void => {
  form.value = payload
  try {
    if (isEdit.value) {
      const payload: Partial<User> & { password?: string } = {
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
      }
      if (form.value.password) payload.password = form.value.password
      await usersApi.update(id.value, payload)
      toast.showToast({ title: 'Saved', description: 'User updated.' })
    } else {
      await usersApi.create({
        name: form.value.name,
        email: form.value.email,
        role: form.value.role,
        password: form.value.password || '',
      })
      toast.showToast({ title: 'Created', description: 'User created.' })
    }
    await router.replace({name: 'adminUsers'})
  } catch (e:any) {
    toast.showToast({ title: 'Error', description: e?.response?.data?.message ?? 'Save failed.', variant: 'destructive' })
  }
}
</script>

<template>
  <div>
    <Card v-if="loading">
      <CardHeader><CardTitle>Loading…</CardTitle></CardHeader>
    </Card>

    <Card v-else-if="error">
      <CardHeader><CardTitle>Error</CardTitle></CardHeader>
      <div class="p-4 text-red-500">{{ error }}</div>
    </Card>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between">
        <Button variant="outline" @click="router.back()">Cancel</Button>
      </div>

      <UserForm v-model="form" @submit="handleSubmit"/>
    </div>
  </div>
</template>
