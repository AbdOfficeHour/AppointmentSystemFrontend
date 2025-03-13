<script setup>
import { ref, onMounted, watch, onUpdated } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from "vue-i18n";

const selectedTab = ref('room'); // 被选中的预约平台，默认为教室预约平台
const route = useRoute(); // 获取当前路由
const { t } = useI18n();

/**
 * 更新当前选中的Tab项目
 * @param path - 当前路由路径
 */
const updateSelectedTab = (path) => {
  if (path.includes('/index/classroom')) {
    selectedTab.value = 'room'; // 教室预约首页
  }
  else if (path.includes('/index/officehour')) {
    selectedTab.value = 'tutor'; // 教师预约首页
  }
  else if (path.includes('/list')) {
    selectedTab.value = 'appointment'; // 预约列表(我的预约)
  }
};

/**
 * @description 选择器发生变更时触发的函数，点击触发
 * @param tab - 当前点击的Tab项目索引
 */
const selectTab = (tab) => {
  selectedTab.value = tab;
};

// 监听路由变化，更新选中的Tab
watch(route, (newRoute) => {
  updateSelectedTab(newRoute.path);
});

// 初始化时，更新选中的Tab
onMounted(() => {
  updateSelectedTab(route.path); // 初次加载时更新选中的Tab
});

// 更新时，更新选中的Tab
onUpdated(() => {
  updateSelectedTab(route.path); // 路由变化时更新选中的Tab
})
</script>

<template>
  <div class="tab-selector">
    <RouterLink to="/index/classroom" class="tab" :class="{ active: selectedTab === 'room' }" @click="selectTab('room')">
      {{ t("navigation.ClassroomTab") }}
    </RouterLink>
    <RouterLink to="/index/officehour" class="tab" :class="{ active: selectedTab === 'tutor' }" @click="selectTab('tutor')">
      {{ t("navigation.OfficeHourTab") }}
    </RouterLink>
    <RouterLink to="/list?if_appointment=false" class="tab" :class="{ active: selectedTab === 'appointment' }" @click="selectTab('appointment')">
      {{ t("navigation.AppointmentTab") }}
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
