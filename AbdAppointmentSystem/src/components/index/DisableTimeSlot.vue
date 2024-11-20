<script setup>
import {onMounted, ref, watch} from "vue";

import {TableFormat} from "@/utils/index/format.js";

// 接收父组件传递的props
const props = defineProps({
  isDialogVisible: Boolean, // 禁用时段弹框是否可见
  backendData: Object, // 后端返回时间表，用于限制禁用时段的选择范围
  isOfficeHour: Boolean // 是否为OfficeHour时间段
});

// 向父组件传递的事件
const emit = defineEmits(
  [
    'close', // 关闭禁用时段组件
    'submit' // 提交禁用时段信息，并关闭禁用时间段组件
  ]
)

// DisableTimeSlot组件全局变量定义

// 界面选择器选中的信息
let selectDate = ref([null, null]) // 被选中的日期，和组件绑定，[ "2024-07-04T16:00:00.000Z", "2024-07-11T16:00:00.000Z" ]
let startTime = ref(null) // 被选中的开始时间，Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)，只关注时间部分即可
let endTime = ref(null) // 被选中的结束时间，Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)，只关注时间部分即可

// 时间表渲染用的变量
let timeSlots = ref([]) // 转换后的时间表
let isBackendDataNone = ref(null) // 后端返回的时间表数据是否为空
let isDatePicked = ref(false) // 是否选择了日期

// 向后端返回的时间戳变量
let startTimeInt = ref(null) // 开始时间的整数表示，时间戳
let endTimeInt = ref(null) // 结束时间的整数表示，时间戳
let startDateInt = ref(null) // 开始日期的整数表示，时间戳
let endDateInt = ref(null) // 结束日期的整数表示，时间戳

// 禁用时间段常量数据
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

/**
 * DisableTimeSlot组件初始化
 * 从父组件接收信息并进行条件渲染/时间表数据处理
 */
onMounted(() => {
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

/**
 * 转换整数区间为整数数组
 */
const makeRange = (start, end) => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

/**
 * 从每日的时间表中提取出繁忙时段时间表
 */
const getBusyTimes = (date) => {
  const day = timeSlots.value.find(d => d.date === date);
  return day ? day.busy : [];
};

/**
 * 从每日的时间表中提取出繁忙时段时间表
 */
const getAvailableTimes = (date) => {
  const day = timeSlots.value.find(d => d.date === date);
  return day ? day.available : [];
};


/**
 * 转换日期区间为连续的日期数组
 */
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

/**
 * 禁用时间点选择器开始时间点部分的小时选择器
 * 计算需要禁用的小时数，以数组形式返回
 * e.g. [1,2,3,4,5,6,10,23]
 */
const disabledHoursStart = (startDate, endDate) => {
  const dates = getDateRange(startDate, endDate); // 获取选中日期范围
  let totalDisabledHours = []; // 用于存储所有选中日期的禁用小时数组的并集

  dates.forEach(date => { // 遍历所有选中日期
    const busyTimes = getBusyTimes(date); // 每个日期的繁忙时间段
    const disabled = new Set([...makeRange(0, 7), ...makeRange(20, 23)]); // 默认禁用时间段，初始化为晚上8点到第二天早上8点

    busyTimes.forEach(period => { // 遍历选中日期的所有繁忙时段
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
        }
        else {
          if (startMinute === 0 && endMinute === 59) {
            disabled.add(hour);
          }
        }
      }
    });

    // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
    let dateDisabledHours = Array.from(disabled).sort((a, b) => a - b);
    let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element));
    totalDisabledHours = totalDisabledHours.concat(newElements);
    totalDisabledHours = [...new Set(totalDisabledHours)];
  })

  return Array.from(totalDisabledHours).sort((a, b) => a - b);
};

/**
 * 禁用时间点选择器开始时间点部分的分钟选择器
 * 计算需要禁用的分钟数，以数组形式返回
 * e.g. [1,2,3,4,5,6,10,23]
 */
