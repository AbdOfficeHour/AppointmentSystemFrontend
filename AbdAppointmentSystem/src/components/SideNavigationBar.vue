<script setup>
import {useRoute} from "vue-router";
import {onMounted, watch, ref} from "vue";

// SideNavigationBar组件全局变量定义
const selectedItem = ref('1'); // 选中的菜单项，默认为1（预约项目）
const route = useRoute(); // 获取当前路由

/**
 * 根据路径更新选中的Item
 */
const updateSelectedItem = (path) => {
  if (path.includes('/approve')) {
    selectedItem.value = '2'; // 审批
  }
  else {
    selectedItem.value = '1'; // 预约
  }
};

onMounted(function () {
  console.log("SideNavigationBar组件开始挂载")
  updateSelectedItem(route.path); // 初次加载时更新选中的Tab
});

/**
 * 监听路由变化并更新选中的Tab
 */
watch(route, (newRoute) => {
  updateSelectedItem(newRoute.path);
});

/**
 * 选择器发生变更时触发的函数，点击触发
 */
const selectItem = (tab) => {
  selectedItem.value = tab;
};
</script>

<template>
  <div class="side-navigation-container">
    <el-menu class="side-navigation-menu">
      <el-menu-item index="1" class="menu-item" >
        <router-link to="/index/classroom"  :class="{ active: selectedItem === '1' }" @click="selectItem('1')">
          <span>发起预约 </span>
          <span> Initiate appointment</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="2" class="menu-item">
        <router-link to="/approve" :class="{ active: selectedItem === '2' }" @click="selectItem('2')">
          <span>审核预约 </span>
          <span> Audit appointment</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="3" class="menu-item">
        <router-link to="/approve" :class="{ active: selectedItem === '3' }" @click="selectItem('3')">
          <span>审核预约 </span>
          <span> Audit appointment</span>
        </router-link>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.side-navigation-container {
  display: flex;
  overflow: hidden;
}

.menu-item {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  background-color: #f0f0f0;
  color: grey;
  transition: background-color 0.3s, color 0.3s;
  font-size: 15px;
  font-weight: 700;
  margin: 10px;
}

.menu-item.active {
  background-color: #E3ECFF;
  color: #10239E;
  font-size: 15px;
  font-weight: 700;
}

.menu-item:not(.active):hover {
  background-color: #101010;
  color: #E3ECFF;
  font-size: 15px;
  font-weight: 700;
}
</style>
