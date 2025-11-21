import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Home from "@/views/Home.vue";
import EventList from "@/views/EventList.vue";
import EventDetails from "@/views/EventDetails.vue";
import Login from "@/views/Login.vue";
import {useAuthStore} from "@/stores/auth.ts";
import EventCreate from "@/views/EventCreate.vue";
import EventEdit from "@/views/EventEdit.vue";
import AdminLayout from "@/layouts/AdminLayout.vue";
import UserList from "@/views/UserList.vue";
import UserCreateEdit from "@/views/UserCreateEdit.vue";
import UserView from "@/views/UserView.vue";
import UserRegister from "@/views/UserRegister.vue";

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
    {
        path: '/users/:id',
        name: 'userView',
        component: UserView,
        meta: {
            requiresAuth: true,
        },
        props: true,
    },
    {
        path: '/register',
        name: 'register',
        component: UserRegister,
        meta: {
            requiresAuth: false
        },
    },
    {
        path: '/admin',
        component: AdminLayout,
        redirect: {
            name: 'adminUsers'
        },
        meta: {
            requiresAuth: true,
            requiresAdmin: true,
        },
        children: [
            {
                path: 'users',
                name: 'adminUsers',
                component: UserList
            },
            {
                path: 'users/create',
                name: 'adminUsersCreate',
                component: UserCreateEdit
            },
            {
                path: 'users/:id',
                name: 'adminUsersEdit',
                component: UserCreateEdit
            },
        ]
    },

]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.isAuthenticated && to.meta.requiresAuth) {
        return { name: 'home' }
    }

    if (!auth.isAdmin && to.meta.requiresAdmin) {
        return { name: 'home' }
    }
})
