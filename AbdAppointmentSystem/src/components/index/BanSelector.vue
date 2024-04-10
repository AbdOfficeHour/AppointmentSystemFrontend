<script setup>
import {onMounted, ref, watch} from "vue";
import {OfficeHourTableFormat} from "@/utils/index/format.js";

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
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(props.timeTable, getSelection)
  })

  watch(props, (newVal, oldVal) => {
    // 监听父组件传入参数变更
    console.log('BanSelector组件侦听器发现父组件传递的信息发生变化，' +
        '并开始更新');
    let temp_timeTable = newVal.timeTable;
    getSelection.value = newVal.getSelection;
    console.log('BanSelector组件侦听器发现父组件传递的信息发生变化，' +
        '并更新完成');
    timeSlots.value = OfficeHourTableFormat.officehour_timetable_format(temp_timeTable, getSelection);
  })

  function banTimeUpload() {
    // 当信息填写不完整时
    if (selectDate.value === null || startTime.value === null || endTime.value === null) {
      console.warn("日期或时间未选择")
      return;
    }

    // 信息填写完整，进行时间段合理性校验
    for (let i = 0; i < timeSlots.value.length; i++) {
      console.log("时间段合理性校验，正在校验第" + (i+1) + "个时间段")
      // 对日期进行格式化，只比较日期本身
      // 此时只需要比较日期本身，故设置时间均为0点0分0秒0毫秒
      let timeSlotsDate = new Date(timeSlots.value[i].date)
      timeSlotsDate.setHours(0, 0, 0, 0)
      let selectDateDate = new Date(selectDate.value)
      selectDateDate.setHours(0, 0, 0, 0)

      if (selectDateDate.getTime() === timeSlotsDate.getTime()) { // 要比较日期的值，使用getTime方法
        let busyTimeList = timeSlots.value[i].busy

        // 时间格式化
        // 设置start和end变量的日期部分与之前的日期一致
        let start = new Date(selectDateDate)
        let end = new Date(selectDateDate)

        // 设置start和end变量的时间部分
        start.setHours(startTime.value.split(":")[0], startTime.value.split(":")[1], 0, 0);
        end.setHours(endTime.value.split(":")[0], endTime.value.split(":")[1], 0, 0);

        for (let j = 0; j < busyTimeList.length; j++) {
          let busyStart = new Date(busyTimeList[j].start)
          let busyEnd = new Date(busyTimeList[j].end)

          // 判断时间是否重叠
          if ((start.getTime() >= busyStart.getTime() && start.getTime() < busyEnd.getTime()) ||
              (end.getTime() > busyStart.getTime() && end.getTime() <= busyEnd.getTime()) ||
              (start.getTime() <= busyStart.getTime() && end.getTime() >= busyEnd.getTime())) {
            console.warn("禁用时间段和繁忙时间段重叠")
            return;
          }
        }
      }
    }

    // 时间段合理性校验通过，上传表单
    console.log("时间段合理性校验通过，上传禁用时间表单")
    emits('banTimeCancel')
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