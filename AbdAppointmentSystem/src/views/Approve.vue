<script setup>
import {reactive, ref, computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/MyAppointment/eventUtil.js'

const dialogTableVisible = ref(false)
const workSummaryVisible = ref(false)
const refuseReasonVisible = ref(false)
const data = ref([])
const mode = ref(localStorage.getItem("mode")?localStorage.getItem("mode"):"officeHour")
const formatData = computed(() => {
  if(mode.value === "officeHour")
    return EventUtil.getOfficeHourFormatData(data.value)
  else
    return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = ref({})

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
const handleRowClick = (row,colum,event) => {
  if(colum.property === "operation")return

  detailMessage.value = data.value[row.originIndex] // todo 记得改变量
  dialogTableVisible.value = true
}


let currentEventId = null;
/**
 * 处理填写工作总结
 */
const handleWorkSummary = () => {
  if(!eventId)return
}

/**
 * 处理填写拒绝原因
 */
const handleRefuse = () => {
  if(!eventId)return
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
  }else if(operate === 2){
    // 同意预约的情况
    ElMessageBox.confirm("确定要同意该预约吗","提示",{
      confirmButtonText:"确定",
      cancelButtonText:"取消"
    })
        .then(res=>{

        })
  }else if(operate === 3){
    // 拒绝预约的情况
    currentEventId = eventId
    refuseReasonVisible.value = true
  }else if(operate === 4){
    // 完成预约的情况
    currentEventId = eventId
    workSummaryVisible.value = true
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
      <h1>My Appointment / Schedule</h1>
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
          :data="detailMessage"
      />
    </el-dialog>
    <!--    工作总结-->
    <el-dialog
      v-model="workSummaryVisible"
      title="工作总结"
    >
      <label>请输入你的工作总结</label>
      <el-input
          type="textarea"
      />
      <template #footer>
        <el-button type="primary" @click="handleWorkSummary">确认</el-button>
        <el-button @click="workSummaryVisible = false">取消</el-button>
      </template>
    </el-dialog>
    <!--    拒绝原因-->
    <el-dialog
      v-model="refuseReasonVisible"
      title="拒绝原因"
    >
      <label>请输入你的拒绝原因</label>
      <el-input
        type="textarea"
      />
      <template #footer>
          <el-button type="primary" @click="handleRefuse">确认</el-button>
          <el-button @click="refuseReasonVisible = false">取消</el-button>
      </template>
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
  grid-template-columns: 0.4fr 1fr;

  height: 78px;
  font-size: 24px;
  margin-top: 20px;
  margin-bottom: 20px;
}

</style>