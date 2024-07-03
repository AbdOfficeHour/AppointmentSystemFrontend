<script setup>
import {ref, defineEmits, onMounted} from 'vue';

// 组件全局变量定义
const selectedTab = ref('tutor'); // 被选中的预约平台，初始化为教师预约平台

// 向父组件传递的事件
const emit = defineEmits(
    ['update:selectedTab']
);

onMounted(function () {
  /**
   * 组件初始化
   */
  console.log("TabSelector组件开始挂载")
})

const selectTab = (tab) => {
  /**
   * 选择器发生变更时触发的函数，@click点击触发
   */
  console.log("子组件顶栏Tab选择器发生变更")
  selectedTab.value = tab;
  emit('update:selectedTab', tab); // 触发父组件事件，传递selectedTab
};
</script>


<template>
  <div class="tab-selector">
    <div :class="['tab', { active: selectedTab === 'room' }]" @click="selectTab('room')">
      教室预约 Room
    </div>
    <div :class="['tab', { active: selectedTab === 'tutor' }]" @click="selectTab('tutor')">
      Tutor 教师预约
    </div>
  </div>
</template>


<style scoped>
.tab-selector {
  display: flex;
  border-radius: 15px;
  overflow: hidden;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: grey;
  transition: background-color 0.3s, color 0.3s;
}
.tab.active {
  background-color: #e0f0ff;
  color: #0044cc;
}
.tab:not(.active):hover {
  background-color: #e0e0e0;
}
</style>