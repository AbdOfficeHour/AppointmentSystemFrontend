<script setup>
import {computed, watch} from 'vue';

// 接收父组件传递的props
const props = defineProps({
  availableData: {
    type: Array,
    default: () => [
      {startTime: 1738454400000, endTime: 1738458000000},
      {startTime: 1738468800000, endTime: 1738476000000},
      {startTime: 1738483200000, endTime: 1738504799000},
    ]
  },
  waitingData: {
    type: Array,
    default: () => [
      {startTime: 1738458000000, endTime: 1738463400000},
      {startTime: 1738479600000, endTime: 1738483200000},
    ]
  },
});

// 定义时间轴的起始与结束时间
const startHour = 8;
const endHour = 22;
const totalHours = endHour - startHour;

// 计算属性，处理后的可用时段后端数据
const computedAvailableData = computed(() => {
  return props.availableData.map(item => {
    const style = calcOccupiedStyle(item);
    return {...item, style};
  });
});

// 计算属性，处理后的等待时段后端数据
const computedWaitingData = computed(() => {
  return props.waitingData.map(item => {
    const style = calcOccupiedStyle(item);
    return {...item, style};
  });
});

// 计算属性，计算时间刻度（长刻度与短刻度）
const tickMarks = computed(() => {
  // 长刻度：整点，从 startHour 到 endHour
  // 短刻度：半点，从 startHour 到 endHour-1（例如 8:30 至 20:30）
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
  return ticks.sort((a, b) => a.time - b.time); // 根据时间排序
});

/**
 * 计算时间戳在时间轴中的百分比（用于 left 与 width）
 * @param timestamp 时间戳
 * @returns {number} 百分比
 */
function getRatioPercent(timestamp) {
  const date = new Date(timestamp);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const past = hour + minute / 60 - startHour;
  return (past / totalHours) * 100;
}

/**
 * 计算占用时间段的样式
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns {{left: string, width: string}} 占时间条的百分比
 */
function calcOccupiedStyle({startTime, endTime}) {
  const leftPercent = getRatioPercent(startTime);
  const rightPercent = getRatioPercent(endTime);
  const widthPercent = rightPercent - leftPercent;
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`
  };
}

watch([() => props.availableData, () => props.waitingData], (newData) => {

}, {deep: true});
</script>

<template>
  <div class="bar-container">
    <div class="time-bar-container">
      <div class="time-axis">
        <!-- 绘制可用条（绿色） -->
        <div
          v-for="(item, index) in computedAvailableData"
          :key="index"
          class="available-segment"
          :style="item.style"
        />
        <div
          v-for="(item, index) in computedWaitingData"
          :key="index"
          class="waiting-segment"
          :style="item.style"
        />
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

<style scoped>
.time-bar-container {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: inherit;
}

.bar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.time-axis {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: #B8B8B8;
  border-radius: 5px;
  margin: 10px 20px 0;
}

.available-segment {
  position: absolute;
  height: 10px;
  background-color: #71a66e;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

.waiting-segment {
  position: absolute;
  height: 10px;
  background-color: #F7D08C;
  border-radius: 5px;
  transition: all 0.3s ease-in-out;
}

.tick-marks {
  position: absolute;
  width: 100%;
  top: 10px;
  left: 0;
  pointer-events: none;
}

.tick {
  position: absolute;
  bottom: 0;
  width: 2px;
  background-color: #555;
  transition: all 0.3s ease;
}

.tick.long {
  height: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.tick.short {
  height: 8px;
  opacity: 0.8;
}

.tick-label {
  position: absolute;
  top: 14px;
  left: -9px;
  font-size: 12px;
  font-weight: bold;
  color: #333;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
