<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import appointmentTable from '@/components/appointmentList/appointmentTable.vue'
import appointmentDetail from '@/components/appointmentList/appointmentDetail.vue'
import EventUtil from '@/utils/eventUtil.js'
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter()

const loading = ref(false)
const dialogTableVisible = ref(false)
const workSummaryVisible = ref(false)
const refuseReasonVisible = ref(false)
const withdrawVisible = ref(false)
const data = ref([])
const dataLength = ref(0)
const page = ref(1)
const pageSize = ref(localStorage.getItem("appointmentPageSize") ? parseInt(localStorage.getItem("appointmentPageSize")) : 5)
const modeChange = ref(false)
const mode = ref("officeHour")
const month = ref(0)
const tableDisplay = ref("computer")
const formatData = computed(() => {
	if (mode.value === "officeHour")
		return EventUtil.getOfficeHourFormatData(data.value)
	else
		return EventUtil.getClassroomFormatData(data.value)
})
const detailMessage = ref({})
const userInfo = reactive({
	"phone": "",
	"userAuthority": {},
	"email": "",
	"username": ""
})
const refuseResult = ref("")
const workSummary = ref("")
const withdrawReason = ref("")


/**
 * 用于获取默认的模式
 * 只有在完成用户信息的获取时才会被调用
 */
const getDefaultMode = () => {
	const creditList = userInfo.userAuthority.credit
	if (creditList.includes("OfficeHour:approve") && creditList.includes("classroom:approve")) {

		if (!localStorage.getItem("mode")) {
			mode.value = "officeHour"
			localStorage.setItem("mode", mode.value)
		} else {
			mode.value = localStorage.getItem("mode")
		}
	}
	else if (creditList.includes("classroom:approve")) {
		mode.value = "教室预约"
	}
	else if (creditList.includes("OfficeHour:approve")) {
		mode.value = "officeHour"
	} else {
		//无权限的情况
		ElMessageBox.confirm(t("appointment_list.hitDialog.no_approve_auth"), t("appointment_list.hitDialog.hit"), {
			confirmButtonText: t("appointment_list.hitDialog.confirm"),
			showCancelButton: false,
			callback: () => {
				router.push("/index/classroom")
			}
		})
	}
}

