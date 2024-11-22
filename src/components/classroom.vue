<template>
  <div class="rounded-dialog">
    <el-dialog :model-value="ifVisible" @close="emit('closeDialog')" width="600px" top="5vh" class="rounded-dialog">
      <div class="flex justify-center space-x-4" style="font-size: 18px">Classroom</div>
      <el-form
          ref="ruleFormRef"
          :model="ruleForm"
          :rules="rules"
          label-width="130px"
          label-position="top"
          class="demo-ruleForm"
          :size="formSize"
          status-icon
      >
        <!-- 名字 -->
        <el-form-item label="姓名" prop="name">
          <el-input v-model="props.userInfo.username" disabled/>
        </el-form-item>

        <!-- 选择教室 -->
        <el-form-item label="选择教室" prop="classroom" required>
          <el-select v-model="ruleForm.classroom" placeholder="选择空教室">
            <el-option
                v-for="item in classrooms"
                :key="item.classroomID"
                :label="item.classroom"
                :value="item.classroomID"
                @click="getTime"/>

          </el-select>
        </el-form-item>

        <!-- 选择日期和时间 -->
        <el-form-item label="选择日期" required>
          <!-- 日期 -->
          <el-date-picker
              v-model="ruleForm.date"
              type="date"
              aria-label="选择日期"
              placeholder="选择日期"
              style="width: 100%"
              :disabled-date="disabledDate"
              prop="date"
          />
        </el-form-item>


        <!-- 时间选择范围 -->
        <!-- 开始时间 -->
        <el-form-item label="选择时间" required>
          <div style="display: flex; align-items: center;">
            <el-form-item prop="start_time" style="flex: 1;">
              <el-time-picker
                  v-model="ruleForm.start_time"
                  aria-label="Pick a time"
                  placeholder="开始时间"
                  style="width: 100%"
                  :disabled-hours="disabledHours"
                  :disabled-minutes="disabledMinutes"
                  :disabled-seconds="disabledSeconds"
                  prop="start_time"
              />
            </el-form-item>

            <!-- 添加线，改为更一致的高度 -->
            <div style="width: 50px; height: 1px; background-color: #9399a3; margin: -20px 5px 0 5px;"></div>

            <!-- 结束时间 -->
            <el-form-item prop="end_time" style="flex: 1;">
              <el-time-picker
                  v-model="ruleForm.end_time"
                  aria-label="Pick a time"
                  placeholder="结束时间"
                  style="width: 100%"
                  :disabled-hours="disabledHours2"
                  :disabled-minutes="disabledMinutes2"
                  :disabled-seconds="disabledSeconds"
                  prop="end_time"
              />
            </el-form-item>
          </div>
        </el-form-item>

        <!-- 模糊搜索 -->
        <el-form-item label="搜索成员">
          <el-input type="text" v-model="searchQuery" @input="fetchNames" placeholder="搜索成员"/>

          <!-- 结果列表 -->
          <el-table :data="names" style="width: 100%" v-if="names.length > 0">
            <el-table-column prop="username" label="姓名" width="180"/>
            <el-table-column prop="userID" label="学号" width="180"/>
            <el-table-column align="right">
              <template #default="scope">
                <el-button size="small" @click="presentAdd(scope.row)">
                  加入
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <!-- 人员名单 -->
        <el-form-item label="人员名单" v-if="fpresent.length > 0">
          <el-table :data="fpresent" style="width: 100%">
            <el-table-column prop="username" label="姓名" width="180"/>
            <el-table-column prop="userID" label="学号" width="180"/>
            <el-table-column align="right">
              <template #default="scope">
                <el-button size="small" type="danger" @click="presentDelete(scope.$index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

        </el-form-item>


        <!-- 使用目的 -->
        <el-form-item label="请输入使用目的" prop="aim">
          <el-select v-model="ruleForm.aim">
            <el-option label="会议" value="会议"/>
            <el-option label="研讨" value="研讨"/>
            <el-option label="团建" value="团建"/>
            <el-option label="讲座" value="讲座"/>
            <el-option label="其他" value="其他"/>
          </el-select>
        </el-form-item>
        <!-- 活动内容 -->
        <el-form-item label="活动内容(可选)" prop="events">
          <el-input v-model="ruleForm.events" type="textarea"/>
        </el-form-item>

        <!-- 器材选择 -->

        <el-form-item label="仪器设备" prop="facility">
          <div class="flex justify-center space-x-4" style="margin-left: 130px">
            <el-checkbox name="type" v-model="ruleForm.isMedia">
              投影仪
            </el-checkbox>
            <el-checkbox name="type" v-model="ruleForm.isComputer">
              电脑
            </el-checkbox>
            <el-checkbox name="type" v-model="ruleForm.isSound">
              音响
            </el-checkbox>
          </div>
        </el-form-item>


        <!-- 按钮 -->
        <div class="flex justify-center space-x-4">
          <el-button @click="emit('closeDialog')">取消</el-button>
          <el-button type="primary" @click="submitForm(ruleFormRef)">确认</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, defineProps, defineEmits} from 'vue'
import {ComponentSize, ElMessage, FormInstance, FormRules} from 'element-plus'
import axios from "axios";
import {onMounted} from 'vue';
import {TimeFormat} from '@/utils/index/format'

interface RuleForm {
  classroom: string
  date: number
  start_time: number
  end_time: number
  isMedia: boolean// 是否使用投影仪
  isComputer: boolean // 是否使用电脑
  isSound: boolean // 是否使用音响
  present: [string] // 参与成员数据库id主键对应值的字符串
  aim: string // 使用目的（枚举类）
  events: string // 活动内容
  state: number // 事件状态
}

const props = defineProps(["ifVisible", "userInfo"])

const emit = defineEmits(["closeDialog"])

const classrooms = ref([])  //教室和id
const usefulTime = ref([]) //可用时间

//初始化可选教师姓名
onMounted(() => {
  console.log("挂载中")
  axios.get('/Appointment/list/classroom/pickerList')
      .then(response => {
        classrooms.value = response.data.data.classrooms;
      })
      .catch(error => {
        console.error('错误:', error);
      });

});


// 模糊搜索姓名用的
const searchQuery = ref('');  //模糊搜索时的中间变量
const names = ref([]);  //模糊搜索返回的名字
const fpresent = ref([]);//伪present，为了显示而创造的fpresent数组


const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  classroom: "",
  date: 0,
  start_time: 0,
  end_time: 0,
  isMedia: false, // 是否使用投影仪
  isComputer: false, // 是否使用电脑
  isSound: false, // 是否使用音响
  present: [], // 参与成员数据库id主键对应值的字符串
  aim: '会议', // 使用目的（枚举类）
  events: '', // 活动内容
  state: 2 // 事件状态
})


const rules = reactive<FormRules<RuleForm>>({

  classroom: [
    {
      required: true,
      message: '请选择教室',
      trigger: 'change',
    },
  ],
  date: [
    {
      type: 'date',
      required: true,
      message: '请先选择日期',
      trigger: 'change',
    },
  ],
  start_time: [
    {
      type: 'date',
      required: true,
      message: '请选择开始时间',
      trigger: 'change',
    },
  ],
  end_time: [
    {
      type: 'date',
      required: true,
      message: '请选择结束时间',
      trigger: 'change',
    },
  ],
  aim: [
    {required: true, message: '请填写使用目的', trigger: 'blur'},
  ]
})


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

//检查人数够不够
const post_it = () => {
  if (ruleForm.present.length < 2) {
    ElMessage.error('至少需要3名成员');
  } else {
    postIt();
  }
}

