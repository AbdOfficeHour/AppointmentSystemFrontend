<script setup>
import { ref, onMounted, watch, nextTick, onUpdated } from 'vue';
import { useI18n } from "vue-i18n";
import { TimeFormat, TableFormat } from "@/utils/dataFormat.js";
import router from "@/router/index.js";
import TimeOccupationInfoBar from "@/components/index/timeOccupationInfoBar.vue";

// 接收父组件传递的props
const props = defineProps(
    [
      "backendData", // 后端返回的时间表数据，用于渲染时间表
      "authorityTable", // 用户的权限表数据
    ]
);

// 定义 emit，用于向父组件发送事件
const emit = defineEmits(["loading-done"]);

const { t } = useI18n(); // 国际化翻译函数
let local_authorityTable = ref({}); // 本地权限表
let local_timeTable = ref(null); // 本地时间表
let officeHourDateList = ref([]) // 所有具有OfficeHour的日期的列表
let officeHourStartEndList = ref([]) // 具有OfficeHour日期对应的OfficeHour起始时间点，索引和officeHourDateList一致
let emptyTimeTableFlag = ref(true); // 空时间表标志
let noOfficeHourFlag = ref(false) // 有权限且是OfficeHour界面，但没有OfficeHour活动

/**
 * @description 处理时间表中的OfficeHour日期信息
 */
const handleOfficeHourDateInfo = () => {
  local_timeTable.value.officeHourTime.forEach(date => {
    officeHourDateList.value.push(date.date);
    officeHourStartEndList.value.push({
      startTime: date.start_time,
      endTime: date.end_time
    });
  });
};

/**
 * @description 当用户点击时间表中的某一天时触发，跳转至预约页面
 */
const toAppointmentPage = () => {
  if (local_authorityTable.value["OfficeHour:approve"] === true) {
    return;
  }
  router.push({
    name: 'Appointment',
    query: {
      if_appointment: true,
      type: "officeHour"
    }
  });
};

/**
 * @description 格式化教师办公室信息
 * @param room 教师办公室信息
 * @returns {string}
 */
const teacherRoomOutputFormat = (room) => room || "Null";

// 监听父组件传入的数据变化
watch(
    [() => props.backendData, () => props.authorityTable],
    ([newBackendData, newAuthorityTable]) => {
      if (newBackendData === null) {
        emptyTimeTableFlag.value = true;
      } else {
        emptyTimeTableFlag.value = false;
        local_timeTable.value = newBackendData;
        handleOfficeHourDateInfo();

        // 排序：将有 OfficeHour 的时间表放到前面
        local_timeTable.value.timeTable.sort((a, b) => {
          const isOfficeHourA = officeHourDateList.value.includes(a.date);
          const isOfficeHourB = officeHourDateList.value.includes(b.date);
          if (isOfficeHourA && !isOfficeHourB) return -1; // A 在前
          if (!isOfficeHourA && isOfficeHourB) return 1;  // B 在前
          return 0; // 顺序不变
        });

        if (newAuthorityTable) {
          local_authorityTable.value = newAuthorityTable;
          noOfficeHourFlag.value = local_authorityTable.value["OfficeHour:approve"] === true &&
              local_timeTable.value.officeHourTime?.length === 0;
        } else {
          local_authorityTable.value = { 'OfficeHour:approve': false };
        }
      }
    },
    { immediate: true }
);

// Mounted生命周期钩子，初始化时间表数据，通知父组件加载完成
onMounted(() => {
  emptyTimeTableFlag.value = props.backendData === null;
  nextTick(() => {
    emit("loading-done");
  });
});

// Updated生命周期钩子，通知父组件加载完成
onUpdated(() => {
  nextTick(() => {
    emit("loading-done");
  });
});
</script>

<template>
  <div class="table-component">
    <div v-if="emptyTimeTableFlag" class="prompt-body">
      <div v-if="local_authorityTable['OfficeHour:approve']">
        <div class="empty-prompt">{{ t("index.empty_prompt") }}</div>
        <div class="empty-prompt">{{ t("index.office_hour_empty_prompt_teacher") }}</div>
      </div>
      <div v-else>
        <div class="empty-prompt">{{ t("index.empty_prompt") }}</div>
        <div class="empty-prompt">{{ t("index.office_hour_empty_prompt_student") }}</div>
      </div>
    </div>
    <div v-else-if="noOfficeHourFlag" class="prompt-body">
      <div class="empty-prompt">{{ t("index.office_hour_empty_prompt_teacher") }}</div>
    </div>
    <div v-else class="table-body">
      <div v-for="date in local_timeTable.timeTable" :key="date" class="for-div">
        <div class="single-bar" @click="toAppointmentPage"
             :class="{ 'office-hour-exist-class': officeHourDateList.indexOf(date.date) !== -1 }">
          <div class="grid-info-part">
            <div class="bar-title-office-hour">
              {{ t("index.bar-title-office-hour") }}{{ local_timeTable.name }}
            </div>
            <div class="date-info">
              {{ t("index.bar-date-info") }}{{ TimeFormat.formatTimestamp(date.date, isDate=true) }}
            </div>
            <div class="room-info">
              {{ t("index.bar-room-info") }}
              <span v-if="local_timeTable.teacherRoom">
                {{ teacherRoomOutputFormat(local_timeTable.teacherRoom) }}
              </span>
              <span v-else>Null</span>
            </div>
          </div>
          <div class="is-office-hour">
            <span v-if="officeHourDateList.indexOf(date.date) !== -1" class="office-hour-exist">
              {{ t("index.if-office-hour") }}{{ t("index.office-hour-exist") }}
              {{ TimeFormat.formatTimestamp(officeHourStartEndList[officeHourDateList.indexOf(date.date)].startTime, isDate=false) }}
              -
              {{ TimeFormat.formatTimestamp(officeHourStartEndList[officeHourDateList.indexOf(date.date)].endTime, isDate=false) }}
            </span>
            <span v-else>
              {{ t("index.if-office-hour") }}{{ t("index.office-hour-dont-exist") }}
            </span>
          </div>
          <div class="time-bar">
            <TimeOccupationInfoBar
                :available-data="TableFormat.start2startTime_format(date.available)"
                :waiting-data="TableFormat.start2startTime_format(date.waiting)"
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
  height: auto
}

.time-bar {
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 5px;
  background-color: #ffffff;

}

.grid-info-part {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 10px;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 10px;
}

.is-office-hour {
  margin-top: 10px;
  margin-left: 10px;
}

.is-office-hour,
.office-hour-exist {
  font-weight: bold;
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

.office-hour-exist-class {
 background-color: #e6f7ff; /* 浅蓝色背景 */
}
</style>