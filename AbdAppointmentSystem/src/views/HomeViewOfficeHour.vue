<script setup>
  import Introduction from "@/components/index/Introduction.vue";
  import Picker from "@/components/index/Picker.vue";
  import TimeTable from "@/components/index/OfficeHourTimeTable.vue";
  import BanSelector from "@/components/index/BanSelector.vue";
  import {UserInfoFormat, OfficeHourTableFormat} from "@/utils/index/format.js";
  import {onMounted, ref} from "vue";
  import axios from "axios";
  import router from "@/router/index.js";

  let username = ref(null) // 用户名
  let userID = ref(null) // 用户ID
  let email = ref(null) // 用户邮箱
  let role = ref([]) // 用户权限角色
  let credits = ref([]) // 用户权限
  let officeHourTime = ref([]) // OfficeHour的时间信息
  let timeTable = ref([]) // 时间表信息
  let teacherList = ref([]) // 具有OfficeHour活动的教师列表
  let authorityTable = ref({}) // 权限表
  let getSelection = ref(null) // 被用户选中的教师 或 教师账号本人
  let banTime = ref(false) // 是否渲染禁用时间表单

  onMounted(function () {
    // 生命周期函数——组件开始挂载时调用
    console.log("HomeViewOfficeHour开始挂载")

    // 从后端获取用户信息和权限信息
    console.log("获取用户信息和权限信息")
    axios({
      method: 'get',
      url: '/User/info',
    }).then(res => {
      console.log(res)
      if(res.data.code === 0){
        console.log("获取用户信息和权限信息成功")
        role.value = res.data.data.userAuthority.role
        credits.value = res.data.data.userAuthority.credit
        authorityTable.value = UserInfoFormat.credit_format(credits.value) // 格式化权限信息
        console.log("权限表提取成功")
        username.value = res.data.data.username
        userID.value = res.data.data.userID
        email.value = res.data.data.email
        // 若为审批者，则默认选中自己，因为只能查看自己的时间表
        if (authorityTable.value['OfficeHour:approve']) {
          getSelection = username.value
        }
      }
      else{
        console.log("请求失败，获取用户信息和权限信息失败")
        console.log(res.data.message)
      }
    })

    // 从后端获取时间表信息
    console.log("获取OfficeHour时间表信息")
    axios({
      method: 'get',
      url: '/TableInfo/officehour',
    }).then(res => {
      console.log(res)
      if(res.data.code === 0){
        console.log("获取OfficeHour时间表信息成功")
        officeHourTime.value = res.data.data.officeHourTime
        teacherList.value = OfficeHourTableFormat.teacher_list_format(officeHourTime.value) // 格式化教师列表信息
        console.log("教师列表信息提取成功")
        timeTable.value = res.data.data.timeTable
        console.log("时间表信息提取成功")
      }
      else{
        console.log("请求失败，获取OfficeHour时间表信息失败")
        console.log(res.data.message)
      }
    })
  })

  function pickerChange(selection){
    console.log("HomeViewOfficeHour组件接收到Picker组件传递的选中的教师信息：", selection)
    // 接收到Picker子组件传递的选中的教师信息
    getSelection.value = selection
  }

  function navigateToAppointment(){
    console.log('准备跳转到预约页面');
    router.push({
      name: 'Appointment',
    })
  }

  function banOnOff(){
    console.log('展开/关闭禁用时间段表单');
    banTime.value = !banTime.value
  }

  function banOff(){
    console.log('收起禁用时间段表单');
    banTime.value = false
  }

</script>

<template>
  <div class="page-container">
    <div class="introduction">
      <Introduction></Introduction>
    </div>
    <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker">
      <Picker :PickerList="teacherList"
              @picker-change="pickerChange">
      </Picker>
    </div>
    <div class="table">
      <div v-if="authorityTable['OfficeHour:appointment']">
        <TimeTable :time-slots="timeTable"
                   :get-selection="getSelection"
                   :is-navigate=true>
        </TimeTable>
      </div>
      <div v-if="authorityTable['OfficeHour:approve']">
        <TimeTable :time-slots="timeTable"
                   :get-selection="getSelection"
                   :is-navigate=false>
        </TimeTable>
      </div>
    </div>
    <div v-if="authorityTable['OfficeHour:appointment']" class="goAppointment">
      <el-button type="primary"
                 @click="navigateToAppointment">
        {{ $t("index.go_appointment")}}
      </el-button>
    </div>
    <div v-if="authorityTable['OfficeHour:approve']" class="banButton">
      <el-button type="primary"
                 @click="banOnOff">
        {{ $t("index.ban_time_button")}}
      </el-button>
    </div>
    <div v-if="banTime" class="banTable">
      <BanSelector @ban-time-cancel="banOff"
                   :time-table="timeTable"
                   :get-selection="getSelection">
      </BanSelector>
    </div>
  </div>
</template>

<style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .introduction, .picker, .table, .goAppointment, .banButton, .banTable{
    flex-grow: 1;
    margin-top: 20px;
  }
</style>
