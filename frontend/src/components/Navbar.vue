<script setup lang="ts">
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { RouterLink, useRoute } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import {router} from "@/router";
import UserIcon from "@/components/UserIcon.vue";

const route = useRoute()

interface Link {
  to: string,
  label: string,
  auth: boolean,
  admin?: boolean,
}

const links: Link[] = [
  { to: "/", label: "Home", auth: false },
  { to: "/events", label: "Events", auth: false },
  { to: "/events/create", label: "Create an Event", auth: true },
  { to: "/admin", label: "Admin", auth: true, admin: true },
]
const authStore = useAuthStore()

const shouldShow = (link: Link): boolean => {
  if (link.auth && !authStore.isAuthenticated) {
    return false
  }

  return !(link.admin && !authStore.isAdmin);
}

const logout = async () => {
  const response = await authStore.logout()

  if (response.status === 200) {
    await router.replace({name: 'home'})
  }
}

const toMe = (): void => {
  router.replace({name: 'userView', params: {id: authStore.user?.id}})
}
</script>

<template>
  <header class="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50 h-fit flex items-center">
    <div class="flex items-center justify-between p-4 w-full">
      <RouterLink to="/" class="font-bold text-xl text-neon-cyan hover:text-neon-green transition-colors">
        Event Mapper
      </RouterLink>

      <NavigationMenu>
        <NavigationMenuList class="hidden md:flex space-x-6">
          <NavigationMenuItem
              v-for="link in links"
              :key="link.to"
          >
            <RouterLink
                :to="link.to"
                v-if="shouldShow(link)"
            >
              <NavigationMenuLink
                  :class="[
                  'px-3 py-2 rounded-md font-medium transition-colors',
                  route.path === link.to
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'text-zinc-300 hover:text-neon-pink hover:bg-zinc-800'
                ]"
              >
                {{ link.label }}
              </NavigationMenuLink>
            </RouterLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Button v-if="!authStore.isAuthenticated" as-child variant="ghost" class="border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
        <RouterLink to="/login">Login</RouterLink>
      </Button>
      <div v-else class="flex justify-between items-center max-w-[500px] min-w-[7vw]">
        <UserIcon size="xl" @click="toMe" />
        <Button @click="logout" as-child variant="ghost" class="border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
          <p>Logout</p>
        </Button>
      </div>
    </div>
  </header>
</template>
