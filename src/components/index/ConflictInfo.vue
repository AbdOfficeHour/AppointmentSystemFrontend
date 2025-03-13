<script setup>
import { useI18n } from "vue-i18n";
import { TimeFormat } from "@/utils/dataFormat.js";

// 接收父组件传递的props
const props = defineProps({
  dialogVisible: Boolean,
  conflictInfo: Array,
  // conflictInfo 是一个由对象组成的数组
  // 每个对象包含 date, startTime, endTime, type 属性
});

// 向父组件传递的事件
const emits = defineEmits(['closeDialog']);

const { t } = useI18n() // 获取国际化翻译函数

/**
 * @description 关闭ConflictInfo对话框
 * @returns {void}
 */
const closeDialog = () => {
  props.dialogVisible = false;
  emits('closeDialog');
};

/**
 * @description 格式化冲突时间
 * @param conflict - 冲突信息，为一个对象，包含 date, startTime, endTime, type 属性
 * @returns {`${string} ${string} - ${string}`}
 */
const formatConflictTime = (conflict) => {
  const date = TimeFormat.formatTimestamp(conflict.date, true); // 格式化为 YYYY-MM-DD
  const start = TimeFormat.formatTimestamp(conflict.startTime); // 格式化为 HH:mm
  const end = TimeFormat.formatTimestamp(conflict.endTime); // 格式化为 HH:mm
  return `${date} ${start} - ${end}`;
};

/**
 * @description 格式化冲突原因
 * @param conflict - 冲突信息，为一个对象，包含 date, startTime, endTime, type 属性
 * @returns {*} 为触发国际化翻译t函数的字符串
 */
const formatConflictReason = (conflict) => {
  const match_table = {
    1: "index.conflict_reason_1",
    2: "index.conflict_reason_2",
    3: "index.conflict_reason_3",
    0: "index.conflict_reason_4",
    5: "index.conflict_reason_5"
  }
  if ("type" in conflict) {
    return match_table[conflict.type]
  } else {
    return match_table[5]
  }
}
</script>

<template>
  <el-dialog
      v-model="props.dialogVisible"
      :title="t('index.ban_time_conflict')"
      width="500"
      draggable
      @close="emits('closeDialog')"
      @closed="emits('closeDialog')"
  >
    <div>
      <p>{{ t("index.conflict_description") }}</p>
      <ul>
        <li v-for="(conflict, index) in props.conflictInfo" :key="index">
          <div>{{ index + 1 }}. {{ formatConflictTime(conflict) }}</div>
          <div>{{ t("index.conflict_reason") }} {{ t(formatConflictReason(conflict)) }}</div>
        </li>
      </ul>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="closeDialog">{{ t("index.OK") }}</el-button>
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
