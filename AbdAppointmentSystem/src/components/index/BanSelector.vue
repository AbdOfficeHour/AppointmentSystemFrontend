<script setup>
import {onMounted, ref, watch} from "vue";
import {OfficeHourTableFormat} from "@/script/index/format.js";

  const props = defineProps(['timeTable', 'getSelection'])
  const emits = defineEmits(['banTimeCancel']) // 父组件监听的事件
  let selectDate = ref(null) // 被选中的日期
  let startTime = ref(null) // 被选中的开始时间
  let endTime = ref(null) // 被选中的结束时间
  let timeSlots = ref([]) // 已有预约的时间段
  let getSelection = ref(null) // 被用户选中的教师 或 教师账号本人（父组件传递的内容）

  onMounted(() => {
    console.log("BanSelector组件挂载完成")
    getSelection = props.getSelection
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(props.timeTable, getSelection.value)
  })

  watch(props, (newVal, oldVal) => {
    // 监听父组件传入参数变更
    console.log('BanSelector组件侦听器发现父组件传递的信息发生变化，' +
        '并开始更新');
    let temp_timeTable = newVal.timeTable;
    getSelection.value = newVal.getSelection;
    console.log('BanSelector组件侦听器发现父组件传递的信息发生变化，' +
        '并更新完成');
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(temp_timeTable, getSelection.value);
  })

  function banTimeUpload() {
    console.log("禁用时间表单上传")
    for (let i = 0; i < timeSlots.value.length; i++) {
      if (timeSlots.value[i].date === selectDate.value) {
        let busyTimeList = timeSlots.value[i].busy
        for (let j = 0; j < busyTimeList.length; j++) {
          return;
        }
      }
    }
  }

  function banTimeCancel() {
    console.log("禁用时间表单取消")
    // 取消上传表单，则收起表单
    emits('banTimeCancel')
  }

</script>

<template>
  <div class="dateSelector">
    <div class="intro">{{$t("index.ban_date")}}</div>
    <el-date-picker
        v-model="selectDate"
        type="date"
        placeholder="Select a date"
    />
  </div>
  <div class="timeSelector">
    <div class="intro">{{$t("index.ban_time")}}</div>
    <el-time-select
        v-model="startTime"
        style="width: 240px"
        :max-time="endTime"
        class="mr-4"
        placeholder="Start time"
        start="08:00"
        step="00:05"
        end="20:00"
    />
    <span> --> </span>
    <el-time-select
        v-model="endTime"
        style="width: 240px"
        :min-time="startTime"
        placeholder="End time"
        start="08:00"
        step="00:05"
        end="20:00"
    />
  </div>
  <div class="uploadButton">
    <el-button type="primary"
               @click="banTimeUpload">
      {{$t("index.ban_time_upload")}}
    </el-button>
    <el-button type="info"
               @click="banTimeCancel">
      {{$t("index.ban_time_cancel")}}
    </el-button>
  </div>
</template>

<style scoped>
  .dateSelector, .timeSelector, .uploadButton {
    margin-top: 20px;
  }
</style>