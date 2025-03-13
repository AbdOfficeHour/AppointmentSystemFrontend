<script setup>
import { ref, onMounted, onUpdated } from 'vue';
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import { UserInfoFormat, PickerFormat } from "@/utils/dataFormat.js";
import { useI18n } from "vue-i18n";
import PickerClassroom from "@/components/index/pickerClassroom.vue";
import FunctionalClassroom from "@/components/index/functionalClassroom.vue";
import TimeTableBarClassroom from "@/components/index/timeTableBarClassroom.vue";
import { ElMessage } from "element-plus";

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表

// Classroom的基本变量 - Picker Layer
let classroomList = ref([]) // 后端返回的教室列表
let allClassroomInfo = ref(null) // 所有教室的id - name映射信息表
let getClassroomSelection = ref(null) // 被用户选中的教室
let getClassroomSelectionId = ref(null) // 被用户选中的教室
let allowClassroomInfo = ref([]) // 用户权限允许的教室的id - name映射信息表

// Classroom的基本变量 - Table Layer
let classroomTimeTableOrigin = ref(null) // 后端返回的教室时间表数据直接存储于此变量

// 渲染逻辑相关基本变量
let pickerComponentKey = 0 // 用于强制刷新子组件
let tableComponentKey = 0 // 用于强制刷新子组件
let userInfoLoading = ref(true) // 用户信息加载状态
let pickerLoading = ref(true) // 选择器加载状态
let tableChangeLoading = ref(false) // 时间表加载状态
let { t } = useI18n() // 国际化翻译函数
let hasChosenClassroomFlag = ref(false) // 是否已经选择了教室

/**
 * @description 获取用户信息和权限信息
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
      getClassroomPickerInfo() // 从后端获取Classroom选择器信息
    }
    else{
      console.error("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })
}

/**
 * @description 获取教室选择器内选项信息
 */
function getClassroomPickerInfo(){
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
      console.error("请求失败，获取教师选择器内选项信息失败")
      console.log(res.data.message)
    }
    pickerComponentKey += 1
  })
}

/**
 * @description 依据选中的教室，获取教室时间表内信息
 */
function getClassroomTableInfo(){
  axios({
    method:"get",
    url:`/TableInfo/classroom/${getClassroomSelectionId.value}`
  }).then(res =>{
    if (res.data.code === 0){
      classroomTimeTableOrigin.value = res.data.data
    }
    else {
      console.error("请求失败，获取 教室 时间表内信息失败")
      console.log(res.data.message)
      tableChangeLoading.value = false
      ElMessage.error(t("index.fail_to_load_table_info"))
    }
  })
  tableComponentKey += 1
}

/**
 * @description 当接收到来自PickerClassroom组件传递的选中教师发生变更时触发
 * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
 * @param classroom - 选中的教室信息
 */
const handleSelectedClassroom = (classroom) => {
  // 暂存子组件传来的选择
  getClassroomSelectionId.value = classroom.classroomId
  getClassroomSelection.value = classroom.classroom
  hasChosenClassroomFlag.value = true

  // 通过选中的教室的ID向后端动态路由请求数据
  tableChangeLoading.value = true
  console.log(tableChangeLoading.value)
  getClassroomTableInfo()
};

/**
 * @description 时间表加载完成
 */
const tableLoadingDone = () => {
  tableChangeLoading.value = false
}

/**
 * @description 选择器加载完成
 */
const pickerLoadingDone = () => {
  pickerLoading.value = false
}

// Mounted生命周期钩子，用于初始化页面，获取用户信息和权限信息
onMounted( function(){
  userInfoLoading.value = true
  pickerLoading.value = true
  tableChangeLoading.value = false

  hasChosenClassroomFlag.value = false
  // 从后端获取用户信息和权限信息
  getUserInfo()
})

onUpdated(() => {
  hasChosenClassroomFlag.value = false
})
</script>

<template>
  <div class="app-container">
    <div class="functional-layer">
      <FunctionalClassroom
          :authority-table="authorityTable"
          :backend-data="classroomTimeTableOrigin"
          :classroom-id="getClassroomSelectionId"
      />
    </div>
    <div class="picker-layer" v-loading="pickerLoading">
      <PickerClassroom
        :selectors="allowClassroomInfo"
        :key="pickerComponentKey"
        @update:selectedClassroom="handleSelectedClassroom"
        @loading-done="pickerLoadingDone"
      />
    </div>
    <div class="table-layer" v-loading="tableChangeLoading">
      <div class="table-component">
        <TimeTableBarClassroom
          :backend-data="classroomTimeTableOrigin"
          :authority-table="authorityTable"
          :has-chosen-classroom-flag="hasChosenClassroomFlag"
          @loading-done="tableLoadingDone"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-component {
  display: flex;
  height: auto;
  width: 100%;
}

.app-container {
  min-height: 1200px;
  background-color: #F7FAFF;
  display: flex;
  flex-direction: column;
}

.table-layer {
  height: auto;
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
