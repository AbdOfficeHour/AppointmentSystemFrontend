<script setup>
import { ref, onMounted } from 'vue';
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import { UserInfoFormat, PickerFormat } from "@/utils/dataFormat.js";
import { useI18n } from "vue-i18n";
import PickerOfficeHour from "@/components/index/pickerOfficeHour.vue";
import FunctionalOfficeHour from "@/components/index/functionalOfficeHour.vue";
import TimeTableBarOfficeHour from "@/components/index/timeTableBarOfficeHour.vue";
import { ElMessage } from "element-plus";

// 用户基本信息
let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
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

// 渲染逻辑相关基本变量
let pickerComponentKey = 0
let tableComponentKey = 0
let userInfoLoading = ref(true)
let pickerLoading = ref(true)
let tableChangeLoading = ref(false)
let { t } = useI18n() // 国际化翻译函数

/**
 * @description 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
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
      console.error("请求失败，获取教师时间表内信息失败")
      console.log(res.data.message)
    }
  })
}

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
      // 从后端获取OfficeHour选择器内信息
      getOfficeHourPickerInfo()
      if (authorityTable.value['OfficeHour:timeTable:all'] === false){
        // 当不具有OfficeHour:timeTable:all权限（通常为教师）的用户进入OfficeHour平台时触发，向后端请求自己的时间表数据
        getTeacherTableInfoWithNoSelector();
      }
    }
    else{
      console.error("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
    userInfoLoading.value = false
  })
}

/**
 * @description 获取OfficeHour选择器内选项信息
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
      console.error("请求失败，获取教室选择器内选项信息失败")
      console.log(res.data.message)
    }
  })
  pickerComponentKey += 1
}

/**
 * @description 依据选中的教师，获取教师时间表内信息
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
      console.error("请求失败，获取 教师 时间表内信息失败")
      console.log(res.data.message)
      tableChangeLoading.value = false
      ElMessage.error(t("index.fail_to_load_table_info"))
    }
  })
  tableComponentKey += 1
}

/**
 * @description 时间表加载完毕
 */
const tableLoadingDone = () => {
  tableChangeLoading.value = false
}

/**
 * @description 选择器加载完毕
 */
const pickerLoadingDone =() => {
  pickerLoading.value = false
}

/**
 * @description 当接收到来自PickerOfficeHour组件传递的选中教师发生变更时触发
 * 保存用户的变更，用于后续向后端请求时间表数据进行渲染
 * @param teacher - 选中的教师信息
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
    tableChangeLoading.value = true
    getOfficeHourTableInfo()
  }
};

// Mounted生命周期钩子，用于初始化页面，获取用户信息和权限信息
onMounted( function(){
  userInfoLoading.value = true
  pickerLoading.value = true
  tableChangeLoading.value = false
  // 从后端获取用户信息和权限信息
  getUserInfo()
})
</script>

<template>
  <div class="app-container">
    <div class="functional-layer">
      <FunctionalOfficeHour
        :authority-table="authorityTable"
        :backend-data="officeHourTimeTableOrigin"
        :user-id="userID"
      />
    </div>
    <div class="picker-layer">
      <div v-if="authorityTable['OfficeHour:timeTable:all']" class="picker-tutor-stu"  v-loading="pickerLoading">
        <PickerOfficeHour
          :selectors="pickerTeacherListFormat"
          @update:selectedTeacher="handleSelectedTeacher"
          @loading-done="pickerLoadingDone"
          :key="pickerComponentKey"
        />
      </div>
    </div>
    <div class="table-layer" v-loading="tableChangeLoading">
      <div class="table-component">
        <TimeTableBarOfficeHour
          :backend-data="officeHourTimeTableOrigin"
          :authority-table="authorityTable"
          @loading-done="tableLoadingDone"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
