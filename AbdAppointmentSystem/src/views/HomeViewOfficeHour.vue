<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import PickerOfficeHour from "@/components/index/PickerOfficeHour.vue";
import TableComponent from "@/components/index/TableComponent.vue";
import FunctionalOfficeHour from "@/components/index/FunctionalOfficeHour.vue";

import { UserInfoFormat, PickerFormat } from "@/utils/index/format.js";

// HomeViewOfficeHour组件全局变量定义

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// OfficeHour的基本变量 - Picker Layer
let teacherList = ref([]) // 后端返回的教师列表
let pickerTeacherListFormat = ref([]) // 格式化后的教师选择器列表
let allTeacherInfo = ref(null) // 所有有OfficeHour活动的教师的id - name映射信息表
let getOfficeHourSelection = ref(null) // 被用户选中的教师 或 教师账号本人
let getOfficeHourSelectionId = ref(null) // 被用户选中的教师 或 教师账号本人 对应的id，用于向动态路由请求时间表数据

// OfficeHour的基本变量 - Table Layer
let officeHourTimeTableOrigin = ref(null) // 后端返回的教师时间表数据直接存储于此变量
officeHourTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空来条件渲染

/**
 * 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
 */
function getTeacherTableInfoWithNoSelector(){
  axios({
    method:"get",
    url:`/TableInfo/officehour/${userID.value}`
  }).then(res =>{
    if (res.data.code === 0){
      officeHourTimeTableOrigin.value = res.data.data
    }
    else {
      console.warn("请求失败，获取 教师 时间表内信息失败")
      console.log(res.data.message)
    }
  })
}

/**
 * 从后端获取用户信息和权限信息
 */
function getUserInfo() {
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
      if (authorityTable.value['OfficeHour:timeTable:all'] === false){
        // 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
        getTeacherTableInfoWithNoSelector();
      }
    }
    else{
      console.warn("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })
}

/**
 * 从后端获取OfficeHour选择器内信息
 */
function getOfficeHourPickerInfo() {
  axios({
    method:'get',
    url:'/TableInfo/picker/officehour',
  }).then(res =>{
    if(res.data.code === 0){
      teacherList.value = res.data.data.pickerList // 后端返回的教师列表信息
      pickerTeacherListFormat.value = PickerFormat.teacher_list_format(teacherList.value) // 格式化教师列表信息，用于选择器
      allTeacherInfo.value = PickerFormat.all_teacher_info(teacherList.value) // 格式化教师列表信息，用于id - name映射表
    }
    else{
      console.warn("请求失败，获取教室选择器内选项信息失败")
      console.log(res.data.message)
    }
  })
}

/**
 * 通过选中的教师的ID向后端动态路由请求数据
 */
function getOfficeHourTableInfo() {
  axios({
    method:"get",
    url:`/TableInfo/officehour/${getOfficeHourSelectionId.value}`
  }).then(res =>{
    if (res.data.code === 0){
      officeHourTimeTableOrigin.value = res.data.data
    }
    else {
      console.warn("请求失败，获取 教师 时间表内信息失败")
      console.log(res.data.message)
    }
  })
}

/**
 * HomeViewOfficeHour组件初始化
 * 向后端请求数据，获取用户信息、权限信息、选择器内信息
 */
onMounted( function(){
  console.log("HomeViewOfficeHour组件开始挂载")
  // 从后端获取用户信息和权限信息
  getUserInfo()
  // 从后端获取OfficeHour选择器内信息
  getOfficeHourPickerInfo()
})

/**
 * 当接收到来自PickerOfficeHour组件传递的选中教师发生变更时触发
 * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
 */
const handleSelectedTeacher = (teacher) => {
  if (teacher === "no teachers available") {
    // 若选中no teachers available，getOfficeHourSelection置为空
    // 没有向后端请求新数据，故置为空。子组件识别到后展示无时间表时的界面
    getOfficeHourSelection.value = null
    getOfficeHourSelectionId.value = null
    officeHourTimeTableOrigin.value = null
  }
  else {
    // 暂存子组件传来的选择
    getOfficeHourSelection.value = teacher
    getOfficeHourSelectionId.value = PickerFormat.get_id_by_teacher_name(teacher, allTeacherInfo.value)

    // 通过选中的教师的ID向后端动态路由请求数据
    getOfficeHourTableInfo()
  }
};
</script >

<template>
  <div class="app-container">
    <div class="functional-layer">
      <FunctionalOfficeHour :authority-table="authorityTable" :backend-data="officeHourTimeTableOrigin" :user-id="userID"/>
    </div>
    <div class="picker-layer">
      <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker-tutor-stu">
        <PickerOfficeHour :selectors="pickerTeacherListFormat" @update:selectedTeacher="handleSelectedTeacher" />
      </div>
    </div>
    <div class="table-layer">
      <div class="table-component">
        <TableComponent
            :backend-data="officeHourTimeTableOrigin"
            :authority-table="authorityTable"
            :is-office-hour="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-component {
  display: flex;
  height: 100%;
  width: 100%;
}

.app-container {
  height: 100vh; /* Use full viewport height */
  background-color: #F7FAFF;
  display: flex;
  flex-direction: column;
}

.table-layer {
  flex-grow: 1; /* Allow the table layer to expand */
  display: flex;
  flex-direction: column;
}

.functional-layer {
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
}

.picker-layer {
  margin-left: 10px;
  margin-right: 10px;
}
</style>
