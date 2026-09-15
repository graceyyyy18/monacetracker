import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import SignupPage from '../views/SignupPage.vue'
import { auth } from '../firebase'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage,
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = !!auth.currentUser

  if (requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    return '/home'
  }

  return true
})

export default router
