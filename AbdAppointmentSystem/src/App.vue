<script setup>
import {RouterView, useRoute} from 'vue-router'
import {onMounted, watch, ref} from 'vue';

import TabSelector from "@/components/TabSelector.vue";
import router from "@/router/index.js";
import SideNavigationBar from "@/components/SideNavigationBar.vue";

// App.vue组件全局变量定义
const route = useRoute(); // 获取当前路由
let isApprove = ref(false); // 是否为审批页面，默认为否，用于条件渲染导航栏

/**
 * 监听路由变化并更新选中的Tab
 */
// watch(route, (newRoute) => {
//   isApprove.value = newRoute.path.includes('/approve');
// });

router.beforeEach( (to, from, next) => {
  const notNavList = ["/approve","/login"]
  isApprove.value = notNavList.includes(to.path)
  next();
})

/**
 * App.vue组件初始化
 */
onMounted(() => {
  console.log("App组件开始挂载")
});
</script>

<template>
  <div class="app-container">
    <!-- 左侧侧边导航栏 -->
    <div class="side-navigation">
      <SideNavigationBar />
    </div>

    <!-- 右侧内容区域 -->
    <div class="content-container">
      <div class="tab-selector" v-if="!isApprove">
        <TabSelector />
      </div>
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* 父容器 */
.app-container {
  display: flex; /* 使用Flex布局 */
  height: 100vh; /* 设置为视口高度 */
  overflow: hidden; /* 防止溢出 */
}

/* 左侧侧边导航栏 */
.side-navigation {
  flex: 0 0 25%; /* 固定宽度，约占25% */
  max-width: 300px; /* 最大宽度限制 */
  display: flex;
  flex-direction: column;
}

/* 右侧内容区域 */
.content-container {
  flex: 1; /* 剩余空间自动填充 */
  padding: 20px; /* 内边距 */
  overflow-y: auto; /* 当内容过多时滚动 */
  background-color: #ffffff; /* 可选：背景颜色 */
  display: flex;
  flex-direction: column;
}
</style>

