<script setup>
import {defineEmits, defineProps} from "vue";
import {onMounted, ref, watch} from "vue";
import {TableFormat} from "@/utils/index/format.js";

// 接收父组件传递的props
const props = defineProps({
  isDialogVisible: Boolean,
  backendData: Object
});

// 向父组件传递的事件
const emit = defineEmits(
  [
    'close',
    'submit'
  ]
)

// 组件内全局变量定义
let selectDate = ref([null, null]) // 被选中的日期，和组件绑定，[ "2024-07-04T16:00:00.000Z", "2024-07-11T16:00:00.000Z" ]
let startTime = ref(null) // 被选中的开始时间，Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)，只关注时间部分即可
let endTime = ref(null) // 被选中的结束时间，Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)，只关注时间部分即可

let timeSlots = ref([]) // 转换后的时间表
let isBackendDataNone = ref(null) // 后端返回的时间表数据是否为空
let isDatePicked = ref(false) // 是否选择了日期

let startTimeInt = ref(null) // 开始时间的整数表示，时间戳
let endTimeInt = ref(null) // 结束时间的整数表示，时间戳
let startDateInt = ref(null) // 开始日期的整数表示，时间戳
let endDateInt = ref(null) // 结束日期的整数表示，时间戳

const allHours = Array.from({ length: 24 }, (_, index) => index); // [0, ..., 23]
const allMinutes = Array.from({ length: 60 }, (_, index) => index); // [0, ..., 59]

// 快捷日期选定项
const shortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

onMounted(() => {
  /**
   * 组件初始化时被触发，从父组件接收信息并进行条件渲染/时间表数据处理
   */
  console.log("禁用时间段组件开始挂载")
  if (props.backendData === null) {
    isBackendDataNone = true
  }
  else {
    isBackendDataNone = false
    let timeTableTemp = props.backendData.timeTable
    timeSlots.value = TableFormat.timetable_format(timeTableTemp)
  }
})

const makeRange = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

const getBusyTimes = (date) => {
  const day = timeSlots.value.find(d => d.date === date);
  return day ? day.busy : [];
};

const getAvailableTimes = (date) => {
  const day = timeSlots.value.find(d => d.date === date);
  return day ? day.available : [];
};

const getDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const disabledHoursStart = (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledHours = [];
  dates.forEach(date => {
    const busyTimes = getBusyTimes(date);
    const disabled = new Set([...makeRange(0, 7), ...makeRange(20, 23)]);
    busyTimes.forEach(period => {
      const [startHour, startMinute] = period.start.split(':').map(Number);
      const [endHour, endMinute] = period.end.split(':').map(Number);
      for (let hour = startHour; hour <= endHour; hour++) {
        if (startHour !== endHour) {
          if (hour === startHour && startMinute === 0) {
            disabled.add(hour);
          } else if (hour === endHour && endMinute === 59) {
            disabled.add(hour);
          } else if (hour !== startHour && hour !== endHour) {
            disabled.add(hour);
          }
        } else {
          if (startMinute === 0 && endMinute === 59) {
            disabled.add(hour);
          }
        }
      }
    });
    let dateDisabledHours = Array.from(disabled).sort((a, b) => a - b);

    let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element));
    totalDisabledHours = totalDisabledHours.concat(newElements);
    totalDisabledHours = [...new Set(totalDisabledHours)];
  })
  return Array.from(totalDisabledHours).sort((a, b) => a - b);
};

const disabledMinutesStart = (startDate, endDate, hour) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledMinutes = [];

  dates.forEach(date => {
    const busyTimes = getBusyTimes(date);
    const disabled = new Set();
    busyTimes.forEach(period => {
      const [startHour, startMinute] = period.start.split(':').map(Number);
      const [endHour, endMinute] = period.end.split(':').map(Number);

      if (hour === startHour) {
        for (let minute = startMinute; minute < 60; minute++) {
          disabled.add(minute);
        }
      }
      if (hour === endHour) {
        for (let minute = 0; minute <= endMinute; minute++) {
          disabled.add(minute);
        }
      }
      if (hour > startHour && hour < endHour) {
        for (let minute = 0; minute < 60; minute++) {
          disabled.add(minute);
        }
      }
    });
    let dateDisabledMinutes = Array.from(disabled).sort((a, b) => a - b);

    let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
    totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
    totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
  });
  return Array.from(totalDisabledMinutes).sort((a, b) => a - b);
};

