<!-- src/components/admin/UserForm.vue -->
<script setup lang="ts">
import { reactive, computed } from 'vue'
import {Card, CardContent, CardFooter} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {Button} from "@/components/ui/button";
import type {EventDTO} from "@/types/event.ts";

export interface UserFormData {
  name: string
  email: string
  role: 'user' | 'admin'
  password?: string
}

const emit = defineEmits<{
  (e: 'submit', payload: UserFormData): void
}>()

const props = defineProps<{
  modelValue: UserFormData
}>()

const form = reactive({ ...props.modelValue })

const onSubmit = () => {
  emit('submit', form)
}

</script>

<template>
  <Card>
    <CardContent class="flex flex-col space-y-4 pt-6">
      <div class="space-y-5">
        <Label for="name">Name</Label>
        <Input id="name" v-model="form.name" />
      </div>

      <div class="space-y-5">
        <Label for="email">Email</Label>
        <Input id="email" type="email" v-model="form.email"/>
      </div>

      <div class="space-y-5">
        <Label for="role">Role</Label>
        <select id="role" class="rounded-md border bg-black px-3 py-2 text-sm" v-model="form.role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="space-y-5">
        <Label for="password">Password</Label>
        <Input id="password" type="password"
               placeholder="••••••••"
               v-model="form.password"
        />
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="outline" @click="onSubmit">Submit</Button>
    </CardFooter>
  </Card>
</template>
