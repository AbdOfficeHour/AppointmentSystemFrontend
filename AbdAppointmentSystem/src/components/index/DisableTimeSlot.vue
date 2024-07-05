<script setup>
import {defineEmits, defineProps} from "vue";
import {onMounted, ref, watch} from "vue";
import {TableFormat} from "@/utils/index/format.js";

// 组件内全局变量定义
let selectDate = ref(null) // 被选中的日期
let startTime = ref(null) // 被选中的开始时间
let endTime = ref(null) // 被选中的结束时间
let timeSlots = ref([]) // 转换后的时间表

let isBackendDataNone = ref(null) // 后端返回的时间表数据是否为空

// 接收父组件传递的props
const props = defineProps({
  isDialogVisible: Boolean,
  backendData: Object
});

// 向父组件传递的事件
const emit = defineEmits(
    [
        'close',
        'submit'
    ]
)

onMounted(() => {
  /**
   * 组件初始化时被触发，从父组件接收信息并进行条件渲染/时间表数据处理
   */
  console.log("禁用时间段组件开始挂载")
  if (props.backendData === null) {
    isBackendDataNone = true
  }
  else {
    isBackendDataNone = false
    let timeTableTemp = props.backendData.timeTable
    timeSlots.value = TableFormat.timetable_format(timeTableTemp)
  }
  console.log(timeSlots.value)
})

watch(props, (newVal, oldVal) => {
  /**
   * 监听父组件传入参数变更
   */
  console.log(newVal.backendData)
  if (newVal.backendData === null) {
    isBackendDataNone = true
  }
  else {
    isBackendDataNone = false
    let timeTableTemp = newVal.backendData.timeTable
    timeSlots.value = TableFormat.timetable_format(timeTableTemp)
  }
})

function banTimeInfoCheck() {
  /**
   * 对用户提交的表单信息进行合理性检测
   */
  // 当信息填写不完整时
  if (selectDate.value === null || startTime.value === null || endTime.value === null) {
    console.warn("日期或时间未选择")
    alert("警告：暂时未选择需要禁用的日期或时间")
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
          alert("警告：禁用时间段和繁忙时间段重叠，请处理学生预约事件后重试")
          return;
        }
      }
    }
  }
}

function closeDisableComponents() {
  /**
   * 当用户关闭禁用组件时触发
   */
  emit('close');
}

function submitDisableInfo() {
  /**
   * 当用户提交禁用表单时触发
   */
  banTimeInfoCheck()
  let comfirm_result = confirm("确认要禁用这个时间段？")
  if (comfirm_result){
    console.log("时间段合理性校验通过，上传禁用时间表单")
    confirm("禁用时间段成功")
    emit('submit')
  }
  else {
    console.log("取消上传禁用时间表单")
    emit('close')
  }
}
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
        <div class="dateSelector">
          <div class="intro">禁用时间日期</div>
          <el-date-picker
              v-model="selectDate"
              type="date"
              placeholder="Select a date"
          />
        </div>
        <div class="timeSelector">
          <div class="intro">禁用时间段</div>
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
  z-index: 100; /* 确保弹框在次上方 */
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

.dateSelector, .timeSelector, .uploadButton {
  margin-top: 20px;
}
</style>
