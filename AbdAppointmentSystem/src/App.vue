<script setup>
import {RouterView, useRoute} from 'vue-router'
import {onMounted, watch, ref} from 'vue';

import TabSelector from "@/components/TabSelector.vue";
import router from "@/router/index.js";

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
  <div class="tab-selector" v-if="!isApprove">
    <TabSelector />
  </div>
  <RouterView />
</template>

<style scoped>

</style>