const disabledSeconds = () => {
  return makeRange(1, 59);
};

const disabledHoursStartWrapper = () => {
  if (selectDate.value[0] && selectDate.value[1]) {
    return disabledHoursStart(selectDate.value[0], selectDate.value[1]);
  }
  return [];
};

const disabledMinutesStartWrapper = (hour) => {
  if (selectDate.value[0] && selectDate.value[1]) {
    return disabledMinutesStart(selectDate.value[0], selectDate.value[1], hour);
  }
  return [];
};

const parseTimeInCalculateForm = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getAvailableTimeRange(startTime, endTime) {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // 计算小时范围
  const hourRange = [];
  for (let hour = start.hours; hour <= end.hours; hour++) {
    hourRange.push(hour);
  }

  // 计算分钟范围
  const minuteRange = {};
  hourRange.forEach(hour => {
    if (hour === start.hours && hour === end.hours) {
      minuteRange[hour] = Array.from({ length: end.minutes - start.minutes + 1 }, (_, i) => i + start.minutes);
    } else if (hour === start.hours) {
      minuteRange[hour] = Array.from({ length: 60 - start.minutes }, (_, i) => i + start.minutes);
    } else if (hour === end.hours) {
      minuteRange[hour] = Array.from({ length: end.minutes + 1 }, (_, i) => i);
    } else {
      minuteRange[hour] = Array.from({ length: 60 }, (_, i) => i);
    }
  });

  return {
    hourRange,
    minuteRange
  };
}

const disabledHoursEnd = (startDate, endDate, startTime) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledHours = [];
  let beginTime = parseTimeInCalculateForm(startTime);
  dates.forEach(date => {
    const availableTimes = getAvailableTimes(date);
    let disabledHours = new Set();
    availableTimes.forEach(period => {
      const periodStart = period.start
      const periodEnd = period.end
      let isBeginTimeInPeriod = beginTime >= parseTimeInCalculateForm(periodStart) && beginTime <= parseTimeInCalculateForm(periodEnd);
      if (isBeginTimeInPeriod) {
        const { hourRange } = getAvailableTimeRange(startTime, periodEnd);
        disabledHours = allHours.filter(hour => !hourRange.includes(hour));
      }
    });
    let dateDisabledHours = Array.from(disabledHours).sort((a, b) => a - b);
    let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element));
    totalDisabledHours = totalDisabledHours.concat(newElements);
    totalDisabledHours = [...new Set(totalDisabledHours)];
  })
  return Array.from(totalDisabledHours).sort((a, b) => a - b);
};

const disabledMinutesEnd = (startDate, endDate, startTime, hour) => {
  const dates = getDateRange(startDate, endDate);
  let totalDisabledMinutes = [];
  let beginTime = parseTimeInCalculateForm(startTime);
  dates.forEach(date => {
    const availableTimes = getAvailableTimes(date);
    let disabledMinutes = new Set();
    availableTimes.forEach(period => {
      const periodStart = period.start
      const periodEnd = period.end
      let isBeginTimeInPeriod = beginTime >= parseTimeInCalculateForm(periodStart) && beginTime <= parseTimeInCalculateForm(periodEnd);
      if (isBeginTimeInPeriod) {
        const { minuteRange } = getAvailableTimeRange(startTime, periodEnd);
        disabledMinutes = allMinutes.filter(minute => !minuteRange[hour].includes(minute));
      }
    });
    let dateDisabledMinutes = Array.from(disabledMinutes).sort((a, b) => a - b);
    let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
    totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
    totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
  })
  return Array.from(totalDisabledMinutes).sort((a, b) => a - b);
};

function dateStringInHHMM(dateString) {
  let dateStr = new Date(dateString)
  let hours = dateStr.getHours()
  let minutes = dateStr.getMinutes()
  let formattedHours = hours.toString().padStart(2, '0');
  let formattedMinutes = minutes.toString().padStart(2, '0');
  let formattedTime = `${formattedHours}:${formattedMinutes}`;
  return formattedTime
}

