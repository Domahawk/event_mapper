import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Home from "@/views/Home.vue";
import EventList from "@/views/EventList.vue";
import EventDetails from "@/views/EventDetails.vue";
import Login from "@/views/Login.vue";
import {useAuthStore} from "@/stores/auth.ts";
import EventCreate from "@/views/EventCreate.vue";
import EventEdit from "@/views/EventEdit.vue";

const routes: RouteRecordRaw[] = [
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
        path: '/events/edit/:id',
        name: 'eventEdit',
        component: EventEdit,
        meta: {
            requiresAuth: true
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
