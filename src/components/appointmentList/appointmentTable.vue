<script setup>
import { ref, reactive, defineEmits, defineProps, watch, computed, onMounted, nextTick } from 'vue';
import operateButton from "@/components/appointmentList/operateButton.vue"
import StateIcon from "@/components/appointmentList/stateIcon.vue";
import appointmentListPhone from './appointmentListPhone.vue';
import { useI18n } from 'vue-i18n';
import EventUtils from '@/utils/eventUtil.js';

const { t, locale } = useI18n();

/*
定义触发事件
 */
const emit = defineEmits(["modeChange", "dateChange", "rowClick", "addEventClicked", "editEventClicked", "update:page", "update:pageSize"]);

/*
定义属性
 */
const props = defineProps(["data", "mode", "operationMode", "userInfo", "page", "pageSize", "totalLength"]);

/**
 * 根据行索引设置表格行的样式
 * @param row 行代理对象
 * @param rowIndex 索引
 * @return {string} 添加的类
 */
const tableRowClassName = ({ rowIndex, }) => {
	if (rowIndex % 2 === 1) {
		return 'odd'
	}
	return ''
}

const theadOfOfficeHour = ref([]);
const theadOfClassroom = ref([]);

function setHead() {
	// officeHour表头
	theadOfOfficeHour.value = [
		{
			name: t("appointment_list.officehourHead.teacher_name"),
			prop: "teacher_name",
			// width:120
		},
		{
			name: t("appointment_list.officehourHead.date"),
			prop: "date",
			// width:120
		},
		{
			name: t("appointment_list.officehourHead.startTime"),
			prop: "startTime",
			// width:120
		},
		{
			name: t("appointment_list.officehourHead.endTime"),
			prop: "endTime",
		},
		{
			fixed: "right",
			width: 120,
			name: t("appointment_list.officehourHead.state"),
			prop: "state",
		},
		{
			fixed: "right",
			width: 160,
			name: t("appointment_list.officehourHead.operation"),
			prop: "operation",
		}
	];
	// classroom表头
	theadOfClassroom.value = [
		{
			name: t("appointment_list.classroomHead.classroom"),
			prop: "classroom",
		},
		{
			name: t("appointment_list.classroomHead.applicant"),
			prop: "applicant"
		},
		{
			name: t("appointment_list.classroomHead.date"),
			prop: "date",
		},
		{
			name: t("appointment_list.classroomHead.startTime"),
			prop: "startTime",
		},
		{
			name: t("appointment_list.classroomHead.endTime"),
			prop: "endTime",
		},
		{
			fixed: "right",
			name: t("appointment_list.classroomHead.state"),
			prop: "state",
			width: 120
		},
		{
			fixed: "right",
			name: t("appointment_list.classroomHead.operation"),
			prop: "operation",
			width: 160
		}
	];
}

setHead();

// 数据部分
const selectDate = ref("0");
const thead = ref(props.mode === "officeHour" ? theadOfOfficeHour.value : theadOfClassroom.value)
const ifOfficeHour = ref(false)
const ifClassroom = ref(false)
const mode = ref("officeHour")
const tableDisplay = ref("computer")
const page = computed({
	get: () => props.page,
	set: (newVal) => emit("update:page", newVal)
})
const pageSize = computed({
	get: () => props.pageSize,
	set: (newVal) => emit("update:pageSize", newVal)
})

watch(() => props.mode, (newVal) => {
	mode.value = newVal
	if (newVal === "officeHour")
		thead.value = theadOfOfficeHour.value
	else
		thead.value = theadOfClassroom.value
})

/*
 * 切换日期选择
 */
watch(selectDate, (newVal) => {
	emit('dateChange', newVal);
})
watch(props.userInfo, (newVal) => {
	const creditList = newVal.userAuthority.credit
	console.log(props.operationMode)
	console.log(creditList)
	if (props.operationMode === "view") {
		if (creditList.includes("OfficeHour:appointment")) {
			ifOfficeHour.value = true
		}
		const classroomList = [
			"classroom:appointment:104",
			"classroom:appointment:106",
			"classroom:appointment:202B",
		]
		if (classroomList.some(item => classroomList.includes(item))) {
			ifClassroom.value = true
		}
	} else {
		if (creditList.includes("OfficeHour:approve")) {
			ifOfficeHour.value = true
		}
		if (creditList.includes("classroom:approve")) {
			ifClassroom.value = true
		}
	}
})

// 语言改变时更新
watch(locale, () => {
	EventUtils.updateTranslations();
	setHead();
	thead.value = props.mode === "officeHour" ? theadOfOfficeHour.value : theadOfClassroom.value;
})

/*
 * 以下所有均为事件处理函数
 */


/**
 * 预约查看模式的切换
 */
const handleModeChange = () => {
	// 先进行一些值的改变
	if (mode.value === "officeHour") {
		thead.value = theadOfOfficeHour.value;
	} else {
		thead.value = theadOfClassroom.value;
	}

	// 再触发事件
	emit("modeChange", mode.value);
}

onMounted(() => {
	// 根据宽度检查表格的显示
	const isphone = window.matchMedia('(max-width: 1000px)')
	isphone.addEventListener("change", () => {
		if (isphone.matches) {
			tableDisplay.value = "phone"
		}
	})
	if (isphone.matches) {
		tableDisplay.value = "phone"
	}
	const isComputer = window.matchMedia('(min-width: 1000px)')
	isComputer.addEventListener("change", () => {
		if (isComputer.matches) {
			tableDisplay.value = "computer"
		}
	})
	if (isComputer.matches) {
		tableDisplay.value = "computer"
	}


})