const disabledMinutesStart = (startDate, endDate, hour) => {
  const dates = getDateRange(startDate, endDate); // 获取选中日期范围
  let totalDisabledMinutes = []; // 用于存储所有选中日期的禁用分钟数组的并集

  dates.forEach(date => { // 遍历选中日期
    const busyTimes = getBusyTimes(date); // 每个日期的繁忙时间段
    const disabled = new Set(); // 默认禁用分钟数组，初始化为空

    busyTimes.forEach(period => {  // 遍历选中日期的所有繁忙时段
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

    // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
    let dateDisabledMinutes = Array.from(disabled).sort((a, b) => a - b);
    let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
    totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
    totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
  });

  return Array.from(totalDisabledMinutes).sort((a, b) => a - b);
};

/**
 * 禁用时间点选择器的秒数选择器
 * 计算需要禁用的小时数，以数组形式返回
 * 从不需要计算秒数，1-59全部禁用
 */
const disabledSeconds = () => {
  return makeRange(1, 59);
};

/**
 * 包裹disabledHoursStart为一个组件可以接受的函数
 */
const disabledHoursStartWrapper = () => {
  if (selectDate.value[0] && selectDate.value[1]) {
    return disabledHoursStart(selectDate.value[0], selectDate.value[1]); // 传入选中日期范围
  }
  return [];
};

/**
 * 包裹disabledMinutesStart为一个组件可以接受的函数
 */
const disabledMinutesStartWrapper = (hour) => {
  if (selectDate.value[0] && selectDate.value[1]) {
    return disabledMinutesStart(selectDate.value[0], selectDate.value[1], hour); // 传入选中日期范围和选中小时
  }
  return [];
};

/**
 * 将类似于Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)格式的时间字符串
 * 转换为JavaScript的日期格式用于计算
 */
const parseTimeInCalculateForm = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date;
}

/**
 * 通过开始时间点和结束时间点，判断可以选中的小时数和对应小时数可用的分钟数
 * 开始时间和结束时间数据结构：e.g."10:23"
 * 返回的类型为选择器可选小时数组：[10,11,12]
 * 选择器可选分钟数组关于小时的对象：{
 *   '10': [1,2,3],
 *   '11': [51,52,53],
 *   '12': [33,34,35]
 * }
 */
function getAvailableTimeRange(startTime, endTime) {
  /**
   * 时间格式转换函数
   */
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours, minutes };
  };

  const start = parseTime(startTime); // 开始时间
  const end = parseTime(endTime); // 结束时间

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
    }
    else if (hour === start.hours) {
      minuteRange[hour] = Array.from({ length: 60 - start.minutes }, (_, i) => i + start.minutes);
    }
    else if (hour === end.hours) {
      minuteRange[hour] = Array.from({ length: end.minutes + 1 }, (_, i) => i);
    }
    else {
      minuteRange[hour] = Array.from({ length: 60 }, (_, i) => i);
    }
  });

  return {
    hourRange,
    minuteRange
  };
}

/**
 * 禁用时间点选择器结束时间点部分的小时选择器
 * 计算需要禁用的小时数，以数组形式返回
 * e.g. [1,2,3,4,5,6,10,23]
 */
const disabledHoursEnd = (startDate, endDate, startTime) => {
  const dates = getDateRange(startDate, endDate); // 获取选中日期范围
  let totalDisabledHours = []; // 用于存储所有选中日期的禁用小时数组的并集
  let beginTime = parseTimeInCalculateForm(startTime); // 用户选中的开始时间
  let foundFlag = false;
  // 用于判断用户选中的日期中，是否存在一天，处于后端返回的时间表范围内
  // 若不存在，需要特殊处理

  dates.forEach(date => { // 遍历用户选中的日期
    const availableTimes = getAvailableTimes(date); // 获取日期对应的可用时间表
    let disabledHours = new Set(); // 用于存储每个日期的禁用小时数组，初始化为空

    availableTimes.forEach(period => { // 遍历日期对应的可用时间表
      const periodStart = period.start
      const periodEnd = period.end
      let isBeginTimeInPeriod =
          beginTime >= parseTimeInCalculateForm(periodStart) && beginTime <= parseTimeInCalculateForm(periodEnd);

      if (isBeginTimeInPeriod) { // 判断用户选中的开始时间，是否处于可用时间表中时间段范围内
        // 有且仅有一个时间段可用满足要求以执行if块内代码
        const { hourRange } = getAvailableTimeRange(startTime, periodEnd);
        disabledHours = allHours.filter(hour => !hourRange.includes(hour)); // 可用时段数组取补集为不可用时段数组
        foundFlag = true;
      }
    });
    if (foundFlag) {
      // 若找到一个时段，处于可用时间表中时间段范围内
      // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
      let dateDisabledHours = Array.from(disabledHours).sort((a, b) => a - b);
      let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element));
      totalDisabledHours = totalDisabledHours.concat(newElements);
      totalDisabledHours = [...new Set(totalDisabledHours)];
    }
    else {
      // 若未找到一个时段，处于可用时间表中时间段范围内，则特殊处理
      // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
      const { hourRange } = getAvailableTimeRange(startTime, "20:00"); // 可用时间起始未用户选中时间 - 晚上8点
      disabledHours = allHours.filter(hour => !hourRange.includes(hour)); // 可用时段数组取补集为不可用时段数组

      let dateDisabledHours = Array.from(disabledHours).sort((a, b) => a - b);
      let newElements = dateDisabledHours.filter(element => !totalDisabledHours.includes(element)); // 可用时段数组取补集为不可用时段数组
      totalDisabledHours = totalDisabledHours.concat(newElements);
      totalDisabledHours = [...new Set(totalDisabledHours)];
    }
  })

  return Array.from(totalDisabledHours).sort((a, b) => a - b);
};

