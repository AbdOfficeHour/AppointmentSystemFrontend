<script setup>
import {ref,reactive,defineEmits,defineProps,watch,computed} from 'vue';
import operateButton from "@/components/appointmentList/operateButton.vue"
import StateIcon from "@/components/appointmentList/stateIcon.vue";

/*
定义触发事件
 */
const emit = defineEmits(["modeChange","dateChange","rowClick","addEventClicked","editEventClicked"]);

/*
定义属性
 */
const props = defineProps(["data","mode","operationMode","userInfo"])


/**
 * 根据行索引设置表格行的样式
 * @param row 行代理对象
 * @param rowIndex 索引
 * @return {string} 添加的类
 */
const tableRowClassName = ({rowIndex,}) => {
  if (rowIndex%2 === 1) {
    return 'odd'
  }
  return ''
}

// officeHour表头
const theadOfOfficeHour = [
  {
    name:"预约教师",
    prop:"teacher_name",
    width:120
  },
  {
    name:"预约学生",
    prop:"student_name",
    width:120
  },
  {
    name:"日期",
    prop:"date",
    width:120
  },
  {
    name:"开始时间",
    prop:"startTime",
    width:120
  },
  {
    name:"结束时间",
    prop:"endTime",
    width:120
  },
  {
    name:"备注",
    prop:"note",
    width:120
  },
  {
    name:"要咨询的问题",
    prop:"question"
  },
  {
    fixed:"right",
    name:"状态",
    prop:"state",
    width:120
  },
  {
    fixed: "right",
    name:"操作",
    prop:"operation",
    width:180
  }
]
// classroom表头
const theadOfClassroom = [
  {
    name:"教室",
    prop:"classroom",
    width:120
  },
  {
    name:"申请人",
    prop:"applicant",
    width:120
  },
  {
    name:"日期",
    prop:"date",
    width:120
  },
  {
    name:"开始时间",
    prop:"startTime",
    width:120
  },
  {
    name:"结束时间",
    prop:"endTime",
    width:120
  },
  {
    name:"是否使用投影仪",
    prop:"isMedia",
    width:120
  },
  {
    name:"是否使用电脑",
    prop:"isComputer",
    width:120
  },
  {
    name:"是否使用音响",
    prop:"isSound",
    width:120
  },
  {
    name:"使用目的",
    prop:"aim",
    width:120
  },
  {
    name:"活动内容",
    prop:"event",
    width:120
  },
  {
    fixed:"right",
    name:"事件状态",
    prop:"state",
    width:120
  },
  {
    fixed: "right",
    name:"操作",
    prop:"operation",
    width:180
  }
]

// 数据部分
const selectDate = ref("0");
const currentPage = ref(1)
const pageSize = ref(5)
const thead = ref(props.mode === "officeHour"?theadOfOfficeHour:theadOfClassroom)
const ifOfficeHour = ref(false)
const ifClassroom = ref(false)
const mode = ref("officeHour")

watch(()=>props.mode,(newVal)=>{
  mode.value = newVal
  if(newVal === "officeHour")
    thead.value = theadOfOfficeHour
  else
    thead.value = theadOfClassroom
})

/*
 * 切换日期选择
 */
watch(selectDate, (newVal) => {
  emit('dateChange', newVal);
})
watch(props.userInfo,(newVal)=> {
  const creditList = newVal.userAuthority.credit
  console.log(props.operationMode)
  console.log(creditList)
  if(props.operationMode === "view") {
    if (creditList.includes("OfficeHour:appointment")) {
      ifOfficeHour.value = true
    }
    const classroomList = [
      "classroom:appointment:104",
      "classroom:appointment:106",
      "classroom:appointment:202B",
    ]
    if (classroomList.some(item => classroomList.includes(item))){
      ifClassroom.value = true
    }
  }else{
    console.log(creditList)
    if (creditList.includes("OfficeHour:approve")){
      ifOfficeHour.value = true
    }
    if(creditList.includes("classroom:approve")){
      ifClassroom.value = true
    }
  }
})

// 计算分页
const pageData = computed(()=>{
  return props.data.slice((currentPage.value-1)*pageSize.value,currentPage.value*pageSize.value)
})


/*
 * 以下所有均为事件处理函数
 */


/**
 * 预约查看模式的切换
 */
const handleModeChange = () => {
  // 先进行一些值的改变
  if(mode.value === "officeHour"){
    thead.value = theadOfOfficeHour;
  }else{
    thead.value = theadOfClassroom;
  }

  // 再触发事件
  emit("modeChange",mode.value);
}

</script>

<template>
  <div class="appointment-table-container">
    <div class="date-picker">
      <label class="date-picker-option">
        <input type="radio" name="selectDate" value="0" v-model="selectDate" checked>
        <span class="option-box">三月内</span>
      </label>
      <label class="date-picker-option">
        <input type="radio" name="selectDate" value="1" v-model="selectDate">
        <span class="option-box">半年内</span>
      </label>
      <label class="date-picker-option">
        <input type="radio" name="selectDate" value="2" v-model="selectDate">
        <span class="option-box">一年内</span>
      </label>
      <label class="date-picker-option">
        <input type="radio" name="selectDate" value="3" v-model="selectDate">
        <span class="option-box">已撤回</span>
      </label>
    </div>
    <div class="appointment-table">
      <div class="icon-field">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="21" height="21" viewBox="0 0 21 21" fill="none">
          <path   fill-rule="evenodd"  fill="#10239E"  d="M1.16676 2.33331L0 2.33331L0 0L21 0L21 2.33331L19.8332 2.33331L14.0001 11.0834L14.0001 21L6.99993 21L6.99993 11.0834L1.16676 2.33331ZM9.33321 18.6664L9.33321 10.376L3.9712 2.333L17.0286 2.333L11.6666 10.376L11.6666 18.6664L9.33321 18.6664Z">
          </path>
        </svg>
        <state-icon :state="2"/>
        <state-icon :state="3"/>
        <state-icon :state="4"/>
        <state-icon :state="5"/>
      </div>
      <div class="button-field">
        <el-select class="mode-option" placeholder="请选择预约类型" v-model="mode" @change="handleModeChange">
          <el-option v-if="ifOfficeHour" value="officeHour" label="教师预约 OfficeHour">教师预约 OfficeHour</el-option>
          <el-option v-if="ifClassroom" value="教室预约" label="教室预约 Classrooms">教室预约 Classrooms</el-option>
        </el-select>
        <operate-button
            :operate-type="1"
            style="margin-left: auto;"
            @addEventClicked="()=>{emit('addEventClicked')}"
            v-if="props.operationMode === 'view' "/>
      </div>
      <el-table
          :data="pageData"
          :row-class-name="tableRowClassName"
          @row-click="(row,col,event)=>{emit('rowClick',row,col,event)}"
      >
        <el-table-column type="selection"/>
        <el-table-column type="index" label="序号" width="60" fixed/>
        <el-table-column
            :fixed="item.fixed"
            v-for="item in thead"
            :prop="item.prop"
            :label="item.name"
            :width="item.width"
            sortable
        >
          <template #default="scope" v-if="item.prop==='operation'">
            <operate-button
                :operate-type="scope.row.operation"
                :state="scope.row.state"
                :operateMode="props.operationMode"
                :event-id="scope.row.id"
                :mode="mode"
                @edit-event-clicked="(eventId,operate)=>{emit('editEventClicked',eventId,operate)}"
            />
          </template>
          <template #default="scope" v-else-if="item.prop==='state'">
            <state-icon :state="scope.row.state"/>
          </template>
        </el-table-column>
      </el-table>

      <!--分页部分-->
      <el-pagination
          class="pagination"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          size="small"
          :page-sizes="[5,10,20,50]"
          background
          layout="prev, pager, next,sizes"
          :total="data.length"
      />
    </div>
  </div>

</template>

<style>
.el-table .odd {
  --el-table-tr-bg-color: #f0f5ff;
}

.appointment-table-container{
  margin-top: 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/**
日期选择器
 */
.date-picker{
  display: grid;
  position: relative;
  cursor: pointer;
  user-select: none;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
}

.date-picker-option{
  width: 75px;
  height: 25px;
}

.date-picker-option input{
  position: absolute;
  opacity: 0;
  cursor: pointer;
  width: 75px;
  height: 25px;
}

.date-picker-option input[type="radio"]:checked + span{
  background-color: #88adff;
  color: white;
}

.option-box{
  display: inline-block;
  width: 75px;
  height: 25px;

  border: #8c8c8c solid 1px;
  border-radius: 5px;

  text-align: center;
}

/**
表格部分
 */
.appointment-table{
  margin-top: 20px;
  width: 75%;
  display: flex;
  flex-direction: column;
}

.icon-field{
  display: inline-flex;
  gap: 10px;
  margin-bottom: 10px;
}

.button-field{
  width: 100%;
  display: inline-flex;
}

.button-field .mode-option{
  width: 15%;
}

.pagination{
  margin-top: 20px;
  align-self: center;
}
</style>
