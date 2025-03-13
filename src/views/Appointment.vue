<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/eventUtil.js'
import Officehour from "@/components/appointmentForm/officehour.vue";
import Classroom from "@/components/appointmentForm/classroom.vue";
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import router from "@/router/index.js";
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();

const route = useRoute()

const loading = ref(false)
const dialogTableVisible = ref(false)
const data = ref([])
const dataLength = ref(0)
const page = ref(1)
const pageSize = ref(localStorage.getItem("appointmentPageSize") ? parseInt(localStorage.getItem("appointmentPageSize")) : 5)
const tableDisplay = ref("computer")
const mode = ref("officeHour")
const modeChange = ref(false)
const month = ref(0)
const formatData = computed(() => {
	if (mode.value === "officeHour")
		return EventUtil.getOfficeHourFormatData(data.value)
	else
		return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = reactive({
	data: {}
})
const showOfficeHourAppoint = ref(false)
const showClassroomAppoint = ref(false)
const userInfo = reactive({
	"phone": "",
	"userAuthority": {},
	"email": "",
	"username": ""
})
const withdrawVisible = ref(false);
const withdrawReason = ref("");
let currentEventId = 0;


/*
请求部分
 */

/**
 * 获取列表数据
 */
const fetchListData = () => {
	const selectMode = mode.value === 'officeHour' ? "officehour" : "classroom"
	let listUrl = `/Appointment/list/${selectMode}`
	let lengthUrl = `/Appointment/length/${selectMode}`

	loading.value = true
	axios.get(lengthUrl, {
		params: {
			time: month.value
		}
	})
		.then(res => {
			if (res.status === 200)
				dataLength.value = res.data.data
			else
				ElMessage.error(t("appointment_list.hitDialog.data_get_error"));
			return axios.get(listUrl, {
				params: {
					time: month.value,
					page: page.value,
					pageSize: pageSize.value
				}
			})
		})
		.then(res => {
			if (res.status === 200) {
				if (tableDisplay.value != "phone") {
					data.value = res.data.data;
				} else {
					if (!modeChange.value) {
						data.value.push(...res.data.data);
					} else {
						data.value = res.data.data;
						modeChange.value = false;
					}
				}
			} else
				ElMessage.error(t("appointment_list.hitDialog.data_get_error"));
			loading.value = false
		})

}

const fetchUserInfo = () => {
	loading.value = true
	axios.get("/User/info")
		.then(res => {
			if (res.status === 200) {
				userInfo.email = res.data.data.email
				userInfo.userAuthority = res.data.data.userAuthority
				userInfo.phone = res.data.data.phone
				userInfo.username = res.data.data.username
			}
			getDefaultMode()
			fetchListData()
			loading.value = false
		})
}

/**
 * 用于获取默认的模式
 * 只有在完成用户信息的获取时才会被调用
 */
const getDefaultMode = () => {
	const creditList = userInfo.userAuthority.credit
	const classroomList = [
		"classroom:appointment:104",
		"classroom:appointment:106",
		"classroom:appointment:202B",
	]
	if (creditList.includes("OfficeHour:appointment") && classroomList.some(item => classroomList.includes(item))) {

		if (!localStorage.getItem("mode")) {
			mode.value = "officeHour"
			localStorage.setItem("mode", mode.value)
		} else {
			mode.value = localStorage.getItem("mode")
		}
	}
	else if (classroomList.some(item => classroomList.includes(item))) {
		mode.value = "教室预约"
	}
	else if (creditList.includes("OfficeHour:appointment")) {
		mode.value = "officeHour"
	} else {
		//无权限的情况
		ElMessageBox.confirm(t("appointment_list.hitDialog.no_appointment_auth"), t("appointment_list.hitDialog.hit"), {
			confirmButtonText: t("appointment_list.hitDialog.confirm"),
			showCancelButton: false,
			callback: () => {
				router.push("/index/classroom")
			}
		})
	}
}


/*
事件处理函数
 */
/**
 * 处理筛选日期的变化
 */
const handleDateChange = (newVal) => {
	month.value = newVal
	modeChange.value = true
	fetchListData()
}

/**
 * 处理模式的变化
 *
 */
const handleModeChange = (newMode) => {
	mode.value = newMode;
	localStorage.setItem("mode", mode.value);
	modeChange.value = true;
	if (tableDisplay.value == "phone") {
		if (page.value > 1) page.value = 1;
		else fetchListData();
	}
	else
		fetchListData();
}

/**
 * 处理详细信息的展示
 */
const handleRowClick = (row, colum) => {
	if (colum.property === "operation") return

	detailMessage.data = data.value[row.originIndex] // todo 记得改变量
	dialogTableVisible.value = true
}

const handleWithdraw = () => {
	const selectMode = mode.value === "officeHour" ? "officehour" : "classroom";
	if (withdrawReason.value === "") {
		ElMessage.error(t("appointment_list.hitDialog.withdrawl_no_blank"));
		return
	}
	// 撤回预约的情况
	axios.put(`/Appointment/list/${selectMode}/${currentEventId}`, {
		state: 6,
		withdraw_reason: withdrawReason.value
	})
		.then(res => {
			if (res.status === 200 && res.data.code === 0) {
				ElMessage.success(t("appointment_list.hitDialog.cancel_success"))
				window.location.reload()
				withdrawVisible.value = false;
			} else {
				ElMessage.error(t("appointment_list.hitDialog.request_fail"))
				withdrawVisible.value = false;
			}
		})
}

const handleDataOperation = (eventId, operate) => {
	let modeUrl
	if (mode.value === "officeHour")
		modeUrl = "officehour"
	else
		modeUrl = "classroom"

	if (operate === 1) {
		// 撤回预约的情况
		currentEventId = eventId;
		withdrawVisible.value = true;
	}
}

/**
 * 处理发起预约的点击
 */
const handleAddButtonClick = () => {
	if (mode.value === "officeHour") {
		console.log("点击")
		showOfficeHourAppoint.value = true
	}
	else {
		console.log("点击")
		showClassroomAppoint.value = true
	}
}


if (route.query.type == "officeHour") {
	handleModeChange("officeHour")
} else if (route.query.type == "classroom") {
	handleModeChange("教室预约")
}

if (route.query.if_appointment === "true") {
	if (mode.value === 'officeHour') showOfficeHourAppoint.value = true
	else showClassroomAppoint.value = true

	// 修改 if_appointment 为 false 并删除 type，避免界面刷新导致的重复加载表单
	const { type, ...newQuery } = route.query;
	newQuery.if_appointment = 'false';
	router.push({ name: route.name, query: newQuery });
}

watch(page, () => {
	fetchListData();
});

watch(pageSize, () => {
	if (tableDisplay.value != "phone") {
		localStorage.setItem("appointmentPageSize", pageSize.value);
	}
	if (tableDisplay.value != "phone" || data.value.length > 0)
		fetchListData();
})

watch(tableDisplay, (newVal) => {
	if (newVal == "phone") {
		pageSize.value = 10
	} else {
		pageSize.value = localStorage.getItem("appointmentPageSize");
	}
})

onMounted(() => {
	fetchUserInfo();
	if (tableDisplay.value != "phone") {
		localStorage.setItem("appointmentPageSize", pageSize.value);
	}

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
	<div class="main-container" v-loading="loading">
		<div class="main-title">
			<h1>{{ $t("appointment_list.title.myappointment") }}</h1>
		</div>
		<appointment-table :mode="mode" operation-mode="view" :data="formatData" :user-info="userInfo"
			:total-length="dataLength" @date-change="handleDateChange" @mode-change="handleModeChange"
			@row-click="handleRowClick" @add-event-clicked="handleAddButtonClick"
			@edit-event-clicked="handleDataOperation" v-model:page="page" v-model:pageSize="pageSize" />
		<!--    详细信息展示-->
		<el-dialog class="dialog-width" v-model="dialogTableVisible"
			:title="$t('appointment_list.dialog.detailMessage')">
			<appointment-detail :data="detailMessage.data" />
		</el-dialog>
		<!--    officeHour发起预约-->
		<officehour :if-visible="showOfficeHourAppoint" @close-dialog="showOfficeHourAppoint = false"
			:userInfo="userInfo" />
		<!--    classroom发起预约-->
		<classroom :if-visible="showClassroomAppoint" @close-dialog="showClassroomAppoint = false"
			:userInfo="userInfo" />
		<!-- 撤回原因表单 -->
		<el-dialog class="dialog-width" v-model="withdrawVisible"
			:title="$t('appointment_list.dialog.withdraw_reason')">
			<label>{{ $t('appointment_list.dialog.withdraw_reason_message') }}</label>
			<el-input type="textarea" v-model="withdrawReason" />
			<template #footer>
				<el-button type="primary" @click="handleWithdraw">{{ $t('appointment_list.dialog.confirm')
				}}</el-button>
				<el-button @click="withdrawVisible = false">{{ $t('appointment_list.dialog.cancel') }}</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<style scoped>
.main-container {
	width: 100%;
	min-height: 1200px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.main-title h1 {
	font-size: 50px;
	font-weight: 600;
}

.main-title {
	margin-top: 20px;
	margin-bottom: 20px;
}

@media (max-width: 850px) {
	.main-title h1 {
		font-size: 30px;
	}

	.main-title {
		margin-top: 10px;
		margin-bottom: 10px;
	}

	:deep(.dialog-width) {
		width: 80vw !important;
	}
}
</style>