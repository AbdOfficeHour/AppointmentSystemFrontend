<script setup>
import { useRoute } from "vue-router";
import { onMounted, watch, ref } from "vue";

// SideNavigationBar组件全局变量定义
const selectedItem = ref('1'); // 选中的菜单项，默认为1（预约项目）
const route = useRoute(); // 获取当前路由

/**
 * 根据路径更新选中的Item
 */
const updateSelectedItem = (path) => {
  if (path.includes('/approve')) {
    selectedItem.value = '2'; // 审批
  } else if (path.includes('/login')) {
    selectedItem.value = '3'; // 返回首页
  } else {
    selectedItem.value = '1'; // 预约
  }
};

onMounted(() => {
  console.log("SideNavigationBar组件开始挂载");
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
      <div class="menu-header">
        <h3 class="menu-title">导航栏</h3>
        <h3 class="menu-title-sub">Navigation Bar</h3>
      </div>
      <el-menu-item index="1" class="menu-item" :class="{ active : selectedItem === '1' }" @click="selectItem('1')">
        <router-link to="/index/classroom" class="router-link-part">
          <div class="menu-item-text">
            <span>发起预约</span>
            <span>Initiate Appointment</span>
          </div>
        </router-link>
      </el-menu-item>
      <el-menu-item index="2" class="menu-item" :class="{ active: selectedItem === '2' }" @click="selectItem('2')" >
        <router-link to="/approve" class="router-link-part">
          <div class="menu-item-text">
            <span>审核预约</span>
            <span>Audit Appointment</span>
          </div>
        </router-link>
      </el-menu-item>
      <el-menu-item index="3" class="menu-item" :class="{ active: selectedItem === '3' }" @click="navigateToLogin('3')">
        <div>
          <div class="menu-item-text">
            <span>回到首页</span>
            <span>Back to HomePage</span>
          </div>
        </div>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
/* 容器样式 */
.side-navigation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9fafc;
  width: 100%;
  height: 100vh;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: auto;
}

/* 菜单样式 */
.side-navigation-menu {
  background: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

/* 标题部分 */
.menu-header {
  text-align: center;
  margin-bottom: 20px;
}

.menu-title {
  font-size: 25px;
  font-weight: 700;
  color: #10239e;
}

.menu-title-sub {
  font-size: 20px;
  font-weight: 700;
  color: #6c757d;
}

/* 菜单项样式 */
.menu-item {
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 15px 20px;
  margin: 15px 0;
  width: 100% !important;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item.active {
  background-color: #e6f7ff;
  border-left: 5px solid #1890ff;
}

.menu-item:hover {
  transform: scale(1.02);
  background-color: #f0f5ff;
}

/* 图标样式 */
.icon {
  margin-right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f5f5f5;
  padding: 5px;
}

/* 调整文本容器样式 */
.menu-item-text {
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  margin-left: 10px; /* 调整与图标的间距 */
  gap: 4px; /* 控制两个 <span> 之间的间距 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 文本样式 */
.menu-item-text span {
  font-size: 14px; /* 适当缩小字体大小，防止超出 */
  line-height: 1.4; /* 调整行高，保持紧凑 */
  color: #333333;
  font-weight: 500;
}

.menu-item-text span:first-child {
  font-weight: bold; /* 第一行加粗 */
}

span.active {
  color: #1890ff;
  font-weight: bold;
}

.router-link-part {
  width: 100%;
}
</style>
