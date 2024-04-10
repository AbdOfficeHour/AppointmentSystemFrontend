<template>

</template>

<script setup>
  import {ref, onMounted, watch} from 'vue';
  import {OfficeHourTableFormat} from "@/script/index/format.js";
  import router from "@/router/index.js";

  const props = defineProps(['timeSlots', "getSelection"]);
  const totalMinutes = 12 * 60 * 60 * 1000; // 12小时对应的毫秒数
  let getSelection = ref(null); // 选择器选中的选项（父组件传递的内容）
  let timeSlots = ref([]); // 用于渲染的时间表信息

  watch(props, (newVal, oldVal) => {
    console.log('OfficeHourTimeTable侦听器发现父组件传递的信息发生变化，' +
        '开始更新');
    let temp_timeTable = newVal.timeSlots;
    getSelection.value = newVal.getSelection;
    console.log('OfficeHourTimeTable侦听器发现父组件传递的信息发生变化，' +
        '并更新完成');
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(temp_timeTable, getSelection.value);
    console.log('时间表数据信息更新完成');
    renderTimeline();
  });

  function navigateToAppointment(date, teacher) {
    router.push({
      name: 'Appointment',
      query: {
        date: date,
        selectTeacher: teacher
      }
    })
  }

  onMounted(() => {
    console.log('mounted');
    renderTimeline();
  });

  function renderTimeline() {
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

    const timelines = document.querySelectorAll('.timeline');
    timelines.forEach(timeline => timeline.remove()); // Remove existing timelines

    timeSlots.value.forEach(slot => {
      const timeline = document.createElement('div');
      timeline.classList.add('timeline');
      appTable.appendChild(timeline); // 时间轴元素，存储time-labels、time-bar、teacher-label、date_label

      const teacherLabel = document.createElement('div');
      teacherLabel.classList.add('teacher-label');
      teacherLabel.textContent = getSelection.value;
      timeline.appendChild(teacherLabel);

      const dateLabel = document.createElement('div');
      dateLabel.classList.add('date-label');
      dateLabel.textContent = slot.date;
      timeline.appendChild(dateLabel);

      const timeLabels = document.createElement('div');
      timeLabels.classList.add('time-labels');
      timeline.appendChild(timeLabels);

      const timeBar = document.createElement('div');
      timeBar.classList.add('time-bar');
      timeline.appendChild(timeBar);

      timeline.addEventListener('click', () => {
        console.log("检测到点击，准备执行跳转操作")
        navigateToAppointment(slot.date, getSelection.value)
      })

      for (let i = 8; i < 20; i++) {
        const timeLabel = document.createElement('div');
        timeLabel.classList.add('time-label');
        timeLabel.textContent = `${i}`;
        timeLabels.appendChild(timeLabel);
      } // 渲染timeLabels

      const busyTimeElement = document.createElement("div");
      busyTimeElement.classList.add("busy-time");
      timeBar.appendChild(busyTimeElement);

      const availableTimeElement = document.createElement("div");
      availableTimeElement.classList.add("available-time");
      timeBar.appendChild(availableTimeElement);

      slot.busy.forEach(slot => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        const duration = end - start;
        const busyElement = document.createElement("div");
        busyElement.classList.add("busy-time-slot");
        busyElement.style.width = `${(duration / totalMinutes) * 100}%`;
        busyElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
        busyTimeElement.appendChild(busyElement);
      });

      slot.available.forEach(slot => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        const duration = end - start;
        const availableElement = document.createElement("div");
        availableElement.classList.add("available-time-slot");
        availableElement.style.width = `${(duration / totalMinutes) * 100}%`;
        availableElement.style.left = `${((start - new Date(start.getFullYear(), start.getMonth(), start.getDate(), 8)) / totalMinutes) * 100}%`;
        availableTimeElement.appendChild(availableElement);
      });

      appTable.appendChild(timeline);
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
