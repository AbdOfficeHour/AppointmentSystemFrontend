<script setup>
import { ref, defineEmits, onMounted } from 'vue';
import { RouterLink } from 'vue-router';

// 组件全局变量定义
const selectedTab = ref('room'); // 被选中的预约平台，默认为教室预约平台

onMounted(function () {
  /**
   * 组件初始化
   */
  console.log("TabSelector组件开始挂载")
});

const selectTab = (tab) => {
  /**
   * 选择器发生变更时触发的函数，@click点击触发
   */
  selectedTab.value = tab;
};
</script>

<template>
  <div class="tab-selector">
    <RouterLink to="/index/classroom" class="tab" :class="{ active: selectedTab === 'room' }" @click="selectTab('room')">
      教室预约 Room
    </RouterLink>
    <RouterLink to="/index/officehour" class="tab" :class="{ active: selectedTab === 'tutor' }" @click="selectTab('tutor')">
      教师预约 Tutor
    </RouterLink>
    <RouterLink to="/list?if_appointment=false" class="tab" :class="{ active: selectedTab === 'appointment' }" @click="selectTab('appointment')">
      我的预约 MyAppointment
    </RouterLink>
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
