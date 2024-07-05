<script setup>
import {ref, onMounted} from 'vue';
import { defineProps, defineEmits } from 'vue';

// 组件内全局变量定义
const selectedClassroom = ref(null);

// 接收父组件传递的props
const props = defineProps({
  selectors: Array
});

// 向父组件传递的事件
const emit = defineEmits(
    ['update:selectedClassroom']
);

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
  font-size: 24px;  /* 字号 */
  font-weight: 700; /* 字重 */
  color: #666;      /* 默认字体颜色 */
  cursor: pointer;
  margin: 0 5px;    /* 每个选项之间的间距 */
  padding-bottom: 0px; /* 下划线与文字之间的间距 */
  position: relative; /* 相对定位用于下划线 */
}

.selector-item.selected {
  color: #10239E; /* 选中项的颜色 */
}

.selector-item.selected::after {
  content: '';
  display: block;
  height: 2px;  /* 下划线的高度 */
  background-color: #10239E;  /* 下划线的颜色 */
  width: 100%;
  position: absolute;
  bottom: -2px;  /* 下划线的位置，调整为距离文字更远 */
  left: 0;
}


</style>