/**
 * 禁用时间点选择器结束时间点部分的分钟选择器
 * 计算需要禁用的分钟数，以数组形式返回
 * e.g. [1,2,3,4,5,6,10,23]
 */
const disabledMinutesEnd = (startDate, endDate, startTime, hour) => {
  const dates = getDateRange(startDate, endDate); // 获取选中日期范围
  let totalDisabledMinutes = []; // 用于存储所有选中日期的禁用分钟数组的并集
  let beginTime = parseTimeInCalculateForm(startTime); // 用户选中的开始时间
  let foundFlag = false;
  // 用于判断用户选中的日期中，是否存在一天，处于后端返回的时间表范围内
  // 若不存在，需要特殊处理

  dates.forEach(date => { // 遍历用户选中的日期
    const availableTimes = getAvailableTimes(date); // 获取日期对应的可用时间表
    let disabledMinutes = new Set(); // 用于存储每个日期的禁用分钟数组，初始化为空

    availableTimes.forEach(period => { // 遍历日期对应的可用时间表
      const periodStart = period.start
      const periodEnd = period.end
      let isBeginTimeInPeriod =
          beginTime >= parseTimeInCalculateForm(periodStart) && beginTime <= parseTimeInCalculateForm(periodEnd);

      if (isBeginTimeInPeriod) { // 判断用户选中的开始时间，是否处于可用时间表中时间段范围内
        // 有且仅有一个时间段可用满足要求以执行if块内代码
        const { minuteRange } = getAvailableTimeRange(startTime, periodEnd);
        disabledMinutes = allMinutes.filter(minute => !minuteRange[hour].includes(minute));
        foundFlag = true;
      }
    });
    if (foundFlag) {
      // 若找到一个时段，处于可用时间表中时间段范围内
      // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
      let dateDisabledMinutes = Array.from(disabledMinutes).sort((a, b) => a - b);
      let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
      totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
      totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
    }
    else {
      // 若未找到一个时段，处于可用时间表中时间段范围内，则特殊处理
      // 对该日期的禁用时段进行处理，以在totalDisabledHours变量取得每个日期禁用小时数组的并集
      const { minuteRange } = getAvailableTimeRange(startTime, "20:00"); // 可用时间起始未用户选中时间 - 晚上8点
      disabledMinutes = allMinutes.filter(minute => !minuteRange[hour].includes(minute)); // 可用时段数组取补集为不可用时段数组

      let dateDisabledMinutes = Array.from(disabledMinutes).sort((a, b) => a - b);
      let newElements = dateDisabledMinutes.filter(element => !totalDisabledMinutes.includes(element));
      totalDisabledMinutes = totalDisabledMinutes.concat(newElements);
      totalDisabledMinutes = [...new Set(totalDisabledMinutes)];
    }
  })

  return Array.from(totalDisabledMinutes).sort((a, b) => a - b);
};

/**
 * 将类似于Sat Jul 06 2024 09:46:00 GMT+0800 (GMT+08:00)格式的时间字符串
 * 转换为HH:MM格式的时间，用于传递给父组件向后端发起请求
 */
