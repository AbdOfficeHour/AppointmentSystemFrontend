<script setup>
import {reactive, ref, computed} from 'vue'
import { ElMessageBox } from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/MyAppointment/eventUtil.js'

const dialogTableVisible = ref(false)
const data = ref([])
const mode = ref(localStorage.getItem("mode")?localStorage.getItem("mode"):"officeHour")
const formatData = computed(() => {
  if(mode.value === "officeHour")
    return EventUtil.getOfficeHourFormatData(data.value)
  else
    return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = reactive({
  data: {}
})

/*
模拟数据
 */
const virtualDataOfficeHour = [
  {
    id: 1,
    student_name: "陈思凡",
    teacher_name: "张三",
    time: {
      date: new Date(2024, 7 - 1, 5, 0, 0, 0,).getTime(),
      startTime: new Date(2024, 7 - 1, 5, 14, 0, 0).getTime(),
      endTime: new Date(2024, 7 - 1, 5, 14, 30, 0).getTime()
    },
    note: "一些备注",
    question: "问题",
    present: ["李四", "王五"],
    state: 2,
    refuse_result: "",
    work_summary: ""
  },
  {
    id: 2,
    student_name: "陈思凡",
    teacher_name: "张三",
    time: {
      date: new Date(2024, 7 - 1, 4, 0, 0, 0,).getTime(),
      startTime: new Date(2024, 7 - 1, 4, 14, 0, 0).getTime(),
      endTime: new Date(2024, 7 - 1, 4, 14, 30, 0).getTime()
    },
    note: "一些备注",
    question: "问题",
    present: ["李四", "王五"],
    state: 3,
    refuse_result: "",
    work_summary: ""
  },
  {
    id: 3,
    student_name: "陈思凡",
    teacher_name: "张三",
    time: {
      date: new Date(2024, 7 - 1, 5, 0, 0, 0,).getTime(),
      startTime: new Date(2024, 7 - 1, 5, 15, 0, 0).getTime(),
      endTime: new Date(2024, 7 - 1, 5, 15, 30, 0).getTime()
    },
    note: "一些备注",
    question: "问题",
    present: ["李四", "王五"],
    state: 7,
    refuse_result: "",
    work_summary: ""
  },
]
const virtualDataClassroom = [
  {
    id: 1,
    applicant: "陈思凡",
    classroom: "106",
    time: {
      date: new Date(2024, 7 - 1, 5, 0, 0, 0,).getTime(),
      startTime: new Date(2024, 7 - 1, 5, 14, 0, 0).getTime(),
      endTime: new Date(2024, 7 - 1, 5, 14, 30, 0).getTime()
    },
    isMedia:false,
    isComputer:false,
    isSound:false,
    present: ["李四", "王五"],
    state: 2,
    event: "开趴",
    aim:"开趴"
  },{
    id: 2,
    applicant: "陈思凡",
    classroom: "106",
    time: {
      date: new Date(2024, 7 - 1, 5, 0, 0, 0,).getTime(),
      startTime: new Date(2024, 7 - 1, 5, 14, 0, 0).getTime(),
      endTime: new Date(2024, 7 - 1, 5, 14, 30, 0).getTime()
    },
    isMedia:false,
    isComputer:false,
    isSound:false,
    present: ["李四", "王五"],
    state: 2,
    event: "开趴",
    aim:"开趴"
  }
]


let currentData = mode.value==="officeHour"?"officeHour":"classroom"
function getNewData(){
  if(currentData === "officeHour") {
    data.value = virtualDataClassroom;
    currentData = "classroom"
  }else{
    data.value = virtualDataOfficeHour
    currentData = "officeHour"
  }
}

/*
这一块都是模拟数据
 */


/*
事件处理函数
 */
// todo 处理操作筛选
/**
 * 处理筛选日期的变化
 * todo 修改筛选日期
 */
const handleDateChange = () => {

}

/**
 * 处理模式的变化
 * todo 修改模式
 */
const handleModeChange = (newMode) => {
  mode.value = newMode
  localStorage.setItem("mode", mode.value)
  // 这里有获取新数据的逻辑 todo 记得修改
  getNewData()
}

/**
 * 处理详细信息的展示
 */
const handleRowClick = (row,colum) => {
  if(colum.property === "operation")return

  detailMessage.data = data.value[row.originIndex] // todo 记得改变量
  dialogTableVisible.value = true
}

const handleDataOperation = (eventId,operate) => {
  if(operate === 1){
    // 撤回预约的情况
    ElMessageBox.confirm("确定要撤回该预约吗","提示",{
      confirmButtonText:"确定",
      cancelButtonText:"取消"
    })
        .then(res=>{

        })
  }
}

// 初始化
if(!localStorage.getItem("mode")){
  localStorage.setItem("mode",mode.value)
}
if(mode.value === "officeHour")
  data.value = virtualDataOfficeHour
else
  data.value = virtualDataClassroom

</script>

<template>
  <div class="main-container">
    <div class="main-title">
      <h1>我的预约</h1>
      <h1>My Appointment</h1>
    </div>
    <appointment-table
        :mode="mode"
        operation-mode="approve"
        :data="formatData"
        @date-change="handleDateChange"
        @mode-change="handleModeChange"
        @row-click="handleRowClick"
        @add-event-clicked=""
        @edit-event-clicked="handleDataOperation"
    />
<!--    详细信息展示-->
    <el-dialog
        v-model="dialogTableVisible"
        title="详细信息"
    >
      <appointment-detail
          :data="detailMessage.data"
      />
    </el-dialog>
  </div>
</template>

<style scoped>

.main-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-title {
  display: grid;
  grid-template-columns: 0.6fr 1fr;

  height: 78px;
  font-size: 24px;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>