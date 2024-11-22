<script setup>
import {ref, computed, onMounted, reactive} from 'vue'
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/MyAppointment/eventUtil.js'
import axios from "axios";

const router = useRouter()

const loading = ref(false)
const dialogTableVisible = ref(false)
const workSummaryVisible = ref(false)
const refuseReasonVisible = ref(false)
const data = ref([])
const mode = ref("officeHour")
const month = ref(0)
const formatData = computed(() => {
  if(mode.value === "officeHour")
    return EventUtil.getOfficeHourFormatData(data.value)
  else
    return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = ref({})
const userInfo = reactive({
  "phone":"",
  "userAuthority":{},
  "email":"",
  "username":""
})
const refuseResult = ref("")
const workSummary = ref("")


/**
 * 用于获取默认的模式
 * 只有在完成用户信息的获取时才会被调用
 */
const getDefaultMode = ()=>{
  const creditList = userInfo.userAuthority.credit
  if(creditList.includes("OfficeHour:approve")&&creditList.includes("classroom:approve")){

    if(!localStorage.getItem("mode")){
      mode.value = "officeHour"
      localStorage.setItem("mode",mode.value)
    }else{
      mode.value = localStorage.getItem("mode")
    }
  }
  else if(creditList.includes("classroom:approve")) {
    mode.value = "教室预约"
  }
  else if(creditList.includes("OfficeHour:approve")){
    mode.value = "officeHour"
  }else{
    //无权限的情况
    ElMessageBox.confirm("您没有审批权限","提示",{
      confirmButtonText:"确定",
      showCancelButton:false,
      callback:()=>{
        router.push("/index/classroom")
      }
    })
  }
}

const fetchListData = ()=>{
  const selectMode = mode.value === 'officeHour'?"officehour":"classroom"
  let listUrl = `/Appointment/approve/${selectMode}`

  axios.get(listUrl,{
    params:{
      time:month.value
    }
  })
      .then(res=>{
        if(res.status === 200)
          data.value = res.data.data
        else
          ElMessage.error("获取数据失败")
      })

}

const fetchUserInfo = ()=>{
  loading.value = true
  axios.get("/User/info")
      .then(res=>{
        if(res.status === 200){
          userInfo.email = res.data.data.email
          userInfo.userAuthority = res.data.data.userAuthority
          userInfo.phone = res.data.data.phone
          userInfo.username = res.data.data.username
        }
        getDefaultMode()
        fetchListData()
        loading.value = false
      })
}

/*
事件处理函数
 */
/**
 * 处理筛选日期的变化
 */
const handleDateChange = (newVal) => {
  month.value = newVal
  fetchListData()
}


/**
 * 处理模式的变化
 */
const handleModeChange = (newMode) => {
  mode.value = newMode
  localStorage.setItem("mode", mode.value)
  fetchListData()
}

/**
 * 处理详细信息的展示
 */
const handleRowClick = (row,colum) => {
  if(colum.property === "operation")return

  detailMessage.value = data.value[row.originIndex] // todo 记得改变量
  dialogTableVisible.value = true
}


let currentEventId = null;
/**
 * 处理填写工作总结
 */
const handleWorkSummary = () => {
  if(!currentEventId)return
  let selectMode
  if(mode.value === "officeHour")
    selectMode = "officehour"
  else
    selectMode = "classroom"

  axios.put(`/Appointment/list/${selectMode}/${currentEventId}`,
      {
        state:5,
        work_summary:workSummary.value
      }
  )
      .then(res=>{

        if(res.status===200&&res.data.code===0){
          ElMessage.success("请求成功")
          window.location.reload()
        }else {

          ElMessage.error("请求失败")
        }
      })

}

/**
 * 处理填写拒绝原因
 */
const handleRefuse = () => {
  if(!currentEventId)return
  let selectMode
  if(mode.value === "officeHour")
    selectMode = "officehour"
  else
    selectMode = "classroom"


  axios.put(`/Appointment/list/${selectMode}/${currentEventId}`,
      {
        state:4,
        refuse_result:refuseResult.value
      }
  )
      .then(res=>{

        if(res.status===200&&res.data.code===0){
          ElMessage.success("请求成功")
          window.location.reload()
        }else {

          ElMessage.error("请求失败")
        }
      })
}

const handleDataOperation = (eventId,operate) => {
  let selectMode
  if(mode.value === "officeHour")
    selectMode = "officehour"
  else
    selectMode = "classroom"

  if(operate === 1){
    // 撤回预约的情况
    ElMessageBox.confirm("确定要撤回该预约吗","提示",{
      confirmButtonText:"确定",
      cancelButtonText:"取消"
    })
        .then(async ()=>axios.put(`/Appointment/list/${selectMode}/${eventId}`,{state:6}))
        .then(res=>{
          if(res.status===200&&res.data.code===0){
            ElMessage.success("取消成功")
            window.location.reload()
          }else{
            ElMessage.error("请求失败")
          }
        })
  }else if(operate === 2){
    // 同意预约的情况
    ElMessageBox.confirm("确定要同意该预约吗","提示",{
      confirmButtonText:"确定",
      cancelButtonText:"取消"
    })
        .then(async()=>axios.put(`/Appointment/list/${selectMode}/${eventId}`,{state:3}))
        .then(res=>{
          if(res.status===200&&res.data.code===0){
            ElMessage.success("请求成功")
            window.location.reload()
          }else{
            ElMessage.error("请求失败")
          }
        })
  }else if(operate === 3){
    // 拒绝预约的情况
    currentEventId = eventId
    if(mode.value === "officeHour")
      refuseReasonVisible.value = true
    else{
      ElMessageBox.confirm("确定要拒绝该预约吗","提示",{
        confirmButtonText:"确定",
        cancelButtonText:"取消"
      })
          .then(async()=>axios.put(`/Appointment/list/${selectMode}/${eventId}`,{state:4}))
          .then(res=>{
            if(res.status===200&&res.data.code===0){
              ElMessage.success("请求成功")
              window.location.reload()
            }else{
              ElMessage.error("请求失败")
            }
          })
    }
  }else if(operate === 4){
    // 完成预约的情况
    currentEventId = eventId
    if(mode.value === "officeHour")
      workSummaryVisible.value = true
  }
}

onMounted(()=>{
  fetchUserInfo()
})

</script>

<template>
  <div class="main-container" v-loading="loading">
    <div class="main-title">
      <h1>我的预约</h1>
      <h1>My Appointment / Schedule</h1>
    </div>
    <appointment-table
        :mode="mode"
        operation-mode="approve"
        :data="formatData"
        :user-info="userInfo"
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
          v-model="workSummary"
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
        v-model="refuseResult"
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

.main-title h1 {
  font-size: 40px;
  font-weight: 600;
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