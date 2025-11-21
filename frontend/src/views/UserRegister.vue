<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {usersApi} from "@/api/users.ts";

const router = useRouter()
const auth = useAuthStore()
const toastStore = useToastStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const loading = ref(false)
const errors = reactive<Record<string, string>>({})

function clearErrors() {
  Object.keys(errors).forEach(k => delete errors[k])
}

async function onSubmit() {
  if (loading.value) return
  loading.value = true
  clearErrors()

  try {
    await usersApi.create(form)

    toastStore.showToast({
      title: 'Registration successful',
      description: `Welcome, ${auth.user?.name}`,
      variant: 'success',
    })

    await router.push({ name: 'login' })
  } catch (e: any) {
    loading.value = false

    if (e?.response?.status === 422) {
      const v = e.response.data?.errors || {}
      for (const [field, msgs] of Object.entries(v)) {
        errors[field] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs)
      }
      return
    }
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>

      <form @submit.prevent="onSubmit">
        <CardContent class="space-y-4">
          <div>
            <Label for="name">Name</Label>
            <Input
                id="name"
                v-model="form.name"
                type="text"
                placeholder="John Doe"
                required
            />
            <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <Label for="email">Email</Label>
            <Input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                required
            />
            <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <Label for="password">Password</Label>
            <Input
                id="password"
                v-model="form.password"
                type="password"
                placeholder="********"
                required
            />
            <p v-if="errors.password" class="text-sm text-red-500 mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <Label for="password_confirmation">Confirm password</Label>
            <Input
                id="password_confirmation"
                v-model="form.password_confirmation"
                type="password"
                placeholder="********"
                required
            />
            <p v-if="errors.password_confirmation" class="text-sm text-red-500 mt-1">
              {{ errors.password_confirmation }}
            </p>
          </div>
        </CardContent>

        <CardFooter class="mt-[20px] flex justify-between items-center">
          <Button variant="outline" type="submit" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </Button>

          <RouterLink
              :to="{ name: 'login' }"
              class="text-sm underline text-muted-foreground"
          >
            Already have an account? Log in
          </RouterLink>
        </CardFooter>
      </form>
    </Card>
  </div>
</template>
