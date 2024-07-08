<script setup>
import {ref, onMounted} from 'vue';
import { defineProps, defineEmits } from 'vue';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array
});

// 向父组件传递的事件
const emit = defineEmits(
    ['update:selectedClassroom']
);

// 组件内全局变量定义
const selectedClassroom = ref(null);

onMounted(function () {
  /**
   * 组件初始化
   */
  console.log("PickerClassroom组件开始挂载")
});

const handleChange = (item) => {
  /**
   * 选择器选项发生变化时触发
   * 向父组件传递选中教师变更信息
   */
  selectedClassroom.value = item;
  emit('update:selectedClassroom', item);
};
</script>

<template>
  <div class="selectors-container">
    <span
        v-for="(item, index) in props.selectors"
        :key="item.classroomId"
        @click="handleChange(item)"
        :class="['selector-item', { 'selected': selectedClassroom && selectedClassroom.classroomId === item.classroomId }]"
    >
      {{ item.classroom }} <span v-if="index < props.selectors.length - 1">/</span>
    </span>
  </div>
</template>

<style scoped>
.selectors-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
}

.selector-item {
  font-size: 24px;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  margin: 0 5px;
  position: relative;
}

.selector-item.selected {
  color: #10239E;
}

.selector-item.selected::after {
  content: '';
  display: block;
  height: 2px;
  background-color: #10239E;
  width: 100%;
  position: absolute;
  bottom: -2px;
  left: 0;
}
</style>
