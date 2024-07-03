<script setup>
import {defineEmits, defineProps} from "vue";
import {onMounted, ref} from "vue";

// 组件内全局变量定义
let selectDate = ref(null) // 被选中的日期
let startTime = ref(null) // 被选中的开始时间
let endTime = ref(null) // 被选中的结束时间
let timeSlots = ref([]) //

// 接收父组件传递的props
const props = defineProps({
  isDialogVisible: Boolean,
  backendData: Array
});

// 向父组件传递的事件
const emit = defineEmits(
    [
        'close',
        'submit'
    ]
)

function closeDisableComponents() {
  emit('close');
}

function submitDisableInfo() {
  emit('submit');
}
</script>

<template>
  <div v-if="isDialogVisible" class="disable-overlay">
    <div class="disable-components">
      <h3>禁用时间段 Disable Time</h3>
      <button @click="closeDisableComponents" >Close</button>
      <button @click="submitDisableInfo">Submit</button>
    </div>
  </div>
</template>

<style scoped>
.disable-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 确保弹框在最上方 */
}

.disable-components {
  background: white;
  padding: 20px;
  border-radius: 5px;
  text-align: center;
}

button {
  margin-top: 10px;
  margin-right: 10px;
}
</style>
