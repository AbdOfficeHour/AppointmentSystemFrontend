import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AppointmentListView from "@/views/AppointmentListView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/index',
      name: 'home',
      component: HomeView
    },
    {
      path:'/list',
      name: 'list',
      component: AppointmentListView
    }
  ]
})

export default router
