<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';

// TabSelector组件全局变量定义
const selectedTab = ref('room'); // 被选中的预约平台，默认为教室预约平台
const route = useRoute(); // 获取当前路由

/**
 * 根据路径更新选中的Tab
 */
const updateSelectedTab = (path) => {
  if (path.includes('/index/classroom')) {
    selectedTab.value = 'room';
  }
  else if (path.includes('/index/officehour')) {
    selectedTab.value = 'tutor';
  }
  else if (path.includes('/list')) {
    selectedTab.value = 'appointment';
  }
};

/**
 * TabSelector组件初始化
 */
onMounted(function () {
  console.log("TabSelector组件开始挂载")
  updateSelectedTab(route.path); // 初次加载时更新选中的Tab
});

/**
 * 监听路由变化并更新选中的Tab
 */
watch(route, (newRoute) => {
  updateSelectedTab(newRoute.path);
});

/**
 * 选择器发生变更时触发的函数，点击触发
 */
const selectTab = (tab) => {
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
  font-size: 25px;
  font-weight: 700;
}
.tab.active {
  background-color: #E3ECFF;
  color: #10239E;
  font-size: 25px;
  font-weight: 700;
}
.tab:not(.active):hover {
  background-color: #101010;
  color: #E3ECFF;
  font-size: 25px;
  font-weight: 700;
}
</style>
