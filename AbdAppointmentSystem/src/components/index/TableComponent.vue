<script setup>
import { ref, onMounted, watch } from 'vue';

import { TableFormat } from "@/utils/index/format.js";
/* 注: 由于时间粒度为1分钟的需求，难以复用现有的开源框架内组件，本组件从DOM树开始实现 */

// 接收父组件传递的props
const props = defineProps(
    [
        "backendData", // 后端返回的时间表数据，用于渲染时间表
        "authorityTable", // 用户的权限表数据
        "isOfficeHour" // 当前界面是否为OfficeHour界面
    ]
);

// TableComponent组件全局变量定义
const totalMinutes = 12 * 60 * 60 * 1000; // 12小时对应的毫秒数（8：00-20：00）
let timeSlots = ref([]); // 用于渲染的时间表信息
let local_authorityTable = ref({}); // 本地权限表

/**
 * 监听父组件传入参数的变更
 */
watch(props, (newVal) => {
  if (newVal.backendData === null) {
    // 父组件传入后端时间表数据为空，则渲染空时间表提示
    renderNoTable()
  }
  else {
    let backendDataTemp = newVal.backendData;
    if (props.authorityTable) {
      // 父组件传入了权限表数据，按照权限表数据渲染
      local_authorityTable.value = newVal.authorityTable;
    }
    else {
      // 父组件传入权限表为空，为学生选中了"no teachers available"，按照默认权限表数据渲染
      local_authorityTable.value = {
        'OfficeHour:approve': false,
      }
    }
    let timeTableTemp = backendDataTemp.timeTable;
    timeSlots.value = TableFormat.timetable_format(timeTableTemp); // 格式化传入数据为渲染用数据
    renderTimeline(); // 执行时间表渲染，修改DOM树
  }
});

/**
 * TableComponent组件初始化
 * 依据父组件传入的数据决定渲染逻辑
 */
onMounted(() => {
  console.log('TableComponent组件开始挂载');
  clearTimeTable();
  if (props.backendData === null){
    renderNoTable(); // 父组件传入空数据，代表不具备可渲染数据，修改DOM树为空时间表提示
  }
  else{
    renderTimeline(); // 父组件传入时间表数据，执行时间表渲染，修改DOM树为时间表结构
  }
});

/**
 * 在DOM树中查询到时间表对应的标签
 * 查询到后返回此标签
 */
function queryElements() {
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
    return ;
  }
  return appTable
}

/**
 * 在DOM树中清空先前的时间表 或 空时间表提示 以重新渲染
 */
function clearTimeTable() {
  // 查找时间表元素
  const timelines = document.querySelectorAll('.timeline');
  const timeLabels = document.querySelectorAll('.time-labels');
  const emptyPrompt = document.querySelectorAll('.empty-prompt-parent');

  // 清空HTML元素以清空时间表
  timelines.forEach(timeline => timeline.remove()); // 移除所有时间轴标签
  emptyPrompt.forEach(emptyPrompt => emptyPrompt.remove()) // 移除所有空时间表标签
  timeLabels.forEach(timeLabel => timeLabel.remove()); // 移除所有时间标签
}

/**
 * 当父组件传入的数据为空，表示不具备合适的数据以渲染时间表，渲染空时间表提示
 */