const disabledHoursEndWrapper = () => {
  if (selectDate.value[0] && selectDate.value[1] && startTime.value) {
    let formattedTime = dateStringInHHMM(startTime.value)
    return disabledHoursEnd(selectDate.value[0], selectDate.value[1], formattedTime);
  }
  return [];
};

const disabledMinutesEndWrapper = (hour) => {
  if (selectDate.value[0] && selectDate.value[1] && startTime.value) {
    let formattedTime = dateStringInHHMM(startTime.value)
    return disabledMinutesEnd(selectDate.value[0], selectDate.value[1], formattedTime, hour);
  }
  return [];
};

watch(props, (newVal) => {
  /**
   * 监听父组件传入参数变更
   */
  if (newVal.backendData === null) {
    isBackendDataNone = true
  }
  else {
    isBackendDataNone = false
    let timeTableTemp = newVal.backendData.timeTable
    timeSlots.value = TableFormat.timetable_format(timeTableTemp)
  }
})

watch(selectDate, (newVal) => {
  /**
   * 监听日期选择变化
   */
  if (newVal !== null) {
    isDatePicked.value = true
  }
  else {
    isDatePicked.value = false
  }
})

function banTimeInfoCheck() {
  /**
   * 对用户提交的表单信息进行合理性检测
   */
  if (selectDate.value === null || startTime.value === null || endTime.value === null) {
    console.warn("日期或时间未选择")
    alert("警告：暂时未选择需要禁用的日期或时间")
    return false;
  }
  return true;
}

function clearSelection() {
  /**
   * 清空用户选择的禁用时段
   */
  selectDate.value = null
  startTime.value = null
  endTime.value = null
}

function closeDisableComponents() {
  /**
   * 当用户关闭禁用组件时触发
   */
  emit('close');
  clearSelection();
}

function getTimeStamps(timeString) {
  return new Date(timeString).getTime();
}

function submitDisableInfo() {
  /**
   * 当用户提交禁用表单时触发
   */
  let isCheckOK = banTimeInfoCheck()
  if (isCheckOK) {
    let confirm_result = confirm("确认要禁用这个时间段？")
    if (confirm_result) {
      startDateInt = getTimeStamps(selectDate.value[0])
      endDateInt = getTimeStamps(selectDate.value[1])
      startTimeInt = getTimeStamps(startTime.value)
      endTimeInt = getTimeStamps(endTime.value)
      emit('submit', {
        startDate: startDateInt,
        endDate: endDateInt,
        startTime: startTimeInt,
        endTime: endTimeInt
      })
    } else {
      emit('close')
    }
    clearSelection()
  }
}
</script>

<template>
  <div v-if="isDialogVisible" class="disable-overlay">
    <div class="disable-components">
      <h2>禁用时间段 Disable Time</h2>
      <div v-if="isBackendDataNone">
        <div>当前暂无可禁用时间段</div>
        <div class="uploadButton">
          <el-button type="info"
                     @click="closeDisableComponents">
            关闭禁用界面
          </el-button>
        </div>
      </div>
      <div v-else>
        <div class="date-selector">
          <div class="intro">禁用时间日期</div>
          <el-date-picker
              v-model="selectDate"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              :shortcuts="shortcuts"
          />
        </div>
        <div class="time-selector" v-if="isDatePicked">
          <div class="intro">禁用时间段</div>
          <el-time-picker
              v-model="startTime"
              placeholder="Start time"
              :disabled-hours="disabledHoursStartWrapper"
              :disabled-minutes="disabledMinutesStartWrapper"
              :disabled-seconds="disabledSeconds"
          />
          <span> To </span>
          <el-time-picker
              v-model="endTime"
              placeholder="End time"
              :disabled-hours="disabledHoursEndWrapper"
              :disabled-minutes="disabledMinutesEndWrapper"
              :disabled-seconds="disabledSeconds"
          />
        </div>
        <div class="uploadButton">
          <el-button type="primary"
                     @click="submitDisableInfo">
            上传禁用时间
          </el-button>
          <el-button type="info"
                     @click="closeDisableComponents">
            关闭禁用界面
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disable-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.disable-components {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

button {
  margin-top: 10px;
  margin-right: 10px;
}

.date-selector, .time-selector, .uploadButton {
  margin-top: 20px;
}
</style>
