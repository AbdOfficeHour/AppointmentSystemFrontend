<script setup>
import router from "@/router/index.js";
import {defineProps, onMounted, ref, watch} from 'vue';
import DisableTimeSlot from "@/components/index/DisableTimeSlot.vue";
import axios from "axios";

const props = defineProps({
  authorityTable: Object,
  backendData: Object,
  userId: String
})

let local_authorityTable = ref(null);
let local_backendData = ref(null);
let local_userId = ref(null);
let isDialogVisible = ref(false); // 禁用时段弹框是否可见

onMounted(() => {
  console.log('FunctionalOfficeHour组件开始挂载');
});

watch(props, (newVal, oldVal) => {
  local_authorityTable.value = newVal.authorityTable;
  local_backendData.value = newVal.backendData;
  local_userId.value = newVal.userId;
  console.log(newVal.userId)
})

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

const banTimeShow = () => {
  /**
   * 当用户点击禁用时段按钮时触发
   * 弹出禁用时段弹框表单
   */
  isDialogVisible.value = true
};

const handleDisableTimeSlotSubmit = (timeForm) => {
  /**
   * 当用户点击禁用时段弹框表单的提交按钮时触发
   * 关闭窗口，表单数据提交由子组件DisableTimeSlot处理
   */
  axios({
    method: 'post',
    url: `/User/ban/${local_userId.value}`,
    data: {
      startDate: timeForm.startDate,
      endDate: timeForm.endDate,
      startTime: timeForm.startTime,
      endTime: timeForm.endTime
    }
  }).then(res => {
    if (res.data.code === 0) {
      confirm('禁用时段成功')
    } else {
      alert('禁用时段失败，请检查禁用时段的合理性')
      console.log(res.data.message)
    }
  })
  isDialogVisible.value = false
};

const handleDisableTimeSlotClose = () => {
  /**
   * 当用户点击禁用时段弹框表单的关闭按钮时触发
   * 关闭窗口
   */
  isDialogVisible.value = false
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
    <div v-if="authorityTable['OfficeHour:appointment']" class="appointment-button">
      <ElButton type="primary" round @click="navigateToAppointment">发起预约 Appointment</ElButton>
    </div>
    <div v-if="authorityTable['OfficeHour:approve']" class="ban-button">
      <ElButton type="danger" round @click="banTimeShow">禁用时段 Disable Time Slot</ElButton>
      <ElButton type="primary" round @click="navigateToAppointment">查看我的预约 Appointment</ElButton>
    </div>
    <div class="ban-layer">
      <DisableTimeSlot
          :isDialogVisible="isDialogVisible"
          :backend-data="local_backendData"
          @submit="handleDisableTimeSlotSubmit"
          @close="handleDisableTimeSlotClose">
      </DisableTimeSlot>
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

.ban-button {
  margin-left: auto;
}

.appointment-button {
  margin-left: auto;
}
</style>
