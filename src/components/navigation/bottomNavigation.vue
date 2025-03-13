<script setup>
import { ref, onMounted, watch, onUpdated } from 'vue';
import { useRouter, useRoute } from "vue-router";
import classroom from '/icon/classroom_black.svg';
import teacher from '/icon/teacher_black.svg';
import setting from '/icon/setting_black.svg';
import appointment from '/icon/appointment_black.svg';
import approve from '/icon/approve_black.svg';

const navItems = [
  { name: '空间预约', icon: classroom },
  { name: '教师预约', icon: teacher },
  { name: '设置页面', icon: setting },
  { name: '发起预约', icon: appointment },
  { name: '审核预约', icon: approve }
];
const activeIndex = ref(0)
const router = useRouter()
const route = useRoute()

/**
 * 更新当前选中的导航栏项目
 * @param path - 当前路由路径
 */
const updateCurrentSelect = (path) => {
  if (path.includes('/index/classroom')) {
    activeIndex.value = 0
  }
  else if (path.includes('/index/officehour')) {
    activeIndex.value = 1
  }
  else if (path.includes('/setting')) {
    activeIndex.value = 2
  }
  else if (path.includes('/list')) {
    activeIndex.value = 3
  }
  else if (path.includes('/approve')) {
    activeIndex.value = 4
  }
}

/**
 * @description 设置当前激活的导航栏项目
 * @param index - 当前点击的导航栏项目索引
 */
const activeNavigate = (index) => {
  switch (index) {
    case 0:
      router.push("/index/classroom")
      break
    case 1:
      router.push("/index/officehour")
      break
    case 2:
      router.push("/setting")
      break
    case 3:
      router.push("/list")
      break
    case 4:
      router.push("/approve")
      break
  }
};

// 监听路由变化
watch(route, (newRoute) => {
  updateCurrentSelect(newRoute.path);
});

// 初始化时，按照当前选中的导航栏项目进行更新
onMounted(() => {
  updateCurrentSelect(route.path)
})

// 更新时，按照当前选中的导航栏项目进行更新
onUpdated(() => {
  updateCurrentSelect(route.path)
})
</script>

<template>
  <div class="bottom-nav">
    <div
        v-for="(item, index) in navItems"
        :key="index"
        class="nav-item"
        :class="{ active: activeIndex === index }"
        @click="activeNavigate(index)"
    >
      <img :src="item.icon" :alt="item.name" />
    </div>
  </div>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #f5f7fa;
  padding: 10px 0;
  position: fixed;
  bottom: 0;
  width: 100%;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  height: 80px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.nav-item img {
  width: 24px;
  height: 24px;
  transition: transform 0.3s ease;
}

.nav-item.active img {
  transform: scale(1.2);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #1d39c4;
}
</style>