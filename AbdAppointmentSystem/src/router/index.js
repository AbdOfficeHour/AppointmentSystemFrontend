import { createRouter, createWebHistory } from 'vue-router'
import HomeView from "@/views/HomeView.vue";
import OfficeHourAppointment from "@/views/OfficeHourAppointment.vue";
import ClassroomAppointment from "@/views/ClassroomAppointment.vue";

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
      path: '/list/officehour',
      name: 'OfficeHourAppointment',
      component: OfficeHourAppointment // 替换成预约列表界面实际组件名称
    },
    {
      path: '/list/classroom',
      name: 'ClassroomAppointment',
      component: ClassroomAppointment // 替换成预约列表界面实际组件名称
    }
  ]
})

export default router
