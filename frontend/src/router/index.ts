import { createRouter, createWebHistory } from 'vue-router'
import Home from "@/views/Home.vue";
import EventList from "@/views/EventList.vue";
import EventDetails from "@/views/EventDetails.vue";
import Login from "@/views/Login.vue";
import {useAuthStore} from "@/stores/auth.ts";
import EventCreate from "@/views/EventCreate.vue";

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
    },
    {
        path: '/events',
        name: 'events',
        component: EventList,
    },
    {
        path: '/events/create',
        name: 'eventsCreate',
        component: EventCreate,
        meta : {
            requiresAuth: true
        }
    },
    {
        path: '/events/:id',
        name: 'eventDetails',
        component: EventDetails,
        meta: {
            requiresAuth: false
        }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
            requiresAuth: false
        }
    },

]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.isAuthenticated && to.meta.requiresAuth) {
        return {name: 'home'}
    }
})
