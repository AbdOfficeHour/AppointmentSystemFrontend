<script setup>
import TabSelector from "@/components/index/TabSelector.vue";
import PickerOfficeHour from "@/components/index/PickerOfficeHour.vue";
import {UserInfoFormat, PickerFormat} from "@/utils/index/format.js";
import {onMounted, ref, nextTick} from "vue";
import axios from "axios";
import router from "@/router/index.js";
import PickerClassroom from "@/components/index/PickerClassroom.vue";
import TableComponent from "@/components/index/TableComponent.vue";

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// 全局基本变量
let isTabRoom = ref(false); // 用户在tab内选择的平台，教师预约或教室预约
let lastTab = ref('tutor') // 记录上一次tab选择器的状态，由于初始为tutor，故初始为tutor

// OfficeHour的基本变量 - Picker Layer
let teacherList = ref([]) // 后端返回的教师列表
let pickerTeacherListFormat = ref([]) // 格式化后的教师选择器列表
let allTeacherInfo = ref(null) // 所有有OfficeHour活动的教师的id - name映射信息表
let getOfficeHourSelection = ref(null) // 被用户选中的教师 或 教师账号本人
let getOfficeHourSelectionId = ref(null) // 被用户选中的教师 或 教师账号本人 对应的id，用于向动态路由请求时间表数据

// OfficeHour的基本变量 - Table Layer
let officeHourTimeTableOrigin = ref(null) // 后端返回的教师时间表数据直接存储于此变量
officeHourTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空来条件渲染

// Classroom的基本变量 - Picker Layer
let classroomList = ref([]) // 后端返回的教室列表
let allClassroomInfo = ref(null) // 所有教室的id - name映射信息表
let getClassroomSelection = ref(null) // 被用户选中的教室
let getClassroomSelectionId = ref(null) // 被用户选中的教室
let allowClassroomInfo = ref(null) // 用户权限允许的教室的id - name映射信息表

// Classroom的基本变量 - Table Layer
let classroomTimeTableOrigin = ref(null) // 后端返回的教室时间表数据直接存储于此变量
classroomTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空

function OfficeHourTeacherWithNoSelector(){
  /**
   * 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
   */
  axios({
    method:"get",
    url:`/User/TableInfo/officehour/${userID.value}`
  }).then(res =>{
    if (res.data.code === 0){
      console.log(res)
      officeHourTimeTableOrigin.value = res.data.data
    }
    else {
      console.warn("请求失败，获取 教师 时间表内信息失败")
      console.log(res.data.message)
    }
  })
}

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
      if (authorityTable.value['OfficeHour:timeTable:all'] === false){
        // 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
        OfficeHourTeacherWithNoSelector();
      }
      // 数据获取结束后执行操作，以确定DOM的更新完成
      nextTick(() => {
        handleTabChange('tutor') // 默认设置为tutor界面
      })
    }
    else{
      console.warn("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })
}

function getOfficeHourPickerInfo() {
  /**
   * 从后端获取OfficeHour选择器内信息
   */
  axios({
    method:'get',
    url:'/User/picker/officehour',
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

function getOfficeHourTableInfo() {
  /**
   * 通过选中的教师的ID向后端动态路由请求数据
   */
  axios({
    method:"get",
    url:`/User/TableInfo/officehour/${getOfficeHourSelectionId.value}`
  }).then(res =>{
    if (res.data.code === 0){
      console.log(res)
      officeHourTimeTableOrigin.value = res.data.data
    }
    else {
      console.warn("请求失败，获取 教师 时间表内信息失败")
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
   * HomeView组件挂载时执行
   * 向后端请求数据，获取用户信息、权限信息、选择器内信息
   */
  console.log("HomeView组件开始挂载")
  // 从后端获取用户信息和权限信息
  getUserInfo()
  // 从后端获取OfficeHour选择器内信息
  getOfficeHourPickerInfo()
  // 从后端获取Classroom选择器信息
  getClassroomPickerInfo()
})

const handleTabChange = (tab) => {
  /**
   * 当接收到来自TabSelector组件传递的用户选择的平台变更时触发
   * 保存用户的变更并保存至isTabRoom变量，用于条件渲染
   */
    if (lastTab.value !== tab){
      isTabRoom.value = (tab === 'room')
      lastTab.value = tab

      // 获取新的数据并更新表格内容
      if (isTabRoom.value){
        if (authorityTable.value['OfficeHour:timeTable:all']){
          getOfficeHourSelection.value = null
          getOfficeHourSelectionId.value = null
          console.log('change tutor to room')
        }
        else{
          OfficeHourTeacherWithNoSelector()
        }
      }
      else{
        getClassroomSelection.value = null
        getClassroomSelectionId.value = null
        console.log('change room to tutor')
      }
    }
};

const handleSelectedTeacher = (teacher) => {
  /**
   * 当接收到来自PickerOfficeHour组件传递的选中教师发生变更时触发
   * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
   */
  if (teacher === "no teachers available") {
    getOfficeHourSelection.value = null  // 若选中no teachers available，getOfficeHourSelection置为空
    getOfficeHourSelectionId.value = null
    officeHourTimeTableOrigin.value = null // 没有向后端请求新数据，故置为空。子组件识别到后展示无时间表时的界面
  }
  else {
    // 暂存子组件传来的选择
    getOfficeHourSelection.value = teacher
    getOfficeHourSelectionId.value = PickerFormat.get_id_by_teacher_name(teacher, allTeacherInfo.value)

    // 通过选中的教师的ID向后端动态路由请求数据
    getOfficeHourTableInfo()
  }
};

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
    <div class="tab-selector">
      <TabSelector @update:selectedTab="handleTabChange"></TabSelector>
    </div>
    <div class="picker-layer">
      <div v-if="isTabRoom" class="picker-room">
        <PickerClassroom :selectors="allowClassroomInfo" @update:selectedClassroom="handleSelectedClassroom"/>
      </div>
      <div v-else class="picker-tutor">
        <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker-tutor-stu">
          <PickerOfficeHour :selectors="pickerTeacherListFormat" @update:selectedTeacher="handleSelectedTeacher" />
        </div>
      </div>
    </div>
    <div class="table-layer">
      <div v-if="isTabRoom" class="table-component">
        <TableComponent :backend-data="classroomTimeTableOrigin" />
      </div>
      <div v-else class="table-component">
        <TableComponent :backend-data="officeHourTimeTableOrigin" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
