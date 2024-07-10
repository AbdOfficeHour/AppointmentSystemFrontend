<script setup>
import {reactive, ref, computed, onMounted} from 'vue'
import {useRoute} from "vue-router";
import {ElMessage, ElMessageBox} from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/MyAppointment/eventUtil.js'
import Officehour from "@/components/officehour.vue";
import Classroom from "@/components/classroom.vue";
import axios from "axios";
import router from "@/router/index.js";

const route = useRoute()

const loading = ref(false)
const dialogTableVisible = ref(false)
const data = ref([])
const mode = ref("officeHour")
const month = ref(0)
const formatData = computed(() => {
  if(mode.value === "officeHour")
    return EventUtil.getOfficeHourFormatData(data.value)
  else
    return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = reactive({
  data: {}
})
const showOfficeHourAppoint = ref(false)
const showClassroomAppoint = ref(false)
const userInfo = reactive({
  "phone":"",
  "userAuthority":{},
  "email":"",
  "username":""
})

if(route.query.if_appointment === "true"){
  if(mode.value === 'officeHour')showOfficeHourAppoint.value = true
  else showClassroomAppoint.value = true
}

/*
请求部分
 */

/**
 * 获取列表数据
 */
const fetchListData = ()=>{
  const selectMode = mode.value === 'officeHour'?"officehour":"classroom"
  let listUrl = `/Appointment/list/${selectMode}`

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

/**
 * 用于获取默认的模式
 * 只有在完成用户信息的获取时才会被调用
 */
const getDefaultMode = ()=>{
  const creditList = userInfo.userAuthority.credit
  const classroomList = [
    "classroom:appointment:104",
    "classroom:appointment:106",
    "classroom:appointment:202B",
  ]
  if(creditList.includes("OfficeHour:appointment")&&classroomList.some(item=>classroomList.includes(item))){

    if(!localStorage.getItem("mode")){
      mode.value = "officeHour"
      localStorage.setItem("mode",mode.value)
    }else{
      mode.value = localStorage.getItem("mode")
    }
  }
  else if(classroomList.some(item=>classroomList.includes(item))) {
    mode.value = "教室预约"
  }
  else if(creditList.includes("OfficeHour:appointment")){
    mode.value = "officeHour"
  }else{
    //无权限的情况
    ElMessageBox.confirm("您没有预约权限","提示",{
      confirmButtonText:"确定",
      showCancelButton:false,
      callback:()=>{
        router.push("/index/classroom")
      }
    })
  }
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
 *
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

  detailMessage.data = data.value[row.originIndex] // todo 记得改变量
  dialogTableVisible.value = true
}

const handleDataOperation = (eventId,operate) => {
  let modeUrl
  if(mode.value === "officeHour")
    modeUrl = "officehour"
  else
    modeUrl = "classroom"

  if(operate === 1){
    // 撤回预约的情况
    ElMessageBox.confirm("确定要撤回该预约吗","提示",{
      confirmButtonText:"确定",
      cancelButtonText:"取消"
    })
        .then(async res=>{
          return axios.put(`/Appointment/list/${modeUrl}/${eventId}`,{
            state: 6
          })
        })
        .then(res=>{
          if(res.status === 200 && res.data.code === 0){
            ElMessage.success("撤回成功")
            window.location.reload()
          }else{
            ElMessage.error("撤回失败")
          }
        })
        .catch(res=>{
          ElMessage.error("请求失败")
        })
  }
}

/**
 * 处理发起预约的点击
 */
const handleAddButtonClick = ()=>{
  if(mode.value === "officeHour") {
    console.log("点击")
    showOfficeHourAppoint.value = true
  }
  else {
    console.log("点击")
    showClassroomAppoint.value = true
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
      <h1>My Appointment</h1>
    </div>
    <appointment-table
        :mode="mode"
        operation-mode="view"
        :data="formatData"
        :user-info="userInfo"
        @date-change="handleDateChange"
        @mode-change="handleModeChange"
        @row-click="handleRowClick"
        @add-event-clicked="handleAddButtonClick"
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
<!--    officeHour发起预约-->
    <officehour :if-visible="showOfficeHourAppoint" @close-dialog="showOfficeHourAppoint = false" :userInfo="userInfo"/>
<!--    classroom发起预约-->
    <classroom :if-visible="showClassroomAppoint" @close-dialog="showClassroomAppoint = false" :userInfo="userInfo"/>
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