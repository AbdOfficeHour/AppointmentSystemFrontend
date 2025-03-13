<template>
  <div class="rounded-dialog">
    <el-dialog
        :model-value="ifVisible"
        @close="closeDialog"
        width="700px"
        top="5vh"
        class="rounded-dialog"
    >
      <div class="dialog-title">
        {{ t("classroom_form.form.title") }}
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
            <el-form-item :label="t('classroom_form.form.name')" prop="name">
              <el-input v-model="props.userInfo.username" disabled class="custom-input"/>
            </el-form-item>

            <!-- 选择教室 -->
            <el-form-item :label="t('classroom_form.form.selectClassroom')" prop="classroom">
              <el-select v-model="ruleForm.classroom" :placeholder="t('classroom_form.form.selectClassroom')"
                         class="custom-input">
                <el-option
                    v-for="item in classrooms"
                    :key="item.classroomID"
                    :label="item.classroom"
                    :value="item.classroomID"
                    @click="getTime"
                />
              </el-select>
            </el-form-item>


            <!--            使用性质-->
            <el-form-item :label="t('classroom_form.form.nature')" prop="nature" v-if="haveNature">
              <el-select v-model="ruleForm.nature" :placeholder="t('classroom_form.form.selectNature')"
                         class="custom-input">
                <el-option
                    v-for="item in natures"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                />
              </el-select>
            </el-form-item>

            <!-- 选择日期 -->
            <el-form-item :label="t('classroom_form.form.selectDate')" required v-if="ruleForm.classroom !== ''">
              <el-date-picker v-model="ruleForm.date" type="date" :placeholder="t('classroom_form.form.selectDate')"
                              style="width: 100%"
                              :disabled-date="disabledDate" prop="date"/>
            </el-form-item>

            <TimeOccupationBar :data="usefulTimeDay" :selected-range="selectedRange" style="margin-bottom: 10px"
                               v-if="showBar"/>


            <!-- 选择时间 -->
            <el-form-item :label="t('classroom_form.form.selectTime')" required v-if="ruleForm.date !== null">
              <div style="display: flex; align-items: center;">
                <el-form-item prop="start_time" style="flex: 1;">
                  <el-time-picker v-model="ruleForm.start_time" :placeholder="t('classroom_form.form.selectTime')"
                                  style="width: 100%"
                                  format="HH:mm"
                                  prop="start_time"
                                  :disabled-hours="disabledHours"
                                  :disabled-minutes="disabledMinutes"/>
                </el-form-item>
                <div class="time-divider">
                </div>
                <el-form-item prop="end_time" style="flex: 1;">
                  <el-time-picker v-model="ruleForm.end_time" :placeholder="t('classroom_form.form.selectTime')"
                                  style="width: 100%"
                                  format="HH:mm"
                                  prop="end_time"
                                  :disabled-hours="disabledHours"
                                  :disabled-minutes="disabledMinutes"/>
                </el-form-item>
              </div>
            </el-form-item>

            <!-- 模糊搜索 -->
            <el-form-item :label="t('classroom_form.form.searchMember')">
              <el-input
                  type="text"
                  v-model="searchQuery"
                  @input="debouncedHandleInput"
                  :placeholder="t('classroom_form.form.searchMember')"
                  :prefix-icon="Search"
              />
              <!-- 结果列表 -->
              <el-table
                  :data="names"
                  style="width: 100%; margin-top: 0; font-size: 12px"
                  v-if="names.length > 0"
                  max-height="200px"
              >
                <el-table-column
                    prop="username"
                    :label="t('classroom_form.form.name')"
                    :cell-style="{ padding: '0 5px' }"
                />
                <el-table-column
                    prop="userID"
                    :label="t('classroom_form.form.studentID')"
                    width="100"
                    :cell-style="{ padding: '0 5px' }"
                />
                <el-table-column align="right">
                  <template #header>
                    <el-button type="success" size="small" @click="updateMember" round>
                      {{ t('classroom_form.form.updateMember') }}
                    </el-button>
                  </template>
                  <template #default="scope">
                    <el-button size="small" @click="presentAdd(scope.row)">
                      {{ t('classroom_form.form.addMember') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

            </el-form-item>

            <!-- 人员名单 -->
            <el-form-item :label="t('classroom_form.form.memberList')" v-if="fpresent.length > 0">
              <el-table :data="fpresent" style="width: 100%; margin-top: 0;font-size: 12px" max-height="150px">
                <el-table-column prop="username" :label="t('classroom_form.form.name')"
                                 :cell-style="{ padding: '0' }"/>
                <el-table-column prop="userID" :label="t('classroom_form.form.studentID')"
                                 :cell-style="{ padding: '0' }" width="100px"/>
                <el-table-column align="right">
                  <template #default="scope">
                    <el-button
                        size="small"
                        type="danger"
                        @click="presentDelete(scope.$index)"

                    >
                      {{ t('classroom_form.form.removeMember') }}
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <!-- 目的 -->
            <el-form-item :label="t('classroom_form.form.purpose')" prop="aim">
              <el-select v-model="ruleForm.aim" class="custom-input">
                <el-option v-for="option in purposeOptions" :key="option.value" :label="option.label"
                           :value="option.value"/>
              </el-select>
            </el-form-item>

            <!-- 活动内容 -->
            <el-form-item :label="t('classroom_form.form.events')" prop="events" required>
              <el-input v-model="ruleForm.events" type="textarea" class="custom-input" resize="none"/>
            </el-form-item>

            <!-- 设备选择 -->
            <el-form-item :label="t('classroom_form.form.equipment')" prop="facility" style="width: 100%">
              <div class="equipment-options">
                <el-checkbox v-model="ruleForm.isMedia">{{ t("classroom_form.form.projector") }}</el-checkbox>
                <el-checkbox v-model="ruleForm.isComputer">{{ t("classroom_form.form.computer") }}</el-checkbox>
                <el-checkbox v-model="ruleForm.isSound">{{ t("classroom_form.form.sound") }}</el-checkbox>
              </div>
            </el-form-item>

            <!-- 按钮 -->
            <div class="button-group">
              <el-button @click="closeDialog" class="cancel-button">{{ t('classroom_form.form.cancel') }}</el-button>
              <el-button type="primary" @click="submitForm(ruleFormRef)" class="submit-button">
                {{ t('classroom_form.form.confirm') }}
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* ----------------------------------
 *  引入依赖
 * ---------------------------------- */
import {reactive, ref, onMounted, watch, onBeforeUnmount, computed} from 'vue'
import {ComponentSize, ElMessage, FormInstance, FormRules} from 'element-plus'
import {axiosInsV1_1 as axios} from '/src/service/axiosServer.js'
import {TimeFormat} from '@/utils/dataFormat'
import {Search} from "@element-plus/icons-vue";
import {useI18n} from "vue-i18n";// ✅ 引入 i18n
import TimeOccupationBar from "@/components/appointmentForm/timeOccupationBarHoriz.vue";

const {t} = useI18n(); // ✅ 让 t() 正常工作
const natures = ref([])//可选择性质


/* ----------------------------------
 *  接口声明
 * ---------------------------------- */
interface RuleForm {
  classroom: string
  date: Date | null
  start_time: Date | null
  end_time: Date | null
  isMedia: boolean
  isComputer: boolean
  isSound: boolean
  present: string[]  // 参与成员数据库 id
  aim: string
  events: string
  state: number
  nature: number
}

const props = defineProps(['ifVisible', 'userInfo'])
const emit = defineEmits(['closeDialog'])

/* ----------------------------------
 *  变量声明
 * ---------------------------------- */
let credit = ref<string[]>([]) // 教室审核权限
const classrooms = ref<any[]>([]) // 教室列表
const usefulTime = ref<any[]>([]) // 可用时间
const usefulTimeDay = ref([]) //选定日期的可用时间
const selectedRange = ref({}) //选定的时间段

// 模糊搜索用
const searchQuery = ref('')
const names = ref<any[]>([])
const fpresent = ref<any[]>([])

// 表单大小
const formSize = ref<ComponentSize>('default')

// 表单引用
const ruleFormRef = ref<FormInstance>()

// 初始化表单：日期和时间置为 null，以便不显示默认值
const ruleForm = reactive<RuleForm>({
  classroom: '',
  date: null,
  start_time: null,
  end_time: null,
  isMedia: false,
  isComputer: false,
  isSound: false,
  present: [],
  aim: '会议',
  events: '',
  state: 2,
  nature: null
})

//重置表单
const resetForm = () => {
  // 使用 Vue ref 获取表单实例，重置表单
  ruleFormRef.value?.resetFields()

  // 重置 ruleForm 数据
  ruleForm.classroom = ''
  ruleForm.date = null
  ruleForm.start_time = null
  ruleForm.end_time = null
  ruleForm.isMedia = false
  ruleForm.isComputer = false
  ruleForm.isSound = false
  ruleForm.present = []
  ruleForm.aim = '会议'
  ruleForm.events = ''
  ruleForm.state = 2
  ruleForm.nature = null

  // 清空已选择的参与人员
  fpresent.value = []

  // 清空模糊搜索框内容
  searchQuery.value = ''
  names.value = []
}

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


/* ----------------------------------
 *  表单校验规则
 * ---------------------------------- */
/* 目的选项 */
const purposeOptions = ref([
  {label: t("classroom_form.form.purposeOptions.meeting"), value: "会议"},
  {label: t("classroom_form.form.purposeOptions.seminar"), value: "研讨"},
  {label: t("classroom_form.form.purposeOptions.team_building"), value: "团建"},
  {label: t("classroom_form.form.purposeOptions.lecture"), value: "讲座"},
  {label: t("classroom_form.form.purposeOptions.other"), value: "其他"}
]);

const rules = reactive<FormRules>({
  classroom: [{required: true, message: t("classroom_form.form.error.selectClassroom"), trigger: "change"}],
  date: [{required: true, message: t("classroom_form.form.error.selectDate"), trigger: "change"}],
  start_time: [{required: true, message: t("classroom_form.form.error.selectTime"), trigger: "change"},
    {
      // 自定义验证：开始时间必须小于结束时间
      validator: (rule, value, callback) => {
        if (value && ruleForm.end_time && value.getTime() >= ruleForm.end_time.getTime()) {
          callback(new Error(t("classroom_form.form.error.startTimeError") || "开始时间不能大于或等于结束时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    }],
  end_time: [{required: true, message: t("classroom_form.form.error.selectTime"), trigger: "change"},
    {
      // 自定义验证：结束时间必须大于开始时间
      validator: (rule, value, callback) => {
        if (value && ruleForm.start_time && ruleForm.start_time.getTime() >= value.getTime()) {
          callback(new Error(t("classroom_form.form.error.EndTimeError") || "开始时间不能大于或等于结束时间"));
        } else {
          callback();
        }
      },
      trigger: "change",
    }],
  aim: [{required: true, message: t("classroom_form.form.error.enterPurpose"), trigger: "blur"}],
  events: [
    {required: true, message: t("classroom_form.form.error.enterEvents"), trigger: "blur"},
    {
      validator: (rule, value, callback) => {
        if (!value || value.trim().length < 5) {
          callback(new Error(t("classroom_form.form.error.minEventsLength")));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  nature: [{required: true, message: t("classroom_form.form.error.selectNature"), trigger: "blur"}],

});


/* ----------------------------------
 *  生命周期：组件挂载后请求数据
 * ---------------------------------- */
onMounted(() => {
  axios
      .get('/Appointment/list/classroom/pickerList')
      .then(response => {
        classrooms.value = response.data.data.classrooms
      })
      .catch(error => {
        console.error('错误:', error)
      })

  axios
      .get('/User/info')
      .then(response => {
        if (response.status === 200 && response.data.code === 0) {
          credit.value = response.data.data.userAuthority.credit
        } else {
          console.error('User info获取错误:', response.data.msg)
        }
      })
      .catch(error => {
        console.error('User info获取错误:', error)
      })

  //获取使用性质
  axios.get('/Appointment/classroom/nature')
      .then(response => {
        natures.value = response.data.data.nature
        console.log('natures:', natures.value)
      })
      .catch(error => {
        console.error('获取教室属性错误:', error)
      })
})


/* ----------------------------------
 *  表单提交
 * ---------------------------------- */
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      post_it()
      console.log('submit!')
    } else {
      console.log('error submit!', fields)
    }
  })
}

//验证是否有权限
const post_it = () => {
  if (credit.value.includes('OfficeHour:approve')) {
    postIt()
  } else {
    if (ruleForm.present.length < 2) {
      ElMessage.error(t("classroom_form.form.error.MemberNumberError"))
    } else {
      postIt()
    }
  }
}

//发送请求
const postIt = () => {
  // 数据打包
  // 这里要先保证 date/start_time/end_time 不为 null，否则无法转换
  if (!ruleForm.date || !ruleForm.start_time || !ruleForm.end_time) {
    ElMessage.error('请先完整填写日期和时间')
    return
  }
  const postData = {
    classroom: ruleForm.classroom,
    time: {
      date: TimeFormat.timestampAsStartOfDate(ruleForm.date).getTime(),
      start_time: TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.start_time).getTime(),
      end_time: TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.end_time).getTime()
    },
    aim: ruleForm.aim,
    events: ruleForm.events,
    present: ruleForm.present,
    isMedia: ruleForm.isMedia,
    isComputer: ruleForm.isComputer,
    isSound: ruleForm.isSound,
    // state: ruleForm.state,
    nature: ruleForm.nature,
    approver: ""
  }
  axios
      .post('/Appointment/list/classroom', postData)
      .then(response => {
        if (response.status === 200 && response.data.code === 0) {
          console.log('成功:', response.data);
          window.location.reload();
          emit('closeDialog');
          ElMessage.success(t("classroom_form.form.AppointmentSuccess"));
        } else if (response.status === 200 && response.data.code === 101) {
          ElMessage.warning(t("classroom_form.form.error.AppointmentTimeConflict"));
        } else {
          ElMessage.error(t("classroom_form.form.error.AppointmentFailed"));
        }
      })
      .catch(error => {
        console.error('Error:', error);
        ElMessage.error(t("classroom_form.form.error.AppointmentFailed"));
      });
}

/* ----------------------------------
 *  选择教室后，请求可用时间
 * ---------------------------------- */
const getTime = () => {
  axios
      .get(`/Appointment/list/classroom/pickerTime/${ruleForm.classroom}`)
      .then(response => {
        usefulTime.value = response.data.data.dateTime
        ruleForm.date = null;
        resetBar()
      })
      .catch(error => {
        console.error('错误:', error)
      })
  console.log('getTime触发')
}

/* ----------------------------------
 *  模糊搜索姓名
 * ---------------------------------- */
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

// 添加参与人员
const presentAdd = row => {
  if (!ruleForm.present.includes(row.userID)) {
    fpresent.value.push(row)
    ruleForm.present.push(row.userID)
  }
  searchQuery.value = ''
  resetnames()
}

// 删除参与人员
const presentDelete = index => {
  fpresent.value.splice(index, 1)
  ruleForm.present.splice(index, 1)
}

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

const resetBar = () => {
  usefulTimeDay.value = []
  selectedRange.value = {}
}

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
  const allMinutes = Array.from({length: 60}, (_, i) => i); // 所有分钟 0-59
  const enabledMinutes = Array.from({length: 60}, (_, i) => i); // 启用的分钟 0-59
  const disabledMinutes = allMinutes.filter(min => !enabledMinutes.includes(min)); // 差集
  return disabledMinutes;
}
//性质的计算属性
const haveNature = computed(() => {
  if (credit.value.length === 0) {
    return true
  } else {
    if (credit.value.includes('OfficeHour:approve')) {
      ruleForm.nature = 0 //性质占位符
      return false
    } else {
      return true;
    }
  }

})

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

.equipment-options {
  display: flex;
  justify-content: center;
  padding: 5px;
  width: 100%;
}

.el-button {
  font-size: 12px
}
</style>