const fetchListData = () => {
	const selectMode = mode.value === 'officeHour' ? "officehour" : "classroom"
	let listUrl = `/Appointment/approve/${selectMode}`
	let lengthUrl = `/Appointment/length/${selectMode}/approve`

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
 */
const handleModeChange = (newMode) => {
	mode.value = newMode
	localStorage.setItem("mode", mode.value)
	modeChange.value = true
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

	detailMessage.value = data.value[row.originIndex] // todo 记得改变量
	dialogTableVisible.value = true
}


let currentEventId = null;
/**
 * 处理填写工作总结
 */
const handleWorkSummary = () => {
	if (!currentEventId) return
	let selectMode
	if (mode.value === "officeHour")
		selectMode = "officehour"
	else
		selectMode = "classroom"
	if (workSummary.value === "") {
		ElMessage.error(t("appointment_list.hitDialog.work_summary_no_blank"))
		return
	}

	axios.put(`/Appointment/list/${selectMode}/${currentEventId}`,
		{
			state: 5,
			work_summary: workSummary.value
		}
	)
		.then(res => {
			if (res.status === 200 && res.data.code === 0) {
				ElMessage.success(t("appointment_list.hitDialog.request_success"))
				window.location.reload()
			}
			else if (res.status === 200 && res.data.code === 103) {
				ElMessage.warning(t("appointment_list.hitDialog.cannot_complete"))
			}
			else {
				ElMessage.error(t("appointment_list.hitDialog.request_fail"))
			}
		})
}

/**
 * 处理填写拒绝原因
 */
const handleRefuse = () => {
	if (!currentEventId) return
	let selectMode
	if (mode.value === "officeHour")
		selectMode = "officehour"
	else
		selectMode = "classroom"
	if (refuseResult.value === "") {
		ElMessage.error(t("appointment_list.hitDialog.refuse_no_blank"))
		return
	}

	axios.put(`/Appointment/list/${selectMode}/${currentEventId}`,
		{
			state: 4,
			refuse_reason: refuseResult.value
		}
	)
		.then(res => {

			if (res.status === 200 && res.data.code === 0) {
				ElMessage.success(t("appointment_list.hitDialog.request_success"))
				window.location.reload()
			} else {

				ElMessage.error(t("appointment_list.hitDialog.request_fail"))
			}
		})
}

const handleWithdraw = () => {
	const selectMode = mode.value === "officeHour" ? "officehour" : "classroom";
	if (withdrawReason.value === "") {
		ElMessage.error(t("appointment_list.hitDialog.withdrawl_no_blank"))
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
	let selectMode
	if (mode.value === "officeHour")
		selectMode = "officehour"
	else
		selectMode = "classroom"

	if (operate === 1) {
		currentEventId = eventId;
		withdrawVisible.value = true;
	} else if (operate === 2) {
		// 同意预约的情况
		ElMessageBox.confirm(t("appointment_list.hitDialog.confirm_accept"), t("appointment_list.hitDialog.hit"), {
			confirmButtonText: t("appointment_list.hitDialog.confirm"),
			cancelButtonText: t("appointment_list.hitDialog.cancel")
		})
			.then(async () => axios.put(`/Appointment/list/${selectMode}/${eventId}`, { state: 3 }))
			.then(res => {
				if (res.status === 200 && res.data.code === 0) {
					ElMessage.success(t("appointment_list.hitDialog.accept_success"))
					window.location.reload()
				} else {
					ElMessage.error(t("appointment_list.hitDialog.request_fail"))
				}
			})
	} else if (operate === 3) {
		// 拒绝预约的情况
		currentEventId = eventId
		refuseReasonVisible.value = true;
	} else if (operate === 4) {
		// 完成预约的情况
		currentEventId = eventId
		if (mode.value === "officeHour")
			workSummaryVisible.value = true
	}
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
	fetchUserInfo()
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
			<h1>{{ $t("appointment_list.title.myapprove") }}</h1>
		</div>
		<appointment-table :mode="mode" operation-mode="approve" :data="formatData" :user-info="userInfo"
			:total-length="dataLength" @date-change="handleDateChange" @mode-change="handleModeChange"
			@row-click="handleRowClick" @add-event-clicked="" @edit-event-clicked="handleDataOperation"
			v-model:page="page" v-model:pageSize="pageSize" />
		<!--    详细信息展示-->
		<el-dialog class="dialog-width" v-model="dialogTableVisible"
			:title="$t('appointment_list.dialog.detailMessage')">
			<appointment-detail :data="detailMessage" />
		</el-dialog>
		<!--    工作总结-->
		<el-dialog class="dialog-width" v-model="workSummaryVisible"
			:title="$t('appointment_list.dialog.work_summary')">
			<label>{{ $t("appointment_list.dialog.work_summary_message") }}</label>
			<el-input type="textarea" v-model="workSummary" />
			<template #footer>
				<el-button type="primary" @click="handleWorkSummary">{{ $t("appointment_list.dialog.confirm")
				}}</el-button>
				<el-button @click="workSummaryVisible = false">{{ $t("appointment_list.dialog.cancel") }}</el-button>
			</template>
		</el-dialog>
		<!--    拒绝原因-->
		<el-dialog class="dialog-width" v-model="refuseReasonVisible"
			:title="$t('appointment_list.dialog.refuse_reason')">
			<label>{{ $t('appointment_list.dialog.refuse_reason_message') }}</label>
			<el-input type="textarea" v-model="refuseResult" />
			<template #footer>
				<el-button type="primary" @click="handleRefuse">{{ $t("appointment_list.dialog.confirm") }}</el-button>
				<el-button @click="refuseReasonVisible = false">{{ $t("appointment_list.dialog.cancel") }}</el-button>
			</template>
		</el-dialog>
		<el-dialog class="dialog-width" v-model="withdrawVisible"
			:title="$t('appointment_list.dialog.withdraw_reason')">
			<label>{{ $t('appointment_list.dialog.withdraw_reason_message') }}</label>
			<el-input type="textarea" v-model="withdrawReason" />
			<template #footer>
				<el-button type="primary" @click="handleWithdraw">{{ $t("appointment_list.dialog.confirm")
				}}</el-button>
				<el-button @click="withdrawVisible = false">{{ $t("appointment_list.dialog.cancel") }}</el-button>
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
	font-size: 40px;
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