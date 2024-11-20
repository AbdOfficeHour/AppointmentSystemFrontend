<script setup>
import { onMounted, ref } from 'vue';
import {TimeFormat} from "@/utils/index/format.js";

const props = defineProps({
  dialogVisible: Boolean,
  conflictInfo: Object, // Assume conflictInfo contains conflict_period array
});

const emits = defineEmits(['closeDialog']);

const closeDialog = () => {
  props.dialogVisible = false;
  emits('closeDialog');
};
</script>

<template>
  <el-dialog
      v-model="props.dialogVisible"
      title="Conflict Warning"
      width="500"
      draggable
      @close="emits('closeDialog')"
      @closed="emits('closeDialog')"
  >
    <div>
      <p>禁用的时间段内，如下时间段已有预约事件</p>
      <el-table
          :data="props.conflictInfo.conflict_period"
          border
          style="width: 100%; margin-top: 10px"
      >
        <el-table-column prop="date" label="Date" width="100">
          <template #default="scope">
            <span>{{ new Date(scope.row.date).toLocaleDateString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="Start Time" width="120">
          <template #default="scope">
            <span>{{ TimeFormat.formatTimestamp(scope.row.startTime, true) }} </span>
            <span>{{ TimeFormat.formatTimestamp(scope.row.startTime, false) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="End Time" width="120">
          <template #default="scope">
            <span>{{ TimeFormat.formatTimestamp(scope.row.endTime, true) }} </span>
            <span>{{ TimeFormat.formatTimestamp(scope.row.endTime, false) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="closeDialog">Confirm</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
p {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}
.dialog-footer {
  text-align: right;
}
</style>
