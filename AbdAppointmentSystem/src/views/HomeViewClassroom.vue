<script setup>
import { ElButton } from 'element-plus';  // 引入Element-Plus按钮组件
import { ref, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';
import PickerClassroom from "@/components/index/PickerClassroom.vue";
import TableComponent from "@/components/index/TableComponent.vue";
import { UserInfoFormat, PickerFormat } from "@/utils/index/format.js";


// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// 全局基本变量
let selectedTab = ref('room'); // 当前被选中的平台

// Classroom的基本变量 - Picker Layer
let classroomList = ref([]) // 后端返回的教室列表
let allClassroomInfo = ref(null) // 所有教室的id - name映射信息表
let getClassroomSelection = ref(null) // 被用户选中的教室
let getClassroomSelectionId = ref(null) // 被用户选中的教室
let allowClassroomInfo = ref(null) // 用户权限允许的教室的id - name映射信息表

// Classroom的基本变量 - Table Layer
let classroomTimeTableOrigin = ref(null) // 后端返回的教室时间表数据直接存储于此变量
classroomTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空

function getUserInfo() {
  /**
   * 从后端获取用户信息和权限信息
   */
  axios({
    method: 'get',
    url: '/User/info',
  }).then(res => {
    if(res.data.code === 0){
      role.value = res.data.data.userAuthority.role // 用户角色
      credits.value = res.data.data.userAuthority.credit // 用户权限
      authorityTable.value = UserInfoFormat.credit_format(credits.value) // 格式化权限信息
      username.value = res.data.data.username // 用户姓名
      userID.value = res.data.data.userID // 用户学号/工号
      email.value = res.data.data.email // 用户邮箱
    }
    else{
      console.warn("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })
}

function getClassroomPickerInfo(){
  /**
   * 从后端获取Classroom选择器信息
   */
  axios({
    method:'get',
    url:'/User/picker/classroom',
  }).then(res => {
    if(res.data.code === 0){
      classroomList.value = res.data.data.pickerList // 后端返回的教室列表信息
      allClassroomInfo.value = PickerFormat.all_classroom_info(classroomList.value) // 格式化教师列表信息，用于id - name映射表
      allowClassroomInfo.value = PickerFormat.allow_classroom_info(authorityTable.value, allClassroomInfo.value)
    }
    else {
      console.warn("请求失败，获取教师选择器内选项信息失败")
      console.log(res.data.message)
    }
  })
}

function getClassroomTableInfo(){
  /**
   * 通过选中的教室的ID向后端动态路由请求数据
   */
  axios({
    method:"get",
    url:`/User/TableInfo/classroom/${getClassroomSelectionId.value}`
  }).then(res =>{
    if (res.data.code === 0){
      console.log(res)
      classroomTimeTableOrigin.value = res.data.data
    }
    else {
      console.warn("请求失败，获取 教室 时间表内信息失败")
      console.log(res.data.message)
    }
  })
}

onMounted( function(){
  /**
   * HomeViewClassroom组件挂载时执行
   * 向后端请求数据，获取用户信息、权限信息、选择器内信息
   */
  console.log("HomeViewClassroom组件开始挂载")
  // 从后端获取用户信息和权限信息
  getUserInfo()
  // 从后端获取Classroom选择器信息
  getClassroomPickerInfo()
})

const handleSelectedClassroom = (classroom) => {
  /**
   * 当接收到来自PickerClassroom组件传递的选中教师发生变更时触发
   * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
   */
  // 暂存子组件传来的选择
  getClassroomSelectionId.value = classroom.classroomId
  getClassroomSelection.value = classroom.classroom

  // 通过选中的教室的ID向后端动态路由请求数据
  getClassroomTableInfo()
};

const navigateToAppointment = () => {
  /**
   * 当用户点击预约按钮时触发
   * 根据用户当前所在平台和选择的教师/教室跳转至对应的预约页面
   */
  router.push({
    name: 'Appointment', // 跳转至预约列表页面
    query: {
      if_appointment: true
    }
  })
};
</script >

<template>
  <div class="app-container">
    <div class="picker-layer">
      <PickerClassroom :selectors="allowClassroomInfo" @update:selectedClassroom="handleSelectedClassroom"/>
    </div>
    <div class="table-layer">
      <div class="table-component">
        <TableComponent :backend-data="classroomTimeTableOrigin" :is-room="true"/>
      </div>
    </div>
    <div class="button-layer">
      <ElButton type="primary" round @click="navigateToAppointment">发起预约 Appointment</ElButton>
    </div>
  </div>
</template>

<style scoped>
.button-layer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.table-component{
  display: flex;
  height: 100%;
  margin-top: 20px;
}
.app-container{
  height: 100vh;
}
.table-layer{
  height: 60vh;
}
</style>
