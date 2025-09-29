import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLoginView from '@/views/AdminLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path:'/dashboard/login',
      name:'adminLogin',
      component: AdminLoginView
    },
    {
      path:'/dashboard/:name',
      name:'dashboard',
      component: () => import('../views/DashboardView.vue')
    },
    
  ],
})

export default router
