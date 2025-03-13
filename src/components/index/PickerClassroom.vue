<script setup>
import { ref, watch, reactive, onUpdated, onMounted, nextTick } from 'vue';

// 接收父组件传递的props
const props = defineProps({
  selectors: Array, // Classroom选择器列表信息
});

// 向父组件传递的事件
const emit = defineEmits(
    [
    'update:selectedClassroom', // 选中教室后，触发的变更事件
    'loading-done'
  ]
);

const localSelectors = reactive(JSON.parse(JSON.stringify(props.selectors))) // 本地状态，深拷贝props避免直接修改props
const selectedClassroom = ref(null); // 选中的教室

/**
 * @description 选择器选项发生变化时触发
 * 向父组件传递选中教师变更信息
 * @param item - 选中的教室
 */
const handleChange = (item) => {
  selectedClassroom.value = item;
  emit('update:selectedClassroom', item);
};

// 监听props的变化，并同步更新localSelectors
watch(() => props.selectors, (newSelectors) => {
  Object.assign(localSelectors, JSON.parse(JSON.stringify(newSelectors)));
}, { deep: true });

// Mounted生命周期钩子，用于通知父组件加载完成
onMounted(() => {
  nextTick(() => {
    emit("loading-done")
  })
})

// Updated生命周期钩子，用于通知父组件加载完成
onUpdated(() => {
  nextTick(() => {
    emit("loading-done")
  })
})
</script>

<template>
  <div class="selectors-container">
    <span
        v-for="(item, index) in localSelectors"
        :key="item.classroomId"
        @click="handleChange(item)"
        :class="['selector-item', { 'selected': selectedClassroom && selectedClassroom.classroomId === item.classroomId }]"
    >
      {{ item.classroom }}
      <span v-if="index < localSelectors.length - 1">/</span>
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
