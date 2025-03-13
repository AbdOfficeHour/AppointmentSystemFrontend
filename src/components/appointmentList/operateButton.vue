<script setup>
import { defineProps, defineEmits } from 'vue';
import eventUtil from "@/utils/eventUtil.js";

const props = defineProps(["operateType", "state", "operateMode", "eventId", "mode", "datetime"])
const emit = defineEmits(["addEventClicked", "editEventClicked"])


/**
 * 处理添加事件的情况
 */
const handleAddEvent = () => {
	emit("addEventClicked")
}

/**
 * 处理数据操作
 * @operate 1取消操作 2同意操作 3拒绝操作 4完成操作
 */
const handleEventOp = (operate) => {
	emit("editEventClicked", props.eventId, operate)
}

// 检查一下当前时间是否在事件时间之后



</script>

<template>
	<!-- operateType 为1的时候表示表头的操作按钮 为2的时候表示单项数据的操作按钮 -->
	<!--  添加按钮-->
	<div class="button-group" v-if="operateType === 1">
		<!-- <button class="view-button" @click="handleAddEvent">
      <span>+</span>
      <span>添加预约</span>
    </button> -->
		<el-button type="primary" @click="handleAddEvent">{{ $t("appointment_list.buttons.addAppointment")
		}}</el-button>
	</div>
	<!--  数据操作按钮-->
	<div v-else-if="operateType === 2">
		<template v-if="operateMode === 'view'">
			<!-- <button v-if="state === 2 || state === 3" class="view-button" @click="handleEventOp(1)">
        	<span>X</span>
        	<span>取消预约</span>
      	</button> -->
			<el-button v-if="(state === 2 || state === 3) && eventUtil.compareDate(props.datetime)" type="warning"
				@click="handleEventOp(1)">
				{{ $t("appointment_list.buttons.cancelAppointment") }}
			</el-button>
			<div v-else-if="(state === 2 || state === 3)">
				{{ $t("appointment_list.buttons.can_no_withdraw") }}
			</div>
			<div v-else>
				{{ $t("appointment_list.buttons.noOperate") }}
			</div>
		</template>
		<template v-else>
			<!-- <div class="button-group" v-if="state === 2">
        <button
            class="approve-button"
            style="color:#1d39c4"
            @click="handleEventOp(2)"
        >{{ $t("appointment_list.buttons.accept") }}</button>
        <button
            class="approve-button"
            style="color:white;background-color:#1d39c4"
            @click="handleEventOp(3)"
        >{{ $t("appointment_list.buttons.reject") }}</button>
      </div>
      <div class="button-group" v-else-if="state === 3">
        <button
            v-if="eventUtil.compareDate(props.datetime)"
            class="approve-button"
            style="color:#1d39c4"
            @click="handleEventOp(1)"
        >{{ $t("appointment_list.buttons.withdraw") }}</button>
        <button
            v-if="props.mode === 'officeHour'"
            class="approve-button"
            style="color:white;background-color:#1d39c4"
            @click="handleEventOp(4)"
        >{{ $t("appointment_list.buttons.complete") }}</button>
      </div> -->
			<div class="button-group table-item-button" v-if="state === 2">
				<el-button type="success" @click="handleEventOp(2)">{{ $t("appointment_list.buttons.accept")
				}}</el-button>
				<el-button type="danger" @click="handleEventOp(3)">{{ $t("appointment_list.buttons.reject")
				}}</el-button>
			</div>
			<div class="button-group table-item-button" v-else-if="state === 3">
				<el-button v-if="eventUtil.compareDate(props.datetime)" type="warning" @click="handleEventOp(1)">{{
					$t("appointment_list.buttons.withdraw") }}</el-button>
				<el-button v-if="props.mode === 'officeHour'" type="success" @click="handleEventOp(4)">{{
					$t("appointment_list.buttons.complete") }}</el-button>
				<div v-if="!eventUtil.compareDate(props.datetime) && props.mode != 'officeHour'">{{
					$t("appointment_list.buttons.can_no_withdraw") }}
				</div>
			</div>
			<div v-else>
				{{ $t("appointment_list.buttons.noOperate") }}
			</div>
		</template>
	</div>
</template>

<style scoped>
.button-group {
	display: inline-flex;
	gap: 10px;
}

.table-item-button {
	width: 100%;
}

.table-item-button button {
	width: 45%;
}

.view-button {
	background-color: white;
	color: #1d39c4;
	border: #1d39c4 solid 1px;
	border-radius: 5px;

	display: grid;
	grid-template-columns: 1fr 3fr;
}

.view-button span {
	text-align: center;
	line-height: 200%;
}

.view-button span:first-child {
	color: #ff5733
}

.view-button:active {
	background-color: #4eaacb;
}

.approve-button {
	background-color: white;
	border: #1d39c4 solid 1px;
	border-radius: 5px;
	padding-left: 10px;
	padding-right: 10px;
}

.approve-button:active {
	background-color: #4eaacb;
}
</style>