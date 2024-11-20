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
  else if (path.includes('/login')) {
    selectedItem.value = '3' // 返回首页
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

const navigateToLogin = (tab) => {
  selectedItem.value = tab;
  window.location.href = 'http://sso.abdn.kirisame.cc/officehour/login';
};

</script>

<template>
  <div class="side-navigation-container">
    <el-menu class="side-navigation-menu">
      <div class="title-3">导航栏</div>
      <div class="title-3">Navigation Bar</div>
<!--      <div class="title-4">预约平台</div>-->
<!--      <div class="title-4">Appointment System</div>-->
      <el-menu-item index="1" class="menu-item" :class="{ active: selectedItem === '1' }">
        <router-link to="/index/classroom" @click="selectItem('1')">
          <img src="/预约.png" alt="返回" class="icon" width="32"/>
          <span :class="{ active: selectedItem === '1' }">发起预约 </span>
          <span :class="{ active: selectedItem === '1' }">Initiate appointment</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="2" class="menu-item" :class="{ active: selectedItem === '2' }">
        <router-link to="/approve" @click="selectItem('2')" >
          <img src="/审批.png" alt="返回" class="icon" width="32"/>
          <span :class="{ active: selectedItem === '2' }">审核预约 </span>
          <span :class="{ active: selectedItem === '2' }">Audit appointment</span>
        </router-link>
      </el-menu-item>
      <el-menu-item index="3" class="menu-item" :class="{ active: selectedItem === '3' }">
        <div to="/login" @click="navigateToLogin('3')" >
          <img src="/预约.png" alt="返回" class="icon" width="32"/>
          <span :class="{ active: selectedItem === '3' }">回到首页 </span>
          <span :class="{ active: selectedItem === '3' }">Back to HomePage</span>
        </div>
      </el-menu-item>
      <div style="margin-bottom: 1000px"></div>
    </el-menu>
  </div>
</template>

<style scoped>
.side-navigation-container {
  display: flex;
  overflow: hidden;
  height: 100%;
  width: 100%;
}

.side-navigation-menu {
  background-color: #f0f0f0;
  width: 90%;
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
}

.menu-item:not(.active):hover {
  background-color: #101010;
}

span.active {
  color: #10239E;
  font-size: 15px;
  font-weight: 700;
}

span:not(.active){
  color: grey;
  font-size: 15px;
  font-weight: 700;
}

.icon {
  margin-right: 8px; /* 调整图标与文字之间的间距 */
  vertical-align: middle; /* 上下居中 */
}

.title-3 {
  font-size: 20px;
  font-weight: 700;
  margin-left: 10px;
}

</style>
