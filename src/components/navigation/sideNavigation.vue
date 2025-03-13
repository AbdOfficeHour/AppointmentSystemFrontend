<script setup>
import { onMounted, watch, ref, onUpdated } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import GlobalVar from "@/utils/globalVar";

const selectedItem = ref('1'); // 选中的菜单项，默认为1（预约项目）
const route = useRoute(); // 获取当前路由
const { t } = useI18n(); // 获取国际化翻译函数
const version = GlobalVar.version; // 获取版本号

/**
 * 更新当前选中的导航栏项目
 * @param path - 当前路由路径
 */
const updateSelectedItem = (path) => {
  if (path.includes('/approve')) {
    selectedItem.value = '2'; // 审批
  } else if (path.includes('/login')) {
    selectedItem.value = '3'; // 返回首页
  } else if (path.includes('/setting')) {
    selectedItem.value = '4' // 设置
  } else {
    selectedItem.value = '1'; // 预约
  }
};

/**
 * @description 选择器发生变更时触发的函数，点击触发，切换导航栏项目
 * @param tab - 当前点击的导航栏项目索引
 */
const selectItem = (tab) => {
  selectedItem.value = tab;
};

/**
 * @description 跳转到登录页
 * @param tab - 当前点击的导航栏项目索引
 */
const navigateToLogin = (tab) => {
  selectedItem.value = tab;
  window.location.href = import.meta.env.VITE_SSO_BASE;
};

// 监听路由变化，更新选中的Tab
watch(route, (newRoute) => {
  updateSelectedItem(newRoute.path);
});

// 初始化时，更新选中的Tab
onMounted(() => {
  updateSelectedItem(route.path); // 初次加载时更新选中的Tab
});

// 更新时，更新选中的Tab
onUpdated(() => {
  updateSelectedItem(route.path); // 路由变化时更新选中的Tab
});
</script>

<template>
  <div class="side-navigation-container">
    <el-menu class="side-navigation-menu">
      <div class="menu-header">
        <img src="/src/assets/logo.png" alt="logo" class="logo" />
        <div class="version-string">{{ t("navigation.Version") }} {{ version }}</div>
      </div>
      <router-link to="/index/classroom" class="router-link-part">
        <el-menu-item index="1" class="menu-item" :class="{ active : selectedItem === '1' }" @click="selectItem('1')">
            <div class="menu-item-text">
              <img src="/icon/appointment.svg" alt="appointment" class="icon"/>
              <span>{{ t("navigation.Appointment") }}</span>
            </div>
        </el-menu-item>
      </router-link>
      <router-link to="/approve" class="router-link-part">
        <el-menu-item index="2" class="menu-item" :class="{ active: selectedItem === '2' }" @click="selectItem('2')" >
          <div class="menu-item-text">
            <img src="/icon/approve.svg" alt="approve" class="icon"/>
            <span>{{ t("navigation.Approve") }}</span>
          </div>
        </el-menu-item>
      </router-link>
      <el-menu-item index="3" class="menu-item" :class="{ active: selectedItem === '3' }" @click="navigateToLogin('3')">
        <div>
          <div class="menu-item-text">
            <img src="/icon/home.svg" alt="back to SSO" class="icon"/>
            <span>{{ t("navigation.Home") }}</span>
          </div>
        </div>
      </el-menu-item>
      <router-link to="/setting" class="router-link-part">
        <el-menu-item index="4" class="menu-item" :class="{ active: selectedItem === '4' }" @click="selectItem('4')">
          <div class="menu-item-text">
            <img src="/icon/setting.svg" alt="Setting" class="icon"/>
            <span>{{ t("navigation.Setting") }}</span>
          </div>
        </el-menu-item>
      </router-link>
    </el-menu>
  </div>
</template>

<style scoped>
.version-string {
  color: #ffffff;
  font-size: 12px;
  margin-top: 10px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 20px;
}

.logo {
  width: 80%;
}

.side-navigation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1d39c4;
  width: 100%;
  height: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.side-navigation-menu {
  background: transparent;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.menu-header {
  text-align: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 15px 20px;
  margin-left: 3%;
  margin-right: 3%;
  margin-bottom: 20px;
  width: 94% !important;
  background-color: inherit;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item.active {
  background-color: #2a4d9e;
  border-left: 5px solid #3498db;
}

.menu-item:hover {
  transform: scale(1.02);
  background-color: #2a4d9e;
}

.menu-item-text {
  display: flex;
  flex-direction: row;
  margin-left: 10px;
}

.menu-item-text span {
  font-size: 14px;
  line-height: 1.4;
  color: #ffffff;
  font-weight: 500;
}

.menu-item-text span:first-child {
  font-weight: bold;
}

span.active {
  color: #3498db;
  font-weight: bold;
}

.router-link-part {
  width: 100%;
}
</style>