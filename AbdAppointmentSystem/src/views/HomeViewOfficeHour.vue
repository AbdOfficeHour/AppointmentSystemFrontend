<script setup>
  import Introduction from "@/components/index/Introduction.vue";
  import Picker from "@/components/index/Picker.vue";
  import TimeTable from "@/components/index/OfficeHourTimeTable.vue";
  import {UserInfoFormat, OfficeHourTableFormat} from "@/script/index/format.js";
  import {onMounted, reactive, ref} from "vue";
  import axios from "axios";

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

  onMounted(function () {
    // 生命周期函数——组件开始挂载时调用
    console.log("HomeView OfficeHour开始挂载")
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

        if (authorityTable.value['OfficeHour:approve']) {
          getSelection = username.value
        }

      }else{
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
      }else{
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
</script>

<template>
  <div class="page-container">
    <div class="introduction">
      <Introduction></Introduction>
    </div>
    <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker">
      <Picker :PickerList="teacherList" @picker-change="pickerChange"></Picker>
    </div>
    <div class="table">
      <TimeTable :time-slots="timeTable" :get-selection="getSelection"></TimeTable>
    </div>
  </div>
</template>

<style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .introduction, .picker, .table {
    flex-grow: 1;
    margin-top: 20px;
  }
</style>
