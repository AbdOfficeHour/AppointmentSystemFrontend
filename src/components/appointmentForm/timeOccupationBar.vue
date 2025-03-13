<template>
  <div class="bar-container">
    <div class="time-bar-container">
      <div class="time-boundary-label top-label">08:00</div>
      <div class="time-axis">
        <!-- 不可用时间段（灰色背景上的透明层） -->
        <el-tooltip
            v-for="(segment, index) in unavailableSegments"
            :key="`unavailable-${index}`"
            effect="dark"
            :content="t('time_bar.unavailableTimeTip')"
            placement="right"
        >
          <div
              class="unavailable-segment"
              :style="{
                top: `${getRatioPercent(segment.start)}%`,
                height: `${getRatioPercent(segment.end) - getRatioPercent(segment.start)}%`
              }"
          ></div>
        </el-tooltip>

        <!-- 可用时间段（绿色） -->
        <el-tooltip
            v-for="(item, index) in computedData"
            :key="index"
            effect="dark"
            :content="t('time_bar.availableTimeTip')"
            placement="right"
        >
          <div
              class="available-segment"
              :style="item.style"
          >
            <div class="time-label start-label">
              {{ formatTime(item.startTime) }}
            </div>
            <div class="time-label end-label">
              {{ formatTime(item.endTime) }}
            </div>
          </div>
        </el-tooltip>


        <el-tooltip
            class="box-item"
            effect="dark"
            :content="t('time_bar.illegalTimeTip')"
            placement="right"
        >
          <!-- 绘制选定条 -->
          <div
              v-if="Object.keys(selectedRange).length>0"
              class="selected-segment"
              :style="selectedStyle"
          ></div>
        </el-tooltip>

        <el-tooltip
            class="box-item"
            effect="dark"
            :content="t('time_bar.selectedBarTip')"
            placement="right"
        >
          <!-- 绘制重叠区域（蓝色） -->
          <div
              v-for="(overlap, index) in getOverlappingSegments"
              :key="`overlap-${index}`"
              class="overlap-segment"
              :style="{
              top: `${getRatioPercent(overlap.overlap.startTime)}%`,
              height: `${getRatioPercent(overlap.overlap.endTime) - getRatioPercent(overlap.overlap.startTime)}%`
            }"
          ></div>
        </el-tooltip>
      </div>

      <!-- 20:00 标签 -->
      <div class="time-boundary-label bottom-label">22:00</div>
    </div>
  </div>
</template>

<script setup>
// 引入 vue 中的 computed 和 watch 函数
import {computed, watch} from 'vue';
import {useI18n} from "vue-i18n";// ✅ 引入 i18n
const {t} = useI18n(); // ✅ 让 $t() 正常工作

// 定义 props 属性
const props = defineProps({
  data: {
    type: Array,
    default: () => [{"startTime": 1738454400000, "endTime": 1738458174000}, {
      "startTime": 1738459494000,
      "endTime": 1738468487000
    }, {"startTime": 1738472387000, "endTime": 1738477920000}, {"startTime": 1738482060000, "endTime": 1738497600000}]
  },
  selectedRange: {
    type: Object,
    default: () => ({})
  }
});

// 定义时间轴的起始和结束时间
const startHour = 8;
const endHour = 22;
const totalHours = endHour - startHour;

// 调整时间戳到指定范围内的函数
function adjustTimeToRange(timestamp) {
  // 创建一个 Date 对象来方便处理时间
  const date = new Date(timestamp);

  // 获取当前时间的小时
  const hour = date.getHours();

  // 判断是否在指定的时间范围内
  if (hour >= startHour && hour < endHour) {
    // 如果在范围内，直接返回原时间戳
    return timestamp;
  }

  // 如果超出范围，调整时间戳为范围内的时间
  if (hour < startHour) {
    // 如果当前时间小于开始时间，则设置为开始时间的整点
    date.setHours(startHour, 0, 0, 0);
  } else {
    // 如果当前时间大于结束时间，则设置为结束时间的整点
    date.setHours(endHour, 0, 0, 0);
  }

  // 返回调整后的时间戳
  return date.getTime();
}

// 格式化时间函数，将时间戳转换为时分格式
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// 根据时间戳计算时间比例，返回该时间点相对于整个时间段的百分比
function getRatioPercent(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const past = hour + minute / 60 - startHour;
  return (past / totalHours) * 100;
}

// 计算可用条的样式，返回相对位置和高度的百分比
function calcOccupiedStyle({startTime, endTime}) {
  const topPercent = getRatioPercent(startTime);
  const bottomPercent = getRatioPercent(endTime);
  const heightPercent = bottomPercent - topPercent;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`
  };
}

// 计算得到的时间段数据，处理每个时间段的样式
const computedData = computed(() => {
  return props.data.map(item => {
    const style = calcOccupiedStyle(item);
    return {
      ...item,
      style
    };
  });
});

// 监听 data 的变化
watch(() => props.data, (newData) => {
}, {deep: true});

// 计算选中范围的样式
const selectedStyle = computed(() => {
  if (!props.selectedRange) return {};

  const {startTime, endTime} = props.selectedRange;
  const topPercent = getRatioPercent(adjustTimeToRange(startTime));
  const bottomPercent = getRatioPercent(adjustTimeToRange(endTime));
  const heightPercent = bottomPercent - topPercent;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`,
    backgroundColor: '#D25F5F', /* Muted crimson red */
    position: 'absolute',
    width: '10px',
    borderRadius: '5px'
  };
});

