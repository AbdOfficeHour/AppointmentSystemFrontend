<script setup>
import { ref, watch } from 'vue';
import { useI18n } from "vue-i18n";
import router from "@/router/index.js";
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import DisableTimeSlot from "@/components/index/disableTimeSlot.vue";
import ConflictInfo from "@/components/index/conflictInfo.vue";

// 接收父组件传递的props
const props = defineProps({
  authorityTable: Object, // 用户权限表
  backendData: Object, // 后端返回时间表，用于限制禁用时段的选择范围
  userId: String // 用户id
})

const { t } = useI18n(); // 国际化翻译函数
let local_authorityTable = ref(null); // 父组件传入的用户权限表，本地暂存
let local_backendData = ref(null); // 父组件传入的后端返回时间表，本地暂存
let local_userId = ref(null); // 父组件传入用户id，本地暂存
let isDialogVisible = ref(false); // 禁用时段弹框是否可见
let conflict_info = ref(null); // 冲突信息
let is_conflict_info_visible = ref(false); // 冲突信息是否可见

/**
 * @description 当用户点击预约按钮时触发
 * 根据用户当前所在平台和选择的教师/教室跳转至对应的预约页面
 * @returns {void}
 */
const navigateToAppointment = () => {
  router.push({
    name: 'Appointment', // 跳转至预约列表页面
    query: {
      if_appointment: true,
      type: "officeHour"
    }
  })
};

/**
 * @description 当用户点击禁用时段按钮时触发
 * 弹出禁用时段弹框表单
 * @returns {void}
 */
const banTimeShow = () => {
  isDialogVisible.value = true
};

/**
 * @description 当用户点击禁用时段弹框表单的提交按钮时触发
 * 关闭窗口，表单数据提交由子组件DisableTimeSlot处理
 * @param timeForm - 禁用时段表单数据
 * @returns {void}
 */
const handleDisableTimeSlotSubmit = (timeForm) => {
  axios({
    method: 'post',
    url: `/TableInfo/ban/${local_userId.value}`,
    data: {
      startDate: timeForm.startDate,
      endDate: timeForm.endDate,
      startTime: timeForm.startTime,
      endTime: timeForm.endTime
    }
  }).then(res => {
    if (res.data.code === 0) {
      confirm(t('index.ban_time_success'))
      location.reload();
    }
    else if (res.data.code === 101) {
      is_conflict_info_visible.value = true
      conflict_info.value = res.data.data.conflict_period
      console.log(conflict_info.value)
    }
    else {
      alert(t('index.ban_time_fail'))
      console.log(res.data.message)
    }
  })
  isDialogVisible.value = false
};

/**
 * @description 当用户点击禁用时段弹框表单的关闭按钮时触发
 * 关闭窗口
 * @returns {void}
 */
const handleDisableTimeSlotClose = () => {
  isDialogVisible.value = false
};

// 监听父组件传入的props
watch(props, (newVal) => {
  local_authorityTable.value = newVal.authorityTable;
  local_backendData.value = newVal.backendData;
  local_userId.value = newVal.userId;
})
</script>

<template>
  <div class="functional-container">
    <div class="flex-container">
      <div class="legend">
        <div class="legend-item">
          <span class="color-box free"></span>
          <span>{{ t("index.available_to_appoint") }}</span>
        </div>
        <div class="legend-item">
          <span class="color-box busy"></span>
          <span>{{ t("index.not_available_to_appoint") }}</span>
        </div>
        <div class="legend-item">
          <span class="color-box waiting"></span>
          <span>{{ t("index.waiting_to_appoint") }}</span>
        </div>
        <div class="legend-item">
          <img src="/icon/hint_black.svg" alt="hint" class="color-box"/>
          <span>{{ t("index.office_hour_hint") }}</span>
        </div>
      </div>
      <div class="button-layer">
        <div v-if="authorityTable['OfficeHour:appointment']" class="appointment-button">
          <ElButton type="primary" round @click="navigateToAppointment">{{ t("index.init_appointment") }}</ElButton>
        </div>
        <div v-if="authorityTable['OfficeHour:approve']" class="ban-button">
          <ElButton type="danger" round @click="banTimeShow">{{ t("index.disable_time_slot") }}</ElButton>
        </div>
      </div>
    </div>
  </div>
  <div class="ban-layer">
    <DisableTimeSlot
        :isDialogVisible="isDialogVisible"
        :backend-data="local_backendData"
        :is-office-hour="true"
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
  background-color: #71a66e;
  border-style: solid;
}

.color-box.busy {
  background-color: #b0aeae;
  border-style: solid;
}

.color-box.waiting {
  background-color: #f3ce63;
  border-style: solid;
}

.button-layer {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (min-width: 960px) {
  .button-layer {
    flex-direction: row;
  }
}

@media (max-width: 959px) {
  .button-layer {
    flex-direction: column;
  }
}

.appointment-button,
.ban-button {
  margin-left: 8px;
}
</style>