</script>

<template>
	<div class="appointment-table-container">
		<el-radio-group class="date-picker" v-model="selectDate">
			<el-radio-button :label="t('appointment_list.datePicker.0')" value="0" />
			<el-radio-button :label="t('appointment_list.datePicker.1')" value="1" />
			<el-radio-button :label="t('appointment_list.datePicker.2')" value="2" />
			<el-radio-button :label="t('appointment_list.datePicker.3')" value="3" />
		</el-radio-group>
		<div class="appointment-table">
			<div class="icon-field">
				<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="21"
					height="21" viewBox="0 0 21 21" fill="none">
					<path fill-rule="evenodd" fill="#10239E"
						d="M1.16676 2.33331L0 2.33331L0 0L21 0L21 2.33331L19.8332 2.33331L14.0001 11.0834L14.0001 21L6.99993 21L6.99993 11.0834L1.16676 2.33331ZM9.33321 18.6664L9.33321 10.376L3.9712 2.333L17.0286 2.333L11.6666 10.376L11.6666 18.6664L9.33321 18.6664Z">
					</path>
				</svg>
				<state-icon :state="2" />
				<state-icon :state="3" />
				<state-icon :state="4" />
				<state-icon :state="5" />
			</div>
			<div class="button-field">
				<el-select class="mode-option" placeholder="请选择预约类型" v-model="mode" @change="handleModeChange">
          <el-option v-if="ifClassroom" value="教室预约" :label="t('appointment_list.modeButton.classroom')">{{
              $t("appointment_list.modeButton.classroom") }}
          </el-option>
          <el-option v-if="ifOfficeHour" value="officeHour"
						:label="t('appointment_list.modeButton.officehour')">{{
							$t('appointment_list.modeButton.officehour') }}
					</el-option>
				</el-select>
				<operate-button :operate-type="1" style="margin-left: auto;"
					@addEventClicked="() => { emit('addEventClicked') }" v-if="props.operationMode === 'view'" />
			</div>
			<!-- 根据屏幕大小进行条件渲染 -->
			<template v-if="tableDisplay == 'computer'">
				<el-table :data="props.data" :row-class-name="tableRowClassName"
					@row-click="(row, col, event) => { emit('rowClick', row, col, event) }">
					<el-table-column type="selection" />
					<el-table-column type="index" :label="t('appointment_list.no')" width="60" fixed />
					<el-table-column :fixed="item.fixed" v-for="item in thead" :prop="item.prop" :label="item.name"
						:width="item.width" sortable>
						<template #default="scope" v-if="item.prop === 'operation'">
							<operate-button :operate-type="scope.row.operation" :state="scope.row.state"
								:operateMode="props.operationMode" :event-id="scope.row.id" :mode="mode"
								:datetime="scope.row.originalDate"
								@edit-event-clicked="(eventId, operate) => { emit('editEventClicked', eventId, operate) }" />
						</template>
						<template #default="scope" v-else-if="item.prop === 'state'">
							<state-icon :state="scope.row.state" />
						</template>
					</el-table-column>
				</el-table>
				<!--分页部分-->
				<el-pagination class="pagination" v-model:current-page="page" v-model:page-size="pageSize" size="small"
					:page-sizes="[5, 10, 20, 50]" background layout="prev, pager, next,sizes"
					:total="props.totalLength" />
			</template>
			<template v-else-if="tableDisplay == 'phone'">
				<appointment-list-phone @row-click="(row, colum) => emit('rowClick', row, colum)"
					@edit-event-clicked="(eventId, operate) => emit('editEventClicked', eventId, operate)"
					:page-data="props.data" :mode="mode" :operate-mode="props.operationMode" :page-size="pageSize"
					:total-length="totalLength" v-model:page="page" />
			</template>
		</div>
	</div>

</template>

<style>
.el-table .odd {
	--el-table-tr-bg-color: #f0f5ff;
}

.appointment-table-container {
	margin-top: 10px;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

/**
日期选择器
 */
/* .date-picker{
  display: grid;
  position: relative;
  cursor: pointer;
  user-select: none;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
} */

/* .date-picker-option{
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
} */

.date-picker {
	width: 100%;
}

.option-box {
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
.appointment-table {
	margin-top: 20px;
	display: flex;
	flex-direction: column;
	width: 80%;
}

.icon-field {
	display: inline-flex;
	gap: 10px;
	margin-bottom: 10px;
	flex-wrap: wrap;
}

.button-field {
	width: 100%;
	display: inline-flex;
}

@media (min-width: 850px) {
	.button-field .mode-option {
		width: 20%;
	}
}

@media (max-width: 850px) {
	.button-field .mode-option {
		width: 50%;
	}
}

@media (min-width: 550px) {
	.date-picker {
		justify-content: center;
	}
}

@media (max-width: 550px) {
	.date-picker .el-radio-button span {
		width: 100%;
		border-left: var(--el-border);
		border-radius: var(--el-border-radius-base) !important;
	}

	.date-picker {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2%;
	}
}

.pagination {
	margin-top: 20px;
	align-self: center;
}
</style>
