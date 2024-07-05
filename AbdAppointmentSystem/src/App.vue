<script setup>
import { RouterLink, RouterView } from 'vue-router'
import TabSelector from "@/components/TabSelector.vue";
import router from "@/router/index.js";

function handleTabChange(tab) {
  /**
   * 当接收到来自TabSelector组件传递的用户选择的平台变更时触发
   */
  if(tab === 'tutor'){ // 教师预约tutor平台
    router.push({
      name: 'HomeViewOfficeHour' // 跳转至教师预约页面
    })
  }
  else if (tab === 'room') { // 教室预约room平台
    router.push({
      name: 'HomeViewClassroom' // 跳转至教师预约页面
    })
  }
  else if (tab === 'appointment') {
    router.push({
      name: 'Appointment', // 跳转至我的预约页面
      query: {
        if_appointment: false
      }
    })
  }
}
</script>

<template>
  <div class="tab-selector">
    <TabSelector @update:selectedTab="handleTabChange"></TabSelector>
  </div>
  <RouterView />
</template>

<style scoped>

</style>
