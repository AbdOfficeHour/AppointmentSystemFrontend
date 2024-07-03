import { createRouter, createWebHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import AppointmentComponent from "@/views/AppointmentView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/index',
      name: 'home_other',
      component: HomeView
    },
    {
      path: '/list/appointment',
      name: 'Appointment',
      component: AppointmentComponent // 替换成预约列表界面实际组件名称
    }
  ]
})

export default router