function dateStringInHHMM(dateString) {
  let dateStr = new Date(dateString)
  let hours = dateStr.getHours()
  let minutes = dateStr.getMinutes()
  let formattedHours = hours.toString().padStart(2, '0');
  let formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`
}

const disabledHoursEndWrapper = () => {
  if (selectDate.value[0] && selectDate.value[1] && startTime.value) {
    let formattedTime = dateStringInHHMM(startTime.value)
    return disabledHoursEnd(selectDate.value[0], selectDate.value[1], formattedTime); // 传入选中日期范围和选中开始时间
  }
  return [];
};

const disabledMinutesEndWrapper = (hour) => {
  if (selectDate.value[0] && selectDate.value[1] && startTime.value) {
    let formattedTime = dateStringInHHMM(startTime.value)
    return disabledMinutesEnd(selectDate.value[0], selectDate.value[1], formattedTime, hour); // 传入选中日期范围和选中开始时间
  }
  return [];
};

/**
 * 监听父组件传入参数变更
 */
watch(props, (newVal) => {
  if (newVal.backendData === null) {
    isBackendDataNone = true
  }
  else {
    isBackendDataNone = false
    let timeTableTemp = newVal.backendData.timeTable
    timeSlots.value = TableFormat.timetable_format(timeTableTemp)
  }
})

/**
 * 监听日期选择变化
 */
watch(selectDate, (newVal) => {
  isDatePicked.value = newVal !== null;
})

/**
 * 对用户提交的禁用表单信息进行合理性检测
 */
function banTimeInfoCheck() {
  if (selectDate.value === null || startTime.value === null || endTime.value === null) {
    console.warn("日期或时间未选择")
    alert("警告：暂时未选择需要禁用的日期或时间")
    return false;
  }
  return true;
}

/**
 * 清空用户先前选择的禁用时段
 */
function clearSelection() {
  selectDate.value = null
  startTime.value = null
  endTime.value = null
}

/**
 * 当用户关闭禁用组件时触发
 */
function closeDisableComponents() {
  emit('close');
  clearSelection();
}

/**
 * 获取日期字符串格式对应的时间戳
 */
function getTimeStamps(timeString) {
  return new Date(timeString).getTime();
}

/**
 * 当用户提交禁用表单时触发
 */
function submitDisableInfo() {
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

const disabledHoursEndWrapperWithoutConflictCheck = () => {
  const startHour = new Date(startTime.value).getHours(); // 获取开始时间的小时
  const allHours = Array.from({ length: 24 }, (_, i) => i); // 所有小时 0-23
  const validHours = allHours.filter(hour => hour >= 8 && hour <= 19); // 有效的小时范围是 8 到 19
  const enabledHours = validHours.filter(hour => hour >= startHour); // 启用的小时范围从 startHour 开始到 19
  const disabledHours = validHours.filter(hour => !enabledHours.includes(hour)); // 禁用的小时 = 有效小时范围中不包含在启用小时范围内的部分
  const invalidHours = allHours.filter(hour => hour < 8 || hour > 19); // 额外禁用无效范围（0-7 和 20-23）

  return [...disabledHours, ...invalidHours];   // 合并禁用的小时
};


const disabledMinutesEndWrapperWithoutConflictCheck = (hour) => {
  const startHour = new Date(startTime.value).getHours(); // 获取开始时间的小时
  const startMinute = new Date(startTime.value).getMinutes(); // 获取开始时间的分钟

  const allMinutes = Array.from({ length: 60 }, (_, i) => i); // 所有分钟 0-59

  if (hour < startHour) {
    return allMinutes; // 如果小时小于开始时间的小时，禁用所有分钟
  }

  if (hour === startHour) {
    const enabledMinutes = Array.from({ length: 60 - startMinute }, (_, i) => i + startMinute); // 启用分钟
    const disabledMinutes = allMinutes.filter(min => !enabledMinutes.includes(min)); // 差集
    return disabledMinutes;
  }

  return []; // 其他情况不禁用任何分钟
};

const disabledHoursStartWrapperWithoutConflictCheck = () => {
  const allHours = Array.from({ length: 24 }, (_, i) => i); // 所有小时 0-23
  const enabledHours = Array.from({ length: 12 }, (_, i) => i + 8); // 启用的小时 8-19
  const disabledHours = allHours.filter(hour => !enabledHours.includes(hour)); // 差集
  return disabledHours;
};

const disabledMinutesStartWrapperWithoutConflictCheck = () => {
  const allMinutes = Array.from({ length: 60 }, (_, i) => i); // 所有分钟 0-59
  const enabledMinutes = Array.from({ length: 60 }, (_, i) => i); // 启用的分钟 0-59
  const disabledMinutes = allMinutes.filter(min => !enabledMinutes.includes(min)); // 差集
  return disabledMinutes;
};

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
              :disabled-hours="disabledHoursStartWrapperWithoutConflictCheck"
              :disabled-minutes="disabledMinutesStartWrapperWithoutConflictCheck"
              :disabled-seconds="disabledSeconds"
          />
          <span> To </span>
          <el-time-picker
              v-model="endTime"
              placeholder="End time"
              :disabled-hours="disabledHoursEndWrapperWithoutConflictCheck"
              :disabled-minutes="disabledMinutesEndWrapperWithoutConflictCheck"
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
