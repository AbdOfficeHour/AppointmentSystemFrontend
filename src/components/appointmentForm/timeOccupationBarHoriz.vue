<template>
  <div class="bar-container">
    <div class="time-bar-container">
      <!-- 灰色时间轴背景 -->
      <div class="time-axis">
        <!-- 绘制可用条（绿色） -->
        <div
            v-for="(item, index) in computedData"
            :key="index"
            class="available-segment"
            :style="item.style"
        ></div>

        <el-tooltip
            class="box-item"
            effect="dark"
            content="非法时间段"
            placement="top"
        >
          <!-- 绘制选定条 -->
          <div
              v-if="Object.keys(selectedRange).length > 0"
              class="selected-segment"
              :style="selectedStyle"
          ></div>
        </el-tooltip>

        <el-tooltip
            class="box-item"
            effect="dark"
            content="选择的时间段"
            placement="top"
        >
          <!-- 绘制重叠区域（黄色） -->
          <div
              v-for="(overlap, index) in getOverlappingSegments"
              :key="`overlap-${index}`"
              class="overlap-segment"
              :style="{
              left: `${getRatioPercent(overlap.overlap.startTime)}%`,
              width: `${getRatioPercent(overlap.overlap.endTime) - getRatioPercent(overlap.overlap.startTime)}%`
            }"
          ></div>
        </el-tooltip>

        <!-- 时间刻度 -->
        <div class="tick-marks">
          <div
              v-for="(tick, index) in tickMarks"
              :key="index"
              class="tick"
              :class="tick.type"
              :style="{ left: `${((tick.time - startHour) / totalHours) * 100}%` }"
          >
            <!-- 仅长刻度显示数字 -->
            <span v-if="tick.type === 'long'" class="tick-label">{{ tick.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, watch} from 'vue';

// 接收外部传入的数据与选中区间
const props = defineProps({
  data: {
    type: Array,
    default: () => [
      {startTime: 1738454400000, endTime: 1738458174000},
      {startTime: 1738459494000, endTime: 1738468487000},
      {startTime: 1738472387000, endTime: 1738477920000},
      {startTime: 1738482060000, endTime: 1738497600000}
    ]
  },
  selectedRange: {
    type: Object,
    default: () => ({})
  }
});

// 定义时间轴的起始与结束时间
const startHour = 8;
const endHour = 22;
const totalHours = endHour - startHour;

function adjustTimeToRange(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getHours();
  if (hour >= startHour && hour < endHour) {
    return timestamp;
  }
  if (hour < startHour) {
    date.setHours(startHour, 0, 0, 0);
  } else {
    date.setHours(endHour, 0, 0, 0);
  }
  return date.getTime();
}

// 不再需要格式化时间的函数，因为不显示文字标签

// 计算给定时间戳在当前时间轴中的百分比（用于 left 与 width）
function getRatioPercent(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const past = hour + minute / 60 - startHour;
  return (past / totalHours) * 100;
}

function calcOccupiedStyle({startTime, endTime}) {
  const leftPercent = getRatioPercent(startTime);
  const rightPercent = getRatioPercent(endTime);
  const widthPercent = rightPercent - leftPercent;
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`
  };
}

const computedData = computed(() => {
  return props.data.map(item => {
    const style = calcOccupiedStyle(item);
    return {...item, style};
  });
});

watch(() => props.data, (newData) => {
}, {deep: true});

const selectedStyle = computed(() => {
  if (!props.selectedRange) return {};
  const {startTime, endTime} = props.selectedRange;
  const leftPercent = getRatioPercent(adjustTimeToRange(startTime));
  const rightPercent = getRatioPercent(adjustTimeToRange(endTime));
  const widthPercent = rightPercent - leftPercent;
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    backgroundColor: '#D25F5F',
    position: 'absolute',
    height: '10px',
    borderRadius: '5px'
  };
});

// 计算重叠时间段，保持逻辑不变
function getOverlappingTime(occupiedStartTime, occupiedEndTime, selectedStartTime, selectedEndTime) {
  const baseDate = new Date();
  baseDate.setHours(0, 0, 0, 0);
  const occupiedStart = new Date(occupiedStartTime);
  const occupiedEnd = new Date(occupiedEndTime);
  const selectedStart = new Date(selectedStartTime);
  const selectedEnd = new Date(selectedEndTime);

  function toSameDayTimestamp(originalDate) {
    const newDate = new Date(baseDate);
    newDate.setHours(
        originalDate.getHours(),
        originalDate.getMinutes(),
        originalDate.getSeconds(),
        originalDate.getMilliseconds()
    );
    return newDate.getTime();
  }

  const newOccupiedStartTime = toSameDayTimestamp(occupiedStart);
  const newOccupiedEndTime = toSameDayTimestamp(occupiedEnd);
  const newSelectedStartTime = toSameDayTimestamp(selectedStart);
  const newSelectedEndTime = toSameDayTimestamp(selectedEnd);
  const overlapStartTime = Math.max(newOccupiedStartTime, newSelectedStartTime);
  const overlapEndTime = Math.min(newOccupiedEndTime, newSelectedEndTime);
  if (overlapStartTime < overlapEndTime) {
    return {startTime: overlapStartTime, endTime: overlapEndTime};
  }
  return null;
}

const getOverlappingSegments = computed(() => {
  const {startTime: selectedStart, endTime: selectedEnd} = props.selectedRange;
  return computedData.value
      .map(item => {
        const overlap = getOverlappingTime(
            item.startTime,
            item.endTime,
            adjustTimeToRange(selectedStart),
            adjustTimeToRange(selectedEnd)
        );
        return overlap ? {...item, overlap} : null;
      })
      .filter(item => item !== null);
});

// 计算时间刻度（长刻度与短刻度）
// 长刻度：整点，从 startHour 到 endHour
// 短刻度：半点，从 startHour 到 endHour-1（例如 8:30 至 20:30）
const tickMarks = computed(() => {
  const ticks = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    ticks.push({
      time: hour,
      label: hour, // 显示数字
      type: 'long'
    });
  }
  for (let hour = startHour; hour < endHour; hour++) {
    ticks.push({
      time: hour + 0.5,
      label: '', // 短刻度不显示文字
      type: 'short'
    });
  }
  // 根据时间排序
  return ticks.sort((a, b) => a.time - b.time);
});
</script>

<style scoped>
/* 整体容器 */
.time-bar-container {
  position: relative;
  width: 100%;
  height: 40px; /* 增大高度以容纳刻度 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 外层容器 */
.bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 灰色时间轴背景 */
.time-axis {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: #B8B8B8;
  border-radius: 5px;
  margin: 10px 20px 0; /* 上边距留出空间放刻度 */
}

/* 可用区段（绿色） */
.available-segment {
  position: absolute;
  height: 10px;
  background-color: #71a66e;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

/* 选中条 */
.selected-segment {
  position: absolute;
  height: 10px;
  background-color: #D25F5F;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

/* 重叠区域（黄色） */
.overlap-segment {
  position: absolute;
  height: 10px;
  background-color: #007FFF;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

/* 时间刻度容器 */
.tick-marks {
  position: absolute;
  width: 100%;
  top: 10px; /* 刻度显示在时间轴上方，并适当调整位置 */
  left: 0;
  pointer-events: none;
}

/* 每个刻度线 */
.tick {
  position: absolute;
  bottom: 0;
  width: 2px; /* 加粗刻度线 */
  background-color: #555; /* 使用柔和的深灰色 */
  transition: all 0.3s ease;
}

/* 长刻度样式 */
.tick.long {
  height: 14px; /* 加长长刻度 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加细微阴影效果 */
}

/* 短刻度样式 */
.tick.short {
  height: 8px; /* 较短 */
  opacity: 0.8; /* 略微透明 */
}

/* 刻度标签样式 */
.tick-label {
  position: absolute;
  top: 14px; /* 调整标签位置 */
  left: -9px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  padding: 2px 4px;
  border-radius: 4px;

}
</style>
