<script setup>
import { ElButton } from 'element-plus';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import router from '@/router';
import PickerOfficeHour from "@/components/index/PickerOfficeHour.vue";
import TableComponent from "@/components/index/TableComponent.vue";
import DisableTimeSlot from "@/components/index/DisableTimeSlot.vue";
import { UserInfoFormat, PickerFormat } from "@/utils/index/format.js";

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// 全局基本变量
let isDialogVisible = ref(false); // 禁用时段弹框是否可见

// OfficeHour的基本变量 - Picker Layer
let teacherList = ref([]) // 后端返回的教师列表
let pickerTeacherListFormat = ref([]) // 格式化后的教师选择器列表
let allTeacherInfo = ref(null) // 所有有OfficeHour活动的教师的id - name映射信息表
let getOfficeHourSelection = ref(null) // 被用户选中的教师 或 教师账号本人
let getOfficeHourSelectionId = ref(null) // 被用户选中的教师 或 教师账号本人 对应的id，用于向动态路由请求时间表数据

// OfficeHour的基本变量 - Table Layer
let officeHourTimeTableOrigin = ref(null) // 后端返回的教师时间表数据直接存储于此变量
officeHourTimeTableOrigin.value = null // 数据项初始化为null，供子组件判定时间表是否为空来条件渲染

function getTeacherTableInfoWithNoSelector(){
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
        getTeacherTableInfoWithNoSelector();
      }
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
    console.log(res)
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

onMounted( function(){
  /**
   * HomeViewOfficeHour组件挂载时执行
   * 向后端请求数据，获取用户信息、权限信息、选择器内信息
   */
  console.log("HomeViewOfficeHour组件开始挂载")
  // 从后端获取用户信息和权限信息
  getUserInfo()
  // 从后端获取OfficeHour选择器内信息
  getOfficeHourPickerInfo()
})

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

const banTimeShow = () => {
  /**
   * 当用户点击禁用时段按钮时触发
   * 弹出禁用时段弹框表单
   */
  isDialogVisible.value = true
};

const handleDisableTimeSlotSubmit = (form) => {
  /**
   * 当用户点击禁用时段弹框表单的提交按钮时触发
   * 向后端发送禁用时段的请求
   */
  isDialogVisible.value = false
};

const handleDisableTimeSlotClose = () => {
  /**
   * 当用户点击禁用时段弹框表单的关闭按钮时触发
   * 关闭窗口
   */
  isDialogVisible.value = false
};

</script >

<template>
  <div class="app-container">
    <div class="picker-layer">
      <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker-tutor-stu">
        <PickerOfficeHour :selectors="pickerTeacherListFormat" @update:selectedTeacher="handleSelectedTeacher" />
      </div>
    </div>
    <div class="table-layer">
      <div class="table-component">
        <TableComponent :backend-data="officeHourTimeTableOrigin" is-room="false"/>
      </div>
    </div>
    <div class="button-layer">
      <div v-if="authorityTable['OfficeHour:appointment']" class="appointment-button">
        <ElButton type="primary" round @click="navigateToAppointment">发起预约 Appointment</ElButton>
      </div>
      <div v-if="authorityTable['OfficeHour:approve']" class="ban-button">
        <ElButton type="danger" round @click="banTimeShow">禁用时段 Disable Time Slot</ElButton>
        <ElButton type="primary" round @click="navigateToAppointment">查看我的预约 Appointment</ElButton>
      </div>
    </div>
    <div class="ban-layer">
      <DisableTimeSlot
          :isDialogVisible="isDialogVisible"
          :backend-data="officeHourTimeTableOrigin"
          @submit="handleDisableTimeSlotSubmit"
          @close="handleDisableTimeSlotClose">
      </DisableTimeSlot>
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
  background-color: #F7FAFF;
}
.table-layer{
  height: 60vh;
}
</style>
