<script setup>
import router from "@/router/index.js";
import {onMounted} from "vue";

onMounted(() => {
  /**
   * 组件初始化
   */
  console.log('FunctionalClassroom组件开始挂载');
});

const navigateToAppointment = () => {
  /**
   * 当用户点击预约按钮时触发
   * 根据用户当前所在平台和选择的教师/教室跳转至对应的预约页面
   */
  router.push({
    name: 'Appointment', // 跳转至预约列表页面
    query: {
      if_appointment: true
    }
  })
};
</script>

<template>
  <div class="functional-container">
    <div class="legend">
      <div class="legend-item">
        <span class="color-box free"></span>
        <span>空闲，可以预约 Available by appointment</span>
      </div>
      <div class="legend-item">
        <span class="color-box busy"></span>
        <span>繁忙，不可预约 Not Available by appointment</span>
      </div>
    </div>
    <div class="appointment-button">
      <ElButton type="primary" round @click="navigateToAppointment">发起预约 Appointment</ElButton>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.color-box.free {
  background-color: #b7caea;
  border-style: solid;
}

.color-box.busy {
  background-color: #b0aeae;
  border-style: solid;
}

.functional-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: #F0F5FF;
  padding: 16px;
}
</style>
