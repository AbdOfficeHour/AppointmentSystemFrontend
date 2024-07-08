import { createRouter, createWebHistory } from 'vue-router'

import HomeViewOfficeHour from "@/views/HomeViewOfficeHour.vue";
import HomeViewClassroom from "@/views/HomeViewClassroom.vue";
import Appointment from "@/views/Appointment.vue";
import Approve from "@/views/Approve.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { // 教室预约首页 - 默认
      path: '/',
      name: 'HomeViewClassroomWithNone',
      component: HomeViewClassroom
    },
    { // 教室预约首页
      path: '/index/classroom',
      name: 'HomeViewClassroom',
      component: HomeViewClassroom
    },
    { // OfficeHour预约首页
      path: '/index/officehour',
      name: 'HomeViewOfficeHour',
      component: HomeViewOfficeHour
    },
    { // 预约列表首页
      path: '/list',
      name: 'Appointment',
      component:Appointment
    },
    { // 审批列表首页
      path: '/approve',
      name: 'approve',
      component: Approve
    }
  ]
})

export default router
