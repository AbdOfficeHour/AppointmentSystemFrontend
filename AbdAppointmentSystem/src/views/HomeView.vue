<script setup>
import TabSelector from "@/components/index/TabSelector.vue";
import PickerOfficeHour from "@/components/index/PickerOfficeHour.vue";
import {UserInfoFormat, PickerFormat} from "@/utils/index/format.js";
import {onMounted, ref} from "vue";
import axios from "axios";
import router from "@/router/index.js";

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// 全局基本变量
let isTabRoom = ref('room'); // 用户在tab内选择的平台，教师预约或教室预约

// OfficeHour的基本变量
let teacherList = ref([]) // 后端返回的教师列表
let pickerTeacherListFormat = ref([]) // 格式化后的教师选择器列表
let allTeacherInfo = ref(null) // 所有有OfficeHour活动的教师的id - name映射信息表
let getOfficeHourSelection = ref(null) // 被用户选中的教师 或 教师账号本人
let isBanTimeShow = ref(false) // 是否渲染禁用时间表单

onMounted(function () {
  /**
   * HomeView组件挂载时执行
   * 向后端请求数据，获取用户信息、权限信息、选择器内信息
   */

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
      role.value = res.data.data.userAuthority.role // 用户角色
      credits.value = res.data.data.userAuthority.credit // 用户权限
      console.log("提取用户权限表")
      authorityTable.value = UserInfoFormat.credit_format(credits.value) // 格式化权限信息
      console.log("用户权限表提取成功")
      username.value = res.data.data.username // 用户姓名
      userID.value = res.data.data.userID // 用户学号/工号
      email.value = res.data.data.email // 用户邮箱
    }
    else{
      console.warn("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })

  // 从后端获取选择器内信息
  console.log("获取选择器内选项信息")
  axios({
    method:'get',
    url:'/User/picker/officehour',
  }).then(res =>{
    console.log(res)
    if(res.data.code === 0){
      console.log("获取选择器内选项信息成功")
      teacherList.value = res.data.data.pickerList // 后端返回的教师列表信息
      console.log("教师列表信息提取成功")
      pickerTeacherListFormat.value = PickerFormat.teacher_list_format(teacherList.value) // 格式化教师列表信息，用于选择器
      allTeacherInfo.value = PickerFormat.all_teacher_info(teacherList.value) // 格式化教师列表信息，用于id - name映射表
      console.log("教师列表信息格式化成功")
    }
    else{
      console.warn("请求失败，获取选择器内选项信息失败")
      console.log(res.data.message)
    }
  })
})

const handleTabChange = (tab) => {
  /**
   * 当接收到来自TabSelector组件传递的用户选择的平台变更时触发
   * 保存用户的变更并保存至isTabRoom变量，用于条件渲染
   */
  console.log("父组件收到平台选择变更，并保存变更")
  isTabRoom.value = (tab === "room")
  console.log("当前为", tab, "预约平台")
};

const handleSelectedTeacher = (teacher) => {
  /**
   * 当接收到来自PickerOfficeHour组件传递的选中教师发生变更时触发
   * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
   */
  console.log("父组件收到选中教师变更，并保存变更")
  if (teacher === "no teachers available") {
    getOfficeHourSelection.value = null  // 若选中no teachers available，getOfficeHourSelection置为空
  }
  else {
    getOfficeHourSelection.value = teacher
  }
};
</script>

<template>
  <!-- HomeView组件，负责首页的渲染 -->
  <div class="app-container">
    <div class="tab-selector">
      <TabSelector @update:selectedTab="handleTabChange"></TabSelector>
    </div>
    <div class="picker-layer">
      <div v-if="isTabRoom" class="picker-room">

      </div>
      <div v-else-if="!isTabRoom" class="picker-tutor-container">
        <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker-tutor">
          <PickerOfficeHour :selectors="pickerTeacherListFormat" @update:selectedTeacher="handleSelectedTeacher" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