function renderNoTable() {
  // 查找DOM元素，用于执行挂载
  let appTable = queryElements();
  // 清除现有时间表
  clearTimeTable();

  // 渲染为空情况下的提示
  const emptyPrompt = document.createElement('div'); // 嵌套两个div的父组件，用于展示空时间表信息
  emptyPrompt.classList.add('empty-prompt-parent');

  const emptyPrompt_1 = document.createElement('div'); // 展示空时间表信息的第一行
  const emptyPrompt_2 = document.createElement('div'); // 展示空时间表信息的第二行

  emptyPrompt_1.classList.add('empty-prompt')
  emptyPrompt_1.textContent = '暂无可查看时间表信息 No timetable information available';
  emptyPrompt_1.style.textAlign = 'center';
  emptyPrompt_1.style.color = 'gray';
  emptyPrompt_1.style.marginTop = '20px';
  emptyPrompt_1.style.fontSize = '18px';

  emptyPrompt_2.classList.add('empty-prompt')
  emptyPrompt_2.style.textAlign = 'center';
  emptyPrompt_2.style.color = 'gray';
  emptyPrompt_2.style.marginTop = '20px';
  emptyPrompt_2.style.fontSize = '18px';

  if (props.isOfficeHour) {
    // OfficeHour平台下的空时间表提示
    if (local_authorityTable.value['OfficeHour:approve']) {
      // 对于有OfficeHour审批权限的用户(教师)
      emptyPrompt_2.textContent = '当前暂无OfficeHour活动 There is no OfficeHour activity';
    } else {
      // 其他用户(学生)
      emptyPrompt_2.textContent = '请选择要查看的教师 Please select the teacher you want to view';
    }
  }
  else{
    // Classroom平台下的空时间表提示
    emptyPrompt_2.textContent = '请选择要查看的教室 Please select the classroom you want to view';
  }

  // 将空时间表提示一并挂载到appTable下
  emptyPrompt.appendChild(emptyPrompt_1);
  emptyPrompt.appendChild(emptyPrompt_2);
  appTable.appendChild(emptyPrompt);
}

/**
 * 当父组件传入的数据可以用于渲染时间表，将传入数据转换为时间表
 */
function renderTimeline() {
  // 查找DOM元素，用于执行挂载
  let appTable = queryElements();
  // 清除现有时间表
  clearTimeTable();

  const timeLabels = document.createElement('div');
  timeLabels.classList.add('time-labels');
  appTable.appendChild(timeLabels); // 时间标签（8 - 20）

  for (let i = 8; i < 20; i++) {
    const timeLabel = document.createElement('div');
    timeLabel.classList.add('time-label');
    timeLabel.textContent = `${i}:00`;
    timeLabels.appendChild(timeLabel);
  } // 渲染timeLabel标签，为timeLabels的子标签

  // 渲染时间表
  timeSlots.value.forEach(slot => {
    const timeline = document.createElement('div');
    timeline.classList.add('timeline');
    appTable.appendChild(timeline); // 时间轴标签，子标签有time-labels、time-bar、teacher-label、date_label

    const dateLabel = document.createElement('div');
    dateLabel.classList.add('date-label');
    dateLabel.textContent = slot.date;
    timeline.appendChild(dateLabel); // 日期标签

    const timeBar = document.createElement('div');
    timeBar.classList.add('time-bar');
    timeline.appendChild(timeBar); // 时间条标签

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
      busyElement.style.height = `${(duration / totalMinutes) * 100}%`;
      busyElement.style.top = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
      busyTimeElement.appendChild(busyElement);

      // 添加开始和结束时间的文字
      const timeText = document.createElement("span");
      timeText.classList.add("time-text");
      timeText.textContent = `${slot.start} - ${slot.end}`;
      if (duration >= 600000) {
        busyElement.appendChild(timeText);
      }
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
      availableElement.style.height = `${(duration / totalMinutes) * 100}%`;
      availableElement.style.top = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
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
  display: flex;
  flex-direction: column;
  border: 1px solid;
}

.time-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: 30px;
}

.time-label {
  flex: 1;
  text-align: left;
}

.time-bar {
  height: 100%;
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
  background-color: #b7b4b4; /*淡灰色*/
  position: absolute;
  width: 100%;
  z-index: 1;
  display: grid;
  place-items: center;
}

.available-time-slot {
  background-color: #d4dffd; /*淡蓝色*/
  position: absolute;
  width: 100%;
  z-index: 1;
  display: grid;
}

.time-labels {
  margin-right: 10px;
}

.date-label {
  height: 30px;
  border-bottom-style: solid;
}

.empty-prompt {
  text-align: center;
  color: gray;
  margin-top: 20px;
  font-size: 18px;
  width: 100%;
}

.empty-prompt-parent {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.time-text {
  width: 100%;
  text-align: center;
}

.table-layer {
  height: 1000px;
  display: grid;
}

.table-component {
  height: 100%;
}
</style>
