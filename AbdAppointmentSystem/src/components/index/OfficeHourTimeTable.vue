<template>

</template>

<script setup>
  // 为方便后续变更，采用从DOM树开始定义与变更的方式

  import {ref, onMounted, watch} from 'vue';
  import {OfficeHourTableFormat} from "@/utils/index/format.js";
  import router from "@/router/index.js";
  import {useI18n} from "vue-i18n";

  const { t } = useI18n(); // i18n国际化

  const props = defineProps(['timeSlots', "getSelection", "isNavigate"]); // 父组件传入参数
  const totalMinutes = 12 * 60 * 60 * 1000; // 12小时对应的毫秒数（8：00-20：00）
  let getSelection = ref(null); // 选择器选中的选项（父组件传递的内容）
  let timeSlots = ref([]); // 用于渲染的时间表信息（指定教师的时间表）
  let isNavigate = ref(false); // 是否能跳转至预约页面

  watch(props, (newVal, oldVal) => {
    // 监听父组件传入参数变更
    console.log('OfficeHourTimeTable组件侦听器发现父组件传递的信息发生变化，' +
        '并开始更新');
    let temp_timeTable = newVal.timeSlots;
    isNavigate.value = newVal.isNavigate;
    getSelection.value = newVal.getSelection;
    console.log('OfficeHourTimeTable组件侦听器发现父组件传递的信息发生变化，' +
        '并更新完成');

    // 格式化传入数据为渲染用数据
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(temp_timeTable, getSelection.value);
    console.log('用于渲染的时间表数据更新完成');
    renderTimeline(); // 执行时间表渲染，修改DOM树
  });

  function navigateToAppointment(date, teacher) {
    // 带参跳转至预约界面
    if (!isNavigate.value) {
      console.warn('权限不允许跳转至预约页面');
      return;
    }
    else{
      console.log('准备跳转到预约页面');
      router.push({
        name: 'Appointment',
        query: {
          date: date,
          selectTeacher: teacher
        }
      })
    }
  }

  onMounted(() => {
    console.log('OfficeHourTimeTable组件挂载完成，准备渲染时间表');
    renderTimeline(); // 执行时间表渲染，修改DOM树
  });

  function renderTimeline() {
    // 查找DOM元素，用于执行挂载
    const appContainer = document.querySelector('#app .page-container');
    if (!appContainer) {
      console.error('没有在#app中找到.page-container元素');
      return;
    }

    const appTable = appContainer.querySelector('.table');
    if (!appTable) {
      console.error('没有在.page-container中找到.table元素');
      return;
    }
    console.log('开始渲染时间表');

    // 清除现有时间表
    const timelines = document.querySelectorAll('.timeline');
    timelines.forEach(timeline => timeline.remove()); // 移除所有时间轴标签

    if (getSelection.value === null) {
      // 没有选中任何教师时的处理
      const timeline = document.createElement('div');
      timeline.classList.add('timeline');
      timeline.textContent = t("index.select_teacher_DNE_hint");
      appTable.appendChild(timeline);
      console.warn('没有选择教师');
      return;
    }

    if (timeSlots.value.length === 0) {
      // 无时间表信息时的处理，在排除无教师选中的情况后，则表明当前教师没有OfficeHour活动
      const timeline = document.createElement('div');
      timeline.classList.add('timeline');
      timeline.textContent = t("index.select_teacher_no_officehour");
      appTable.appendChild(timeline);
      console.warn('您暂时没有OfficeHour活动');
      return;
    }

    // 渲染时间表
    timeSlots.value.forEach(slot => {
      const timeline = document.createElement('div');
      timeline.classList.add('timeline');
      appTable.appendChild(timeline); // 时间轴标签，子标签有time-labels、time-bar、teacher-label、date_label

      const teacherLabel = document.createElement('div');
      teacherLabel.classList.add('teacher-label');
      teacherLabel.textContent = getSelection.value;
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

      timeline.addEventListener('click', () => {
        navigateToAppointment(slot.date, getSelection.value)
      }) // 时间轴标签的点击事件监听器，点击时执行跳转

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
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        const duration = end - start;
        const busyElement = document.createElement("div");
        busyElement.classList.add("busy-time-slot");
        busyElement.style.width = `${(duration / totalMinutes) * 100}%`;
        busyElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
        busyTimeElement.appendChild(busyElement);
      });

      slot.available.forEach(slot => { // 空闲时间段遍历渲染
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        const duration = end - start;
        const availableElement = document.createElement("div");
        availableElement.classList.add("available-time-slot");
        availableElement.style.width = `${(duration / totalMinutes) * 100}%`;
        availableElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
        availableTimeElement.appendChild(availableElement);
      });

      appTable.appendChild(timeline); // 挂载至 #app .page-container .table下
    });

  }
</script>

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
