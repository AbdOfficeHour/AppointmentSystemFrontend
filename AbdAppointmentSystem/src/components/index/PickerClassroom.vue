<script setup>
import {ref, reactive, onMounted} from 'vue';
import { defineProps, defineEmits } from 'vue';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array
});

// 向父组件传递的事件
const emit = defineEmits(['update:selectedClassroom']);

onMounted(function () {
  /**
   * 组件初始化
   */
  console.log("PickerClassroom组件开始挂载");
});

const handleChange = (item) => {
  /**
   * 选择器选项发生变化时触发
   * 向父组件传递选中教师变更信息
   */
  emit('update:selectedClassroom', item);
};
</script>

<template>
  <div class="selectors-container">
    <button
        v-for="item in props.selectors"
        :key="item.classroomId"
        @click="handleChange(item)"
        class="selector-button"
    >
      {{ item.classroom }}
    </button>
  </div>
</template>

<style scoped>
.selectors-container {
  display: flex;
  justify-content: space-around;
}

.selector-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.selector-button:hover {
  background-color: #e0e0e0;
}
</style>
