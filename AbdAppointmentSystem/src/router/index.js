import { createRouter, createWebHistory } from 'vue-router'
import HomeViewOfficeHour from "@/views/HomeViewOfficeHour.vue";
import HomeViewClassroom from "@/views/HomeViewClassroom.vue";
import Appointment from "@/views/Appointment.vue";
import Approve from "@/views/Approve.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'HomeViewClassroomWithNone',
      component: HomeViewClassroom
    },
    {
      path: '/index/classroom',
      name: 'HomeViewClassroom',
      component: HomeViewClassroom
    },
    {
      path: '/index/officehour',
      name: 'HomeViewOfficeHour',
      component: HomeViewOfficeHour
    },
    {
      path: '/list',
      name: 'Appointment',
      component:Appointment
    },
    {
      path: '/approve',
      name: 'approve',
      component: Approve
    }
  ]
})

export default router