// 获取重叠时间段的函数，计算是否有重叠的时间段
function getOverlappingTime(occupiedStartTime, occupiedEndTime, selectedStartTime, selectedEndTime) {
  // 选择一个基准日期（可以是今天）
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0); // 归零小时、分钟、秒、毫秒

  // 将给定时间戳转换为 Date 对象
  const occupiedStart = new Date(occupiedStartTime);
  const occupiedEnd = new Date(occupiedEndTime);
  const selectedStart = new Date(selectedStartTime);
  const selectedEnd = new Date(selectedEndTime);

  // 生成同一天的时间戳
  function toSameDayTimestamp(originalDate) {
    const newDate = new Date(baseDate); // 复制基准日期
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), originalDate.getMilliseconds());
    return newDate.getTime(); // 转换为时间戳
  }

  // 转换所有时间戳到同一天
  const newOccupiedStartTime = toSameDayTimestamp(occupiedStart);
  const newOccupiedEndTime = toSameDayTimestamp(occupiedEnd);
  const newSelectedStartTime = toSameDayTimestamp(selectedStart);
  const newSelectedEndTime = toSameDayTimestamp(selectedEnd);

  // 计算重叠时间
  const overlapStartTime = Math.max(newOccupiedStartTime, newSelectedStartTime);
  const overlapEndTime = Math.min(newOccupiedEndTime, newSelectedEndTime);

  if (overlapStartTime < overlapEndTime) {
    return {startTime: overlapStartTime, endTime: overlapEndTime};
  }

  return null;
}


// 计算重叠区域的时间段
const getOverlappingSegments = computed(() => {
  const {startTime: selectedStart, endTime: selectedEnd} = props.selectedRange;


  return computedData.value.map(item => {
    const overlap = getOverlappingTime(item.startTime, item.endTime, adjustTimeToRange(selectedStart), adjustTimeToRange(selectedEnd));
    return overlap ? {...item, overlap} : null;
  }).filter(item => item !== null);
});

// 新增：将时间调整到当天同一日期的函数
function adjustTimeToSameDay(timestamp) {
  const date = new Date(timestamp);
  const baseDate = new Date(); // 使用当天日期
  baseDate.setHours(0, 0, 0, 0); // 归零时间
  return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
  ).getTime();
}

// 新增：计算不可用时间段
const unavailableSegments = computed(() => {
  // 生成总时间段（当天8:00到22:00）
  const totalStart = new Date();
  totalStart.setHours(startHour, 0, 0, 0);
  const totalEnd = new Date();
  totalEnd.setHours(endHour, 0, 0, 0);

  // 处理可用时间段并排序
  const available = computedData.value
      .map(item => ({
        start: adjustTimeToSameDay(item.startTime),
        end: adjustTimeToSameDay(item.endTime)
      }))
      .sort((a, b) => a.start - b.start);

  // 合并重叠或相邻的区间
  const merged = [];
  for (const interval of available) {
    if (merged.length === 0) {
      merged.push({ ...interval });
    } else {
      const last = merged[merged.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        merged.push({ ...interval });
      }
    }
  }

  // 计算不可用时间段
  const unavailable = [];
  let prevEnd = totalStart.getTime();

  for (const interval of merged) {
    if (interval.start > prevEnd) {
      unavailable.push({
        start: prevEnd,
        end: interval.start
      });
    }
    prevEnd = Math.max(prevEnd, interval.end);
  }

  // 添加最后一个不可用段
  if (prevEnd < totalEnd.getTime()) {
    unavailable.push({
      start: prevEnd,
      end: totalEnd.getTime()
    });
  }

  return unavailable;
});
</script>

<style scoped>
/* 新增不可用段样式 */
.unavailable-segment {
  position: absolute;
  width: 10px;
  background-color: transparent; /* 透明背景 */
  pointer-events: auto; /* 确保可以触发事件 */
  z-index: 0; /* 层级低于可用段 */
}
/* 整体容器 */
.time-bar-container {
  position: relative;
  width: 30px;
  height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 容器的外部样式，居中显示 */
.bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

/* 灰色时间轴背景 */
.time-axis {
  position: relative;
  width: 10px;
  height: 100%;
  background-color: #B8B8B8; /* Soft light gray */
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 可用时间段（绿色） */
.available-segment {
  position: absolute;
  width: 10px;
  background-color: #71a66e; /* Muted sage green */
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
  z-index: 1;
}

/* 时间标签 */
.time-label {
  position: absolute;
  background: #333;
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 20px;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

/* 8:00 和 20:00 边界标签 */
.time-boundary-label {
  background: #FFB74D; /* Soft amber color for boundary labels */
  color: white;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 4px;
  position: absolute;
}

.top-label {
  top: -40px;
}

.bottom-label {
  bottom: -40px;
}

/* 开始时间标签（左侧） */
.start-label {
  left: -53px; /* 移动到左侧 */
  top: 0;
  transform: translateY(-50%);
}

/* 结束时间标签（右侧，保持不变） */
.end-label {
  bottom: 0;
  left: 18px; /* 移动右侧 */
  transform: translateY(50%);
}

/* 选定条，默认选错 */
.selected-segment {
  position: absolute;
  width: 10px;
  background-color: #D25F5F; /* Muted crimson red */
  border-radius: 5px;
  transition: all 0.3s ease-in-out; /* 添加过渡效果 */
}

/* 重叠区域（黄色） */
.overlap-segment {
  position: absolute;
  width: 10px;
  background-color: #007FFF; /* Softer golden yellow */
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
  z-index: 3;
}
</style>
