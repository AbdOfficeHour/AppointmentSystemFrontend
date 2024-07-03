<script setup>
// 为方便后续变更，采用从DOM树开始定义与变更的方式

import {ref, onMounted, watch} from 'vue';
import {TableFormat} from "@/utils/index/format.js";

// 组件全局变量定义
const totalMinutes = 12 * 60 * 60 * 1000; // 12小时对应的毫秒数（8：00-20：00）
let timeSlots = ref([]); // 用于渲染的时间表信息

// 接收父组件传递的props
const props = defineProps(
  [
      "backendData",
  ]
);

watch(props, (newVal, oldVal) => {
  // 监听父组件传入参数变更
  if (newVal.backendData === null) {
    renderNoTable()
  }
  else {
    let backendDataTemp = newVal.backendData;
    let timeTableTemp = backendDataTemp.timeTable;
    // 格式化传入数据为渲染用数据
    timeSlots.value = TableFormat.timetable_format(timeTableTemp);
    renderTimeline(); // 执行时间表渲染，修改DOM树
  }
});

onMounted(() => {
  /**
   * 组件初始化，依据父组件传入的数据决定渲染逻辑
   */
  console.log('TableComponent组件开始挂载');
  clearTimeTable();
  if (props.backendData === null){
    renderNoTable(); // 父组件传入空数据，代表不具备可渲染数据，修改DOM树为空时间表提示
  }
  else{
    renderTimeline(); // 父组件传入时间表数据，执行时间表渲染，修改DOM树为时间表结构
  }
});

function queryElements() {
  /**
   * 在DOM树中查询到时间表对应的标签
   * 查询到后返回此标签
   */
  const appContainer = document.querySelector('#app .app-container');
  if (!appContainer) {
    console.error('没有在#app中找到.page-container元素');
    return ;
  }

  const appTableLayer = appContainer.querySelector('.table-layer');
  if (!appTableLayer) {
    console.error('没有在.page-container中找到.table-layer元素');
    return ;
  }

  const appTable = appTableLayer.querySelector('.table-component');
  if (!appTable) {
    console.error('没有在.table-layer中找到.table-component元素')
  }
  return appTable
}

function clearTimeTable() {
  /**
   * 在DOM树中清空先前的时间表 或 空时间表提示 以重新渲染
   */
  // 清除现有时间表
  const timelines = document.querySelectorAll('.timeline');
  const emptyPrompt = document.querySelectorAll('.empty-prompt');
  timelines.forEach(timeline => timeline.remove()); // 移除所有时间轴标签
  emptyPrompt.forEach(emptyPrompt => emptyPrompt.remove())
}

function renderNoTable() {
  /**
   * 当父组件传入的数据为空，表示不具备合适的数据以渲染时间表，渲染空时间表提示
   */
  // 查找DOM元素，用于执行挂载
  let appTable = queryElements();
  // 清除现有时间表
  clearTimeTable();

  // 渲染为空情况下的提示
  const emptyPrompt = document.createElement('div');
  emptyPrompt.classList.add('empty-prompt')
  emptyPrompt.textContent = '当前暂无可查看时间表';
  emptyPrompt.style.textAlign = 'center';
  emptyPrompt.style.color = 'gray';
  emptyPrompt.style.marginTop = '20px';
  emptyPrompt.style.fontSize = '18px';

  // 将提示挂载到appTable下
  appTable.appendChild(emptyPrompt);
}

function renderTimeline() {
  /**
   * 当父组件传入的数据可以用于渲染时间表，将传入数据转换为时间表
   */

  // 查找DOM元素，用于执行挂载
  let appTable = queryElements();
  // 清除现有时间表
  let timelines = clearTimeTable();

  // 渲染时间表
  timeSlots.value.forEach(slot => {
    const timeline = document.createElement('div');
    timeline.classList.add('timeline');
    appTable.appendChild(timeline); // 时间轴标签，子标签有time-labels、time-bar、teacher-label、date_label

    const teacherLabel = document.createElement('div');
    teacherLabel.classList.add('teacher-label');
    timeline.appendChild(teacherLabel); // 教师标签

    const dateLabel = document.createElement('div');
    dateLabel.classList.add('date-label');
    dateLabel.textContent = slot.date;
    timeline.appendChild(dateLabel); // 日期标签

    const timeLabels = document.createElement('div');
    timeLabels.classList.add('time-labels');
    timeline.appendChild(timeLabels); // 时间标签（8 - 20）

    const timeBar = document.createElement('div');
    timeBar.classList.add('time-bar');
    timeline.appendChild(timeBar); // 时间条标签

    for (let i = 8; i < 20; i++) {
      const timeLabel = document.createElement('div');
      timeLabel.classList.add('time-label');
      timeLabel.textContent = `${i}`;
      timeLabels.appendChild(timeLabel);
    } // 渲染timeLabel标签，为timeLabels的子标签

    const busyTimeElement = document.createElement("div");
    busyTimeElement.classList.add("busy-time");
    timeBar.appendChild(busyTimeElement); // 忙碌时间标签

    const availableTimeElement = document.createElement("div");
    availableTimeElement.classList.add("available-time");
    timeBar.appendChild(availableTimeElement); // 空闲时间标签

    slot.busy.forEach(slot => { // 忙碌时间段遍历渲染
      const currentDate = new Date(); // 使用当前日期（或者使用你需要的日期）
      const startParts = slot.start.split(':');
      const endParts = slot.end.split(':');
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), startParts[0], startParts[1]);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), endParts[0], endParts[1]);
      const duration = end - start;
      const busyElement = document.createElement("div");
      busyElement.classList.add("busy-time-slot");
      busyElement.style.width = `${(duration / totalMinutes) * 100}%`;
      busyElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
      busyTimeElement.appendChild(busyElement);
    });

    slot.available.forEach(slot => { // 空闲时间段遍历渲染
      const currentDate = new Date(); // 使用当前日期（或者使用你需要的日期）
      const startParts = slot.start.split(':');
      const endParts = slot.end.split(':');

      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), startParts[0], startParts[1]);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), endParts[0], endParts[1]);
      const duration = end - start;
      const availableElement = document.createElement("div");
      availableElement.classList.add("available-time-slot");
      availableElement.style.width = `${(duration / totalMinutes) * 100}%`;
      availableElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
      availableTimeElement.appendChild(availableElement);
    });
    appTable.appendChild(timeline); // 挂载至 #app .page-container .table-layer下
  });
}
</script>

<template>

</template>

<style>
body {
  font-family: Arial, sans-serif;
}
.timeline {
  width: 100%;
  position: relative;
  margin-bottom: 20px;
}
.time-labels {
  display: flex;
  justify-content: space-between;
  padding-top: 10px;
}
.time-label {
  flex: 1;
  text-align: left;
}
.time-bar {
  width: 100%;
  height: 50px;
  background-color: #f0f0f0;
  position: relative;
}
.busy-time, .available-time {
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
}
.busy-time-slot {
  background-color: gray;
  position: absolute;
  height: 100%;
  z-index: 1;
}
.available-time-slot {
  background-color: deepskyblue;
  position: absolute;
  height: 100%;
  z-index: 1;
}
</style>
