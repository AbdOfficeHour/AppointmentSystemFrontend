import { createRouter, createWebHistory } from 'vue-router'
import LoginView from "@/views/LoginView.vue";
import HomeViewOfficeHour from "@/views/HomeViewOfficeHour.vue";
import HomeViewClassroom from "@/views/HomeViewClassroom.vue";
import AppointmentComponent from "@/views/AppointmentComponent.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/index/officehour',
      name: 'home_officehour',
      component: HomeViewOfficeHour
    },
    {
      path: '/index/classroom',
      name: 'home_classroom',
      component: HomeViewClassroom
    },
    {
      path: '/list/appointment',
      name: 'Appointment',
      component: AppointmentComponent // 替换成你的实际组件名称
    }
  ]
})

export default router
