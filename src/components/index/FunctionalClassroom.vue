<script setup>
import router from "@/router/index.js";
import axios from "axios";
import { onMounted, ref, watch } from 'vue';

import DisableTimeSlot from "@/components/index/DisableTimeSlot.vue";
import {ElMessage} from "element-plus";
import ConflictInfo from "@/components/index/ConflictInfo.vue";


// 接收父组件传递的props
const props = defineProps({
  authorityTable: Object, // 用户权限表
  backendData: Object, // 后端返回时间表，用于限制禁用时段的选择范围
  classroomId: String // 用户选中操作的教室ID
})

// FunctionalClassroom组件全局变量定义
let local_authorityTable = ref(null); // 父组件传入的用户权限表，本地暂存
let local_backendData = ref(null); // 父组件传入的后端返回时间表，本地暂存
let isDialogVisible = ref(false); // 禁用时段弹框是否可见
let local_classroomId = ref(null); // 被选中的教室对应的数据库ID
let conflict_info = ref(null); // 冲突信息
let is_conflict_info_visible = ref(false); // 冲突信息是否可见


/**
 * FunctionalClassroom组件初始化
 */
onMounted(() => {
  console.log('FunctionalClassroom组件开始挂载');
});

/**
 * 监听父组件传入参数变更
 */
watch(props, (newVal) => {
  local_authorityTable.value = newVal.authorityTable;
  local_backendData.value = newVal.backendData;
  local_classroomId.value = newVal.classroomId;
})

/**
 * 当用户点击预约按钮时触发
 * 根据用户当前所在平台和选择的教师/教室跳转至对应的预约页面
 */
const navigateToAppointment = () => {
  router.push({
    name: 'Appointment', // 跳转至预约列表页面
    query: {
      if_appointment: true,
      type: "classroom"
    }
  })
};

/**
 * 当用户点击禁用时段按钮时触发
 * 弹出禁用时段弹框表单
 */
const banTimeShow = () => {
  isDialogVisible.value = true
};

/**
 * 当用户点击禁用时段弹框表单的提交按钮时触发
 * 关闭窗口，表单数据提交由子组件DisableTimeSlot处理
 */
const handleDisableTimeSlotSubmit = (timeForm) => {
  axios({
    method: 'post',
    url: `/TableInfo/banclass/${local_classroomId.value}`,
    data: {
      startDate: timeForm.startDate,
      endDate: timeForm.endDate,
      startTime: timeForm.startTime,
      endTime: timeForm.endTime
    }
  }).then(res => {
    if (res.data.code === 0) {
      confirm('禁用时段成功')
      console.log(res.data)
      location.reload();
    }
    else if (res.data.code === 101) {
      is_conflict_info_visible.value = true
      conflict_info.value = res.data.data.conflict_period
      console.log(conflict_info.value)
    }
    else {
      alert('禁用时段失败')
      console.log(res.data.message)
    }
  })
  isDialogVisible.value = false
};

/**
 * 当用户点击禁用时段弹框表单的关闭按钮时触发
 * 关闭窗口
 */
const handleDisableTimeSlotClose = () => {
  isDialogVisible.value = false
};
</script>

<template>
  <div class="functional-container">
    <div class="flex-container">
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
      <div class="button-layer">
        <div class="appointment-button">
          <ElButton type="primary" round @click="navigateToAppointment">发起预约 Appointment</ElButton>
        </div>
        <div v-if="authorityTable['classroom:approve']" class="ban-button">
          <ElButton type="danger" round @click="banTimeShow">禁用时段 Disable Time Slot</ElButton>
        </div>
      </div>
    </div>
  </div>
  <div class="ban-layer">
    <DisableTimeSlot
        :isDialogVisible="isDialogVisible"
        :backend-data="local_backendData"
        :is-office-hour="false"
        @submit="handleDisableTimeSlotSubmit"
        @close="handleDisableTimeSlotClose">
    </DisableTimeSlot>
  </div>
  <ConflictInfo
    :dialogVisible="is_conflict_info_visible"
    :conflict-info="conflict_info"
    @closeDialog="is_conflict_info_visible = false"
  />
</template>

<style scoped>
.functional-container {
  padding: 16px;
}

.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.color-box {
  width: 16px;
  height: 16px;
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

.button-layer {
  display: flex;
  align-items: center;
  gap: 16px;
}

.appointment-button,
.ban-button {
  margin-left: 8px;
}
</style>
