<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import PickerClassroom from "@/components/index/PickerClassroom.vue";
import TableComponent from "@/components/index/TableComponent.vue";
import FunctionalClassroom from "@/components/index/FunctionalClassroom.vue";

import { UserInfoFormat, PickerFormat } from "@/utils/index/format.js";

// HomeViewClassroom组件全局变量定义

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// Classroom的基本变量 - Picker Layer
let classroomList = ref([]) // 后端返回的教室列表
let allClassroomInfo = ref(null) // 所有教室的id - name映射信息表
let getClassroomSelection = ref(null) // 被用户选中的教室
let getClassroomSelectionId = ref(null) // 被用户选中的教室
let allowClassroomInfo = ref(null) // 用户权限允许的教室的id - name映射信息表

// Classroom的基本变量 - Table Layer
let classroomTimeTableOrigin = ref(null) // 后端返回的教室时间表数据直接存储于此变量
classroomTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空

let componentKey = ref(0) // 用于强制刷新子组件

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
    url:'/TableInfo/picker/classroom',
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
    url:`/TableInfo/classroom/${getClassroomSelectionId.value}`
  }).then(res =>{
    if (res.data.code === 0){
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
  componentKey.value += 1
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
</script >

<template>
  <div class="app-container">
    <div class="functional-layer">
      <FunctionalClassroom
          :authority-table="authorityTable"
          :backend-data="classroomTimeTableOrigin"
          :classroom-id="getClassroomSelectionId"
      />
    </div>
    <div class="picker-layer">
      <PickerClassroom
          :selectors="allowClassroomInfo"
          :key="componentKey"
          @update:selectedClassroom="handleSelectedClassroom"/>
    </div>
    <div class="table-layer">
      <div class="table-component">
        <TableComponent
            :backend-data="classroomTimeTableOrigin"
            :authority-table="authorityTable"
            :is-office-hour="false"/>
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
  height: 1200px;
  background-color: #F7FAFF;
  display: flex;
  flex-direction: column;
}

.table-layer {
  flex-grow: 1; /* Allow the table layer to expand */
  display: flex;
  flex-direction: column;
}

.picker-layer {
  margin-left: 10px;
  margin-right: 10px;
}

.functional-layer {
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
</style>
