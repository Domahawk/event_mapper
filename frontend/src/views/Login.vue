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
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">
        <div>
          <Label for="email">Email</Label>
          <Input
              id="email"
              type="email"
              v-model="form.email"
              placeholder="you@example.com"
          />
        </div>

        <div>
          <Label for="password">Password</Label>
          <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="********"
          />
        </div>
      </CardContent>

      <CardFooter class="flex justify-between items-center">
        <Button :disabled="loading" @click="onSubmit">
          {{ loading ? 'Loading...' : 'Log in' }}
        </Button>
<!--        <RouterLink-->
<!--            :to="{ name: 'register' }"-->
<!--            class="text-sm underline text-muted-foreground"-->
<!--        >-->
<!--          Nemate račun? Registrirajte se-->
<!--        </RouterLink>-->
      </CardFooter>
    </Card>
  </div>
</template>
