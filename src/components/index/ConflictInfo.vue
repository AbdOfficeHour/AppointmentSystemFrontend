<script setup>
import { TimeFormat } from "@/utils/index/format.js";

const props = defineProps({
  dialogVisible: Boolean,
  conflictInfo: Array, // conflictInfo contains conflict_period array
});

const emits = defineEmits(['closeDialog']);

const closeDialog = () => {
  props.dialogVisible = false;
  emits('closeDialog');
};

// Format the time range for display using TimeFormat
const formatConflictTime = (conflict) => {
  const date = TimeFormat.formatTimestamp(conflict.date, true); // Format as YYYY-MM-DD
  const start = TimeFormat.formatTimestamp(conflict.startTime); // Format as HH:mm
  const end = TimeFormat.formatTimestamp(conflict.endTime); // Format as HH:mm
  return `${date} ${start} - ${end}`;
};
</script>

<template>
  <el-dialog
      v-model="props.dialogVisible"
      title="禁用时段与预约事件冲突"
      width="500"
      draggable
      @close="emits('closeDialog')"
      @closed="emits('closeDialog')"
  >
    <div>
      <p>在上传禁用的时间段内，如下时间段已有预约事件/禁用事件，无法禁用</p>
      <ul>
        <li v-for="(conflict, index) in props.conflictInfo" :key="index">
          {{ formatConflictTime(conflict) }}
        </li>
      </ul>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="closeDialog">确认</el-button>
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
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
li {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
.dialog-footer {
  text-align: right;
}
</style>