const postIt = () => {
  // 数据
  let postData = {
    "classroom": ruleForm.classroom,
    "time": {
      "date": TimeFormat.timestampAsStartOfDate(ruleForm.date).getTime(),
      "start_time": TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.start_time).getTime(), // 起始
      "end_time": TimeFormat.combineDateAndTime(ruleForm.date, ruleForm.end_time).getTime(),
    },
    "aim": ruleForm.aim,
    "events": ruleForm.events,
    "present": ruleForm.present,
    "isMedia": ruleForm.isMedia,
    "isComputer": ruleForm.isComputer,
    "isSound": ruleForm.isSound,
    "state": ruleForm.state
  };
  axios.post('/Appointment/list/classroom', postData)
      .then(response => {
        if (response.status === 200 && response.data.code === 0) {
          window.location.reload();
          emit('closeDialog');
          ElMessage.success('提交成功');
        }
        else if (response.status === 200 && response.data.code === 101) {
          ElMessage.warning("预约失败，此时段审核已拒绝过您的预约");
        }
        else {
          ElMessage.error('提交失败')
        }
      })
      .catch(error => {
        ElMessage.error('提交失败')
        console.error('Error:', error);
      });
};


//得到对应教室的可使用时间
const getTime = () => {
  axios.get(`/Appointment/list/classroom/pickerTime/${ruleForm.classroom}`)
      .then(response => {
        usefulTime.value = response.data.data.dateTime;
      })
      .catch(error => {
        console.error('错误:', error);
      });
  console.log("gettime触发");
};


//模糊搜索的请求
const fetchNames = () => {
  if (searchQuery.value.length == 0) resetnames();
  else {
    console.log("发送模糊搜索请求", searchQuery.value);
    axios.get('/User/search', {
      params: {
        "searchData": searchQuery.value
      }
    }).then((res) => {
      if (res.data.code == 0) names.value = res.data.data.userList;
      else resetnames()
    })
  }
}

//重置names
const resetnames = () => {
  names.value = [];
};
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


let mergehours = []; //小时集合
let mergeminutes = {};//分钟对象集合
const allHours = Array.from({length: 24}, (_, index) => index); // [0, ..., 23]
const allMinutes = Array.from({length: 60}, (_, index) => index); // [0, ..., 59]


//日期选择
// 将时间戳数组转换为 Date 对象数组
const allowedDates = () => {
  // console.log("allowDates触发")
  return usefulTime.value.map(ts => new Date(ts.date).toDateString())
};

// 禁用不在 allowedDates 中的日期
const disabledDate = date => !allowedDates().includes(date.toDateString());

//根据日期显示时间范围
const selectedTimes = () => {
  const dateTimestamp = ruleForm.date;
  const timeEntry = usefulTime.value.find(entry => entry.date === dateTimestamp);
  if (timeEntry) {
    // console.log(timeEntry.times);
    return timeEntry.times;
  } else {
    // console.log(false);
    return false;
  }

};

//合并所有时间范围并返回范围
const disabledHours = () => {
  const timeList = selectedTimes();
  // console.log("disabledHours", timeList);
  if (!timeList) return allHours;

  for (let i = 0; i < timeList.length; i++) {
    const st = timeList[i].startTime;
    const ed = timeList[i].endTime;
    const {hourRange} = getAvailableTimeRange(timestampToHourMinute(st), timestampToHourMinute(ed));
    mergehours = [...new Set([...mergehours, ...hourRange])];
  }
  const disabledHours = allHours.filter(hour => !mergehours.includes(hour)).sort((a, b) => a - b);//排序
  // console.log(disabledHours);
  return disabledHours;
};

//合并每小时分别的分钟数
const merge_minutes = () => {

  const timeList = selectedTimes();
  // console.log(timeList);
  if (!timeList) return false;
  for (let i = 0; i < timeList.length; i++) {
    const st = timeList[i].startTime;
    const ed = timeList[i].endTime;
    const {minuteRange} = getAvailableTimeRange(timestampToHourMinute(st), timestampToHourMinute(ed));
    for (const key in minuteRange) {
      if (mergeminutes[key]) {
        // 合并数组并去重
        mergeminutes[key] = [...new Set([...mergeminutes[key], ...minuteRange[key]])].sort((a, b) => a - b);
      } else {
        mergeminutes[key] = minuteRange[key];
      }
    }

  }
  return mergeminutes;
};

//返回禁用分钟数
const disabledMinutes = (hour) => {
  // console.log("disabledMinutes");
  const minuteRange = merge_minutes();
  if (!minuteRange) return allMinutes;
  const disabledMinutes = allMinutes.filter(minute => !minuteRange[hour].includes(minute));
  return disabledMinutes;
};

//返回禁用秒数
const disabledSeconds = () => {
  return Array.from({length: 60}, (_, i) => i).filter(i => i !== 0);
};

//时间戳->小时：分钟
const timestampToHourMinute = (timestamp) => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0'); // 获取小时并补齐至两位数
  const minutes = String(date.getMinutes()).padStart(2, '0'); // 获取分钟并补齐至两位数

  return `${hours}:${minutes}`; // 返回“小时:分钟”格式的字符串
};

//时间范围格式
function getAvailableTimeRange(startTime, endTime) {
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return {hours, minutes};
  };

  const start = parseTime(startTime);
  const end = parseTime(endTime);

  // 计算小时范围
  const hourRange = [];
  for (let hour = start.hours; hour <= end.hours; hour++) {
    hourRange.push(hour);
  }

  // 计算分钟范围
  const minuteRange = {};
  hourRange.forEach(hour => {
    if (hour === start.hours && hour === end.hours) {
      minuteRange[hour] = Array.from({length: end.minutes - start.minutes + 1}, (_, i) => i + start.minutes);
    } else if (hour === start.hours) {
      minuteRange[hour] = Array.from({length: 60 - start.minutes}, (_, i) => i + start.minutes);
    } else if (hour === end.hours) {
      minuteRange[hour] = Array.from({length: end.minutes + 1}, (_, i) => i);
    } else {
      minuteRange[hour] = Array.from({length: 60}, (_, i) => i);
    }
  });

  return {
    hourRange,
    minuteRange
  };
}


//根据“小时：分钟”生成date对象
function createDateFromTimeString(timeString) {
  const currentDate = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  // 创建一个新的 Date 对象
  const resultDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      hours,
      minutes,
      0, // 设置秒为0
      0  // 设置毫秒为0
  );
  return resultDate;
}

//date对象转换成小时：分钟
function formatDateToTimeString(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

//已知开始时间返回时间段
const get_TimeRange = () => {
  let start_time = ruleForm.start_time;
  const start_obj = createDateFromTimeString(timestampToHourMinute(start_time));
  // console.log(start_obj);
  const timeList = selectedTimes();
  // console.log(timeList);
  if (!timeList) return false;
  for (let i = 0; i < timeList.length; i++) {
    let st = timeList[i].startTime;
    let ed = timeList[i].endTime;
    st = createDateFromTimeString(timestampToHourMinute(st));
    ed = createDateFromTimeString(timestampToHourMinute(ed));
    if (st <= start_obj && start_obj <= ed) return [start_obj, ed];
  }
  ;
  return false;
};

//对于第二个空的小时处理
const disabledHours2 = () => {
  const range = get_TimeRange();
  if (!range) return allHours;
  const {hourRange} = getAvailableTimeRange(formatDateToTimeString(range[0]), formatDateToTimeString(range[1]));
  const disabledHours = allHours.filter(hour => !hourRange.includes(hour));
  return disabledHours;

};

//对于第二个空的分钟处理
const disabledMinutes2 = (hour) => {
  const range = get_TimeRange();
  if (!range) return allMinutes;
  const {minuteRange} = getAvailableTimeRange(formatDateToTimeString(range[0]), formatDateToTimeString(range[1]));
  const disabledMinutes = allMinutes.filter(minute => !minuteRange[hour].includes(minute));
  return disabledMinutes;

};

</script>
<style scoped>
.demo-ruleForm {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-table {
  border-radius: 8px;
  overflow: hidden;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.justify-center {
  justify-content: center;
}

.space-x-4 > :not(:first-child) {
  margin-left: 16px;
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  color: #a0aec0;
}

.rounded-dialog {
  border-radius: 100px;
  overflow: hidden;
}
</style>