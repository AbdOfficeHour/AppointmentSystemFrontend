<script setup>
import { ref, onMounted, watch, nextTick, onUpdated } from 'vue';
import { useI18n } from "vue-i18n";
import { TableFormat, TimeFormat } from "@/utils/dataFormat.js";
import router from "@/router/index.js";
import TimeOccupationInfoBar from "@/components/index/timeOccupationInfoBar.vue";

// 接收父组件传递的props
const props = defineProps(
    [
      "backendData", // 后端返回的时间表数据，用于渲染时间表
      "authorityTable", // 用户的权限表数据
      "hasChosenClassroomFlag" // 是否已经选择了教室
    ]
);

// 定义 emit，用于向父组件发送事件
const emit = defineEmits(["loading-done"]);

const { t } = useI18n(); // 国际化翻译函数
let local_authorityTable = ref({}); // 本地权限表
let local_timeTable = ref(null); // 本地时间表
let local_hasChosenClassroomFlag = ref(null); // 本地是否已经选择了教室
let emptyTimeTableFlag = ref(true); // 空时间表标志

/**
 * @description 当用户点击时间表中的某一天时触发，跳转至预约页面
 */
const toAppointmentPage = () => {
  router.push({
    name: 'Appointment', // 跳转至预约列表页面
    query: {
      if_appointment: true,
      type: "classroom"
    }
  })
}

// 监听父组件传入的数据
watch(
  [() => props.backendData, () => props.authorityTable, () => props.hasChosenClassroomFlag], // 监听多个依赖
  ([newBackendData, newAuthorityTable]) => {
    if (newBackendData === null) {
      // 父组件传入后端时间表数据为空，则渲染空时间表提示
      emptyTimeTableFlag.value = true;
    }
    else {
      emptyTimeTableFlag.value = false;
      local_timeTable.value = newBackendData;
    }

    if (newAuthorityTable) {
      // 父组件传入了权限表数据，按照权限表数据渲染
      local_authorityTable.value = newAuthorityTable;
    }
    else {
      // 父组件传入权限表为空
      local_authorityTable.value = {
        'OfficeHour:approve': false,
      };
    }

    local_hasChosenClassroomFlag.value = props.hasChosenClassroomFlag;
  },
  { immediate: true } // 在组件初始化时立即执行一次回调
);

// Mounted生命周期钩子，初始化时间表数据，通知父组件加载完成
onMounted(() => {
  emptyTimeTableFlag.value = props.backendData === null;
  nextTick(() => {
    emit("loading-done");
  });
});

// Mounted生命周期钩子，通知父组件加载完成
onUpdated(() => {
  nextTick(() => {
    emit("loading-done");
  });
})
</script>

<template>
  <div class="table-component">
    <div v-if="emptyTimeTableFlag" class="prompt-body">
      <div class="empty-prompt" v-if="local_hasChosenClassroomFlag">{{ t("index.empty_prompt") }}</div>
      <div class="empty-prompt" v-else>{{ t("index.classroom_empty_prompt") }}</div>
    </div>
    <div v-else class="table-body">
      <div v-for="date in local_timeTable.timeTable" :key="date" class="for-div">
        <div class="single-bar" @click="toAppointmentPage">
          <div class="bar-title-classroom">
            {{ t("index.bar-title-classroom") }}{{local_timeTable.classroom}}
          </div>
          <div class="date-info">
            {{ t("index.bar-date-info") }}{{ TimeFormat.formatTimestamp(date.date, isDate=true) }}
          </div>
          <div class="time-bar">
            <TimeOccupationInfoBar
              :availableData="TableFormat.start2startTime_format(date.available)"
              :waitingData="TableFormat.start2startTime_format(date.waiting)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.for-div {
  height: auto;
}

.table-component {
  height: auto;
}

.time-bar {
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 5px;
  background-color: #ffffff;
}

.bar-title-classroom {
  margin-top: 10px;
  margin-left: 10px;
}

.date-info {
  margin-top: 10px;
  margin-left: 10px;
}

.table-body {
  display: flex;
  flex-direction: column;
  background-color: inherit;
  height: auto;
  width: 100%;
}

.single-bar {
  display: flex;
  flex-direction: column;
  width: 95%;
  margin-left: 2.5%;
  margin-right: 2.5%;
  margin-top: 20px;
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.prompt-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: auto;
  width: 100%;
}

.empty-prompt {
  text-align: center;
  color: gray;
  margin-top: 20px;
  font-size: 18px;
  width: 100%;
}
</style>