<template>
  <div class="rounded-dialog">
    <el-dialog
        :model-value="ifVisible"
        @close="closeDialog"
        width="90%"
        top="5vh"
        class="rounded-dialog">
      <div class="dialog-title">
        {{ t("officeHour_form.form.title") }}
      </div>
      <div class="dialog-container">
        <div class="form-container">
          <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="rules"
              label-width="130px"
              label-position="top"
              class="custom-form"
              :size="formSize"
              status-icon
          >

            <!-- 名字 -->
            <el-form-item :label="t('officeHour_form.form.name')" prop="name">
              <el-input v-model="props.userInfo.username" disabled class="custom-input"/>
            </el-form-item>

            <!-- 选择老师 -->
            <el-form-item :label="t('officeHour_form.form.selectTeacher')" prop="teacher">
              <el-select v-model="ruleForm.teacher" :placeholder="t('officeHour_form.form.selectTeacher')"
                         class="custom-input">
                <el-option
                    v-for="item in teachers"
                    :key="item.teacherID"
                    :label="item.teacherName"
                    :value="item.teacherID"
                    @click="getTime"
                />
              </el-select>
            </el-form-item>

            <el-form-item v-if="office" class="inline-form">
              <div style="display: flex; align-items: center; gap: 20px;">
                <!-- 办公室 -->
                <div class="form-field">
                  <span class="field-label">{{ t('officeHour_form.form.office') }}:</span>
                  <el-input v-model="office" disabled class="custom-info plain-text"/>
                </div>

                <!-- 科目 -->
                <div class="form-field">
                  <span class="field-label">{{ t('officeHour_form.form.course') }}:</span>
                  <el-input v-model="course" disabled class="custom-info plain-text"/>
                </div>
              </div>
            </el-form-item>

            <!-- 选择日期 -->
            <el-form-item :label="t('officeHour_form.form.selectDate')" required v-if="ruleForm.teacher !== ''">
              <el-date-picker
                  v-model="ruleForm.date"
                  type="date"
                  :placeholder="t('officeHour_form.form.selectDate')"
                  style="width: 100%"
                  :disabled-date="disabledDate"
                  prop="date"
              />
            </el-form-item>

            <TimeOccupationBar v-if="showBar" :data="usefulTimeDay" :selected-range="selectedRange"
                               style="margin-bottom: 10px"/>


            <!-- 选择时间 -->
            <el-form-item :label="t('officeHour_form.form.selectTime')" required v-if="ruleForm.date !== null">
              <div style="display: flex; align-items: center;">
                <el-form-item prop="start_time" style="flex: 1;">
                  <el-time-picker
                      v-model="ruleForm.start_time"
                      :placeholder="t('officeHour_form.form.selectTime')"
                      prop="start_time"
                      style="width: 100%"
                      format="HH:mm"
                      :disabled-hours="disabledHours"
                      :disabled-minutes="disabledMinutes"
                  />
                </el-form-item>

                <div class="time-divider">
                </div>

                <el-form-item prop="end_time" style="flex: 1;">
                  <el-time-picker
                      v-model="ruleForm.end_time"
                      :placeholder="t('officeHour_form.form.selectTime')"
                      class="custom-input"
                      prop="end_time"
                      style="width: 100%"
                      format="HH:mm"
                      :disabled-hours="disabledHours"
                      :disabled-minutes="disabledMinutes"
                  />
                </el-form-item>
              </div>
            </el-form-item>

            <!-- 搜索成员 -->
            <el-form-item :label="t('officeHour_form.form.searchMember')">
              <el-input
                  type="text"
                  v-model="searchQuery"
                  @input="debouncedHandleInput"
                  :placeholder="t('officeHour_form.form.searchMember')"
                  clearable
                  :prefix-icon="Search"
                  class="custom-input"
              />
              <el-table :data="names" style="width: 100%; margin-top: 0;font-size: 12px" v-if="names.length > 0"
                        max-height="200px">
                <el-table-column prop="username" :label="t('officeHour_form.form.name')"/>
                <el-table-column prop="userID" :label="t('officeHour_form.form.studentID')" width="100"/>
                <el-table-column align="right">
                  <template #header>
                    <el-button type="success" size="small" @click="updateMember" round>
                      {{ t('officeHour_form.form.updateMember') }}
                    </el-button>
                  </template>
                  <template #default="scope">
                    <el-button size="small" type="primary" @click="presentAdd(scope.row)">
                      {{ t('officeHour_form.form.addMember') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <!-- 同行名单 -->
            <el-form-item :label="t('officeHour_form.form.memberList')" v-if="fpresent.length > 0">
              <el-table :data="fpresent" style="width: 100%;margin-top: 0;font-size: 12px " max-height="150px">
                <el-table-column prop="username" :label="t('officeHour_form.form.name')"
                                 :cell-style="{ padding: '0 5px' }"/>
                <el-table-column prop="userID" :label="t('officeHour_form.form.studentID')" width="100"
                                 :cell-style="{ padding: '0 5px' }"/>
                <el-table-column align="right">
                  <template #default="scope">
                    <el-button size="small" type="danger" @click="presentDelete(scope.$index)">
                      {{ t('officeHour_form.form.removeMember') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <!-- 问题 -->
            <el-form-item :label="t('officeHour_form.form.question')" prop="question">
              <el-input v-model="ruleForm.question" type="textarea" resize="none"/>
            </el-form-item>

            <!-- 备注 -->
            <el-form-item :label="t('officeHour_form.form.note')" prop="note">
              <el-input v-model="ruleForm.note" type="textarea" resize="none"/>
            </el-form-item>

            <!-- 按钮 -->
            <div class="button-group">
              <el-button @click="closeDialog" class="cancel-button">{{ t('officeHour_form.form.cancel') }}</el-button>
              <el-button type="primary" @click="submitForm(ruleFormRef)" class="submit-button">{{
                  t('officeHour_form.form.confirm')
                }}
              </el-button>
            </div>
          </el-form>
          <!--          <button @click="testBar">test</button>-->
          <!--          <button @click="testSelect">select</button>-->
        </div>

        <!--        <div class="extra-content">-->
        <!--          <TimeOccupationBar :data="usefulTimeDay" :selected-range="selectedRange"/>-->
        <!--        </div>-->
      </div>
    </el-dialog>
  </div>
</template>


<script setup lang="ts">
import {onBeforeUnmount, reactive, ref, watch} from 'vue'
import type {ComponentSize, FormInstance, FormRules} from 'element-plus'
import {axiosInsV1_1 as axios} from '/src/service/axiosServer.js'
import {onMounted} from 'vue';
import {TimeFormat} from '@/utils/dataFormat'
import router from '@/router';
import {ElMessage} from "element-plus";
import {Search} from "@element-plus/icons-vue";
import {useI18n} from "vue-i18n"; // 引入 i18n
import TimeOccupationBar from "@/components/appointmentForm/timeOccupationBarHoriz.vue";

const {t} = useI18n(); // 使用 Vue i18n 进行翻译

interface RuleForm {
  teacher: string
  date: Date | null
  start_time: Date | null
  end_time: Date | null
  present: string[]
  question: string
  note: string
}

const props = defineProps(["ifVisible", "userInfo"])
const emit = defineEmits(["closeDialog"])
const teachers = ref([])  //老师们的名字和id
const usefulTime = ref([]) //可用时间
const usefulTimeDay = ref([]) //选定日期的可用时间
const selectedRange = ref({}) //选定的时间段

// 模糊搜索姓名用的
const searchQuery = ref('');  //模糊搜索时的中间变量
const names = ref([]);  //模糊搜索返回的名字
const fpresent = ref([]);//伪present，为了显示而创造的fpresent数组


const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  teacher: "",
  date: null,
  start_time: null,
  end_time: null,
  present: [],
  question: "",
  note: "",
})

//重置表单
const resetForm = () => {
  // 使用 Vue ref 获取表单实例，重置表单
  ruleFormRef.value?.resetFields()

  ruleForm.teacher = "";
  ruleForm.date = null;
  ruleForm.start_time = null;
  ruleForm.end_time = null;
  ruleForm.present = [];
  ruleForm.question = "";
  ruleForm.note = "";

  // 清空已选择的参与人员
  fpresent.value = []
};

//初始化可选教师姓名
onMounted(() => {
  resetForm()
  axios.get('/Appointment/list/officehour/pickerList')
      .then(response => {
        teachers.value = response.data.data.teachers;
      })
      .catch(error => {
        console.error('错误:', error);
      });
  // console.log(teachers.value)
});

//关闭表单
const closeDialog = () => {
  resetForm()
  resetBar()
  resetnames()
  searchQuery.value = ''
  setTimeout(() => {
    showBar.value = false
  }, 10)

  setTimeout(() => {
    emit('closeDialog')
  }, 20)
}


//验证规则
const rules = reactive<FormRules<RuleForm>>({
  teacher: [
    {
      required: true,
      message: t("officeHour_form.form.error.selectTeacher"),
      trigger: "change",
    },
  ],
  date: [
    {
      type: "date",
      required: true,
      message: t("officeHour_form.form.error.selectDate"),
      trigger: "change",
    },
  ],
  start_time: [
    {
      type: "date",
      required: true,
      message: t("officeHour_form.form.error.selectTime"),
      trigger: "change",
    },
    {
      // 自定义验证：开始时间必须小于结束时间
      validator: (rule, value, callback) => {
        if (value && ruleForm.end_time && value.getTime() >= ruleForm.end_time.getTime()) {
          callback(new Error(t("officeHour_form.form.error.startTimeError") || "开始时间不能大于或等于结束时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    }
  ],
  end_time: [
    {
      type: "date",
      required: true,
      message: t("officeHour_form.form.error.selectTime"),
      trigger: "change",
    },
    {
      // 自定义验证：结束时间必须大于开始时间
      validator: (rule, value, callback) => {
        if (value && ruleForm.start_time && ruleForm.start_time.getTime() >= value.getTime()) {
          callback(new Error(t("officeHour_form.form.error.EndTimeError") || "开始时间不能大于或等于结束时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    }
  ],
  question: [
    {
      required: true,
      message: t("officeHour_form.form.error.enterQuestion"),
      trigger: "blur",
    },
  ],
});


const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      post_it();
      console.log('submit!')

    } else {
      console.log('error submit!', fields)
    }
  })
}


const post_it = () => {
  // 数据
  let postData = {
    "teacher": ruleForm.teacher,
    "time": {
      "date": TimeFormat.timestampAsStartOfDate(ruleForm.date.getTime()).getTime(),
      "start_time": TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.start_time).getTime(), // 起始
      "end_time": TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.end_time).getTime(),
    },
    "note": ruleForm.note,
    "question": ruleForm.question,
    "present": ruleForm.present
  };
  // console.log("postData", postData);
  axios.post('/Appointment/list/officehour', postData)
      .then(response => {
        if (response.status === 200 && response.data.code === 0) {
          console.log('成功:', response.data);
          window.location.reload();
          emit('closeDialog');
          ElMessage.success(t("officeHour_form.form.AppointmentSuccess"));
        } else if (response.status === 200 && response.data.code === 102) {
          ElMessage.warning(t("officeHour_form.form.error.AppointmentTimeConflict"));
        } else {
          ElMessage.error(t("officeHour_form.form.error.AppointmentFailed"));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        ElMessage.error(t("officeHour_form.form.error.AppointmentFailed"));
      });
};


//得到对应老师的可使用时间
const getTime = () => {
  office.value = teachers.value.find(t => t.teacherID === ruleForm.teacher).teacherRoom
  course.value = teachers.value.find(t => t.teacherID === ruleForm.teacher).teacherCourse
  axios.get(`/Appointment/list/officehour/pickerTime/${ruleForm.teacher}`)
      .then(response => {
        usefulTime.value = response.data.data.dateTime;
        ruleForm.date = null;
        resetBar()
      })
      .catch(error => {
        console.error('错误:', error);
      });

  console.log("gettime触发");

};


//模糊搜索的请求
let count = 1; // 记录页数


let debounceTimer = null

// 核心处理逻辑
const handleInputLogic = () => {
  resetnames()
  const isNumeric = /^\d+$/.test(searchQuery.value)
  const triggerLength = isNumeric ? 7 : 1

  if (searchQuery.value.length >= triggerLength) {
    fetchNames()
  }
}

// 带清理的防抖函数
const debouncedHandleInput = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(handleInputLogic, 500)
}

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

const fetchNames = () => {
  console.log("发送模糊搜索请求", searchQuery.value, count);
  axios
      .get('/User/search', {
        params: {
          searchData: searchQuery.value,
          page: count,
          pageSize: 20
        }
      })
      .then(res => {
        if (res.data.code === 0) {
          names.value = [...names.value, ...res.data.data.userList];
        } else {
          resetnames();
        }
      })
      .catch(err => {
        console.error("搜索请求失败", err);
        resetnames();
      });
};

// 更新参与人员
const updateMember = () => {
  count += 1
  fetchNames()
};

const resetnames = () => {
  names.value = []
  count = 1
}
const setnames = () => {
  names.value = [{
    "username": "kiki",
    "userID": "123",
  }, {
    "username": "kfc",
    "userID": "321",
  }, {
    "username": "kribi",
    "userID": "333",
  }]
};
//添加参与人员
const presentAdd = (row) => {
  if (!ruleForm.present.includes(row.userID)) {
    fpresent.value.push(row);
    ruleForm.present.push(row.userID);
  }
  searchQuery.value = '';
  resetnames();
};
//参与人员删除
const presentDelete = (index) => {
  fpresent.value.splice(index, 1);
  ruleForm.present.splice(index, 1);
};


/* ----------------------------------
 *  时间处理相关函数
 * ---------------------------------- */
// 将时间戳数组转换为 Date 对象数组后再对比
const allowedDates = () => {
  if (!usefulTime.value || !usefulTime.value.length) {
    return []
  }
  return usefulTime.value.map(ts => new Date(ts.date).toDateString())
}

// 禁用不在 allowedDates() 里的日期
const disabledDate = (date: Date) => {
  return !allowedDates().includes(date.toDateString())
}

// 选中的日期对应可用时段
const selectedTimes = () => {
  // 如果日期尚未选择，直接返回 false
  if (!ruleForm.date) {
    return false
  }
  const dateTimestamp = ruleForm.date.getTime()
  const timeEntry = usefulTime.value.find(entry => entry.date === dateTimestamp)
  if (timeEntry) {
    // console.log("timeEntry", timeEntry.times)
    return timeEntry.times
  } else {
    return false
  }
}

// 日期变化时，重置时间选择
watch(() => ruleForm.date, () => {
  showBar.value = true
  if (ruleForm.date) usefulTimeDay.value = selectedTimes();
})

watch(() => [ruleForm.start_time, ruleForm.end_time], () => {
  // 选定起始时间变化时，重置时间条
  if (ruleForm.start_time && ruleForm.end_time) {
    if (ruleForm.start_time.getTime() < ruleForm.end_time.getTime()) {
      selectedRange.value = {
        startTime: ruleForm.start_time.getTime(),
        endTime: ruleForm.end_time.getTime()
      };
    } else {
      selectedRange.value = {startTime: ruleForm.start_time.getTime(), endTime: ruleForm.start_time.getTime() + 1000}
    }
  }
})

//重置表单
const resetBar = () => {
  usefulTimeDay.value = []
  selectedRange.value = {}
}

const testBar = () => {
  usefulTimeDay.value = [
    {startTime: new Date('2025-01-10T09:10:00').getTime(), endTime: new Date('2025-01-10T12:00:00').getTime()},
    {startTime: new Date('2025-01-10T15:00:00').getTime(), endTime: new Date('2025-01-10T16:00:00').getTime()},
    {startTime: new Date('2025-01-10T08:30:00').getTime(), endTime: new Date('2025-01-10T09:00:00').getTime()},
  ]

}

let currentStartTime = new Date('2025-01-10T09:30:00');
let currentEndTime = new Date('2025-01-10T10:30:00');
const testSelect = () => {
  // 获取当前的时间


  // 增加1分钟
  currentStartTime.setMinutes(currentStartTime.getMinutes() - 1);
  currentEndTime.setMinutes(currentEndTime.getMinutes() + 10);

  // 更新 ruleForm 和 selectedRange
  // ruleForm.start_time = currentStartTime;
  // ruleForm.end_time = currentEndTime;

  selectedRange.value = {};
};

//限制时间选择
const disabledHours = () => {
  // 禁用 0-7 点和 20-23 点
  // return [...Array(8).keys(), ...Array(2).keys().map(i => i + 22)]
  const allHours = Array.from({length: 24}, (_, i) => i); // 所有小时 0-23
  const enabledHours = Array.from({length: 14}, (_, i) => i + 8); // 启用的小时 8-21
  const disabledHours = allHours.filter(hour => !enabledHours.includes(hour)); // 差集
  return disabledHours;
}

const disabledMinutes = () => {
  // if (selectedHour < 8 || selectedHour >= 22) {
  //   // 完全禁用非8-20小时的分钟选择
  //   return Array(60).keys()
  // }
  // return []
  const allMinutes = Array.from({ length: 60 }, (_, i) => i); // 所有分钟 0-59
  const enabledMinutes = Array.from({ length: 60 }, (_, i) => i); // 启用的分钟 0-59
  const disabledMinutes = allMinutes.filter(min => !enabledMinutes.includes(min)); // 差集
  return disabledMinutes;
}

//办公室和科目
const office = ref('')
const course = ref('')

//显示时间条
const showBar = ref(false)
</script>
<style scoped>
/* 对话框宽度设置为90% */
:deep(.el-dialog) {
  width: 90% !important;
  max-width: 100% !important;
  margin: 10px auto;
  padding: 13px;
  border-radius: 20px;
}

/* 表单项垂直排列，并且宽度为100% */
:deep(.el-form) {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item) {
  margin-bottom: 12px;
  width: 100%;
}

/* 修改输入框、选择框、时间选择器的宽度为100% */
:deep(.el-input),
:deep(.el-select),
:deep(.el-time-picker),
:deep(.el-date-picker) {
  width: 100%;
  border-radius: 10px;
  font-size: 14px;
}

/* 修改按钮的样式，按钮宽度设置为100% */
/* 自定义按钮组 */
.button-group {
  display: flex;
  flex-direction: column; /* 让按钮上下排列 */
  padding-top: 20px; /* 上边距 */
  align-items: stretch; /* 确保按钮宽度是100% */
}

/* 按钮样式 */
.submit-button,
.cancel-button {
  width: 100%; /* 让按钮宽度占满父容器 */
  border-radius: 10px;
  margin: 5px;
  font-size: 16px;
}

.submit-button {
  background-color: #007bff;
  color: white;
  margin-left: 0;
}

.cancel-button {
  background-color: #ff4d4f;
  color: white;
  margin-left: 0;
}

/* 优化标题样式 */
.dialog-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

/* 表单容器 */
.custom-form {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 右侧内容区域 */
.extra-content {
  width: 100%; /* 让右侧内容区域宽度100% */
  margin-top: 15px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 时间选择器容器改为垂直布局 */
.time-picker-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
}


/* 表格的自适应 */
:deep(.el-table) {
  width: 100%;
  overflow-x: auto;
  margin-top: 10px;
}

:deep(.el-table-column) {
  padding-left: 5px;
  padding-right: 5px;
}

:deep(.el-table-column .cell) {
  font-size: 14px;
}

/* 禁用日期和时间选择器样式 */
:deep(.el-date-picker),
:deep(.el-time-picker) {
  width: 100%;
}

.time-divider {
  width: 30px;
  height: 2px;
  background-color: #ccc;
  margin: 0 10px 12px;
}

.el-button {
  font-size: 12px
}

/* 隐藏输入框边框和背景 */
.plain-text .el-input__inner {
  border: none;
  background: transparent;
  padding-left: 0;
  color: inherit;
}

/* 调整标签样式 */
.form-field {
  display: flex;
  align-items: center;
  flex: 1;
}

.field-label {
  white-space: nowrap;
  margin-right: 5px;
}

/* 移除输入框禁用状态样式 */
.plain-text .el-input.is-disabled .el-input__inner {
  cursor: text;
  color: var(--el-text-color-regular);
}
</style>


