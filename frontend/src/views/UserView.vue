<!-- src/views/admin/UserView.vue -->
<script setup lang="ts">
import {computed, onMounted, type Ref, ref} from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { usersApi } from '@/api/users'
import type { User } from '@/types/user'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const props =defineProps<{
  id: string,
}>()

const user: Ref<User> = ref({} as User)
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const deleting = ref(false)
const isSelf = computed(() => auth.user?.id === user.value.id)

async function onEdit() {
  // Goes to your existing admin edit screen
  await router.push({name: 'adminUsersEdit', params: {id: user.value.id}})
}

async function onDelete() {
  const ok = window.confirm(
      isSelf.value
          ? 'Delete your account? You will be logged out.'
          : `Delete user "${user.value.email}"?`
  )
  if (!ok) return

  try {
    deleting.value = true
    await usersApi.remove(user.value.id)

    if (isSelf.value) {
      await auth.logout()
      toast.showToast({ title: 'Account deleted', description: 'You have been logged out.' })
      await router.replace({name: 'login'})
      return
    }

    toast.showToast({ title: 'Deleted', description: 'User removed.' })
    await router.replace({name: 'adminUsers'})
  } catch (e: any) {
    toast.showToast({
      title: 'Error',
      description: e?.response?.data?.message ?? 'Delete failed.',
      variant: 'destructive',
    })
  } finally {
    deleting.value = false
  }
}

const getUser = async (): Promise<void> => {
  user.value = await usersApi.get(Number(props.id))
}

onMounted(getUser)
</script>

<template>
  <div class="mx-auto max-w-3xl p-4">
    <Card>
      <CardHeader>
        <CardTitle>User</CardTitle>
      </CardHeader>

      <CardContent class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-muted-foreground">Name</div>
            <div class="font-medium">{{ user.name }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Email</div>
            <div class="font-medium truncate">{{ user.email }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Role</div>
            <div class="font-medium uppercase text-xs">{{ user.role }}</div>
          </div>
          <div>
            <div class="text-xs text-muted-foreground">Created</div>
            <div class="font-medium">{{ new Date(user.created_at).toLocaleString() }}</div>
          </div>
        </div>
      </CardContent>

      <CardFooter class="flex gap-2">
        <Button @click="onEdit">Update</Button>
        <Button variant="destructive" :disabled="deleting" @click="onDelete">
          {{ deleting ? 'Deleting...' : (isSelf ? 'Delete & Logout' : 'Delete') }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
