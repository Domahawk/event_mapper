<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import {useToastStore} from "@/stores/toast.ts";

const router = useRouter()
const auth = useAuthStore()
const toastStore = useToastStore()

const form = reactive({
  email: '',
  password: '',
})
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await auth.login(form)
    toastStore.showToast({
          title: 'Login success!',
          description: `Welcome back, ${auth.user?.name}`,
          variant: 'success'
    })
    await router.push({name: 'home'})
  } catch (e:any) {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[70vh] flex items-center justify-center p-4">
    <Card class="w-full max-w-md">

      <CardHeader class="flex justify-center">
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <form @submit.prevent="onSubmit">
        <CardContent class="space-y-4">
          <div>
            <Label class="mb-5" for="email">Email</Label>
            <Input
                id="email"
                type="email"
                v-model="form.email"
                placeholder="you@example.com"
                required
            />
          </div>
          <div>
            <Label class="mb-5" for="password">Password</Label>
            <Input
                id="password"
                type="password"
                v-model="form.password"
                placeholder="********"
                required
            />
          </div>
        </CardContent>
        <CardFooter class="flex justify-between items-center mt-5">
          <Button class="border-1" type="submit" :disabled="loading">
            {{ loading ? 'Loading...' : 'Log in' }}
          </Button>
        </CardFooter>
      </form>

    </Card>
  </div>
</template>
