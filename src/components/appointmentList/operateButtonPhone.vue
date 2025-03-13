<script setup>
import { defineEmits, defineProps } from 'vue';
import eventUtil from '@/utils/eventUtil.js';

const props = defineProps(["operateMode", "state", "datetime", "mode", "eventId"]);
const emit = defineEmits(["editEventClicked"]);

function handleEventOp(operate) {
    emit("editEventClicked", props.eventId, operate);
}


</script>

<template>
    <div class="phone-list-buttons">
        <template v-if="operateMode === 'view'">
            <template v-if="(state === 2 || state === 3) && eventUtil.compareDate(props.datetime)">
                <el-button type="warning" @click="handleEventOp(1)">
                    {{ $t("appointment_list.buttons.cancelAppointment") }}
                </el-button>
            </template>
            <template v-else-if="(state === 2 || state === 3)">
                <el-button disabled>{{ $t("appointment_list.buttons.can_no_withdraw") }}</el-button>
            </template>
            <template v-else>
                <el-button disabled>{{ $t("appointment_list.buttons.noOperate") }}</el-button>
            </template>
        </template>
        <template v-else>
            <template class="button-group" v-if="state === 2">
                <el-button type="success" @click="handleEventOp(2)">{{ $t("appointment_list.buttons.accept")
                }}</el-button>
                <el-button type="danger" @click="handleEventOp(3)">{{ $t("appointment_list.buttons.reject")
                }}</el-button>
            </template>
            <template class="button-group" v-else-if="state === 3">
                <el-button v-if="eventUtil.compareDate(props.datetime)" type="warning" @click="handleEventOp(1)">{{
                    $t("appointment_list.buttons.withdraw") }}</el-button>
                <el-button v-if="props.mode === 'officeHour'" type="success" @click="handleEventOp(4)">{{
                    $t("appointment_list.buttons.complete") }}</el-button>
                <el-button v-if="!props.mode === 'officeHour' && !eventUtil.compareDate(props.datetime)" disabled>{{
                    $t("appointment_list.buttons.can_no_withdraw") }}</el-button>
            </template>
        </template>
    </div>
</template>


<style>
.phone-list-buttons {
    display: flex;
}

.phone-list-buttons button {
    height: 100% !important;
    margin: 0 !important;
}
</style>