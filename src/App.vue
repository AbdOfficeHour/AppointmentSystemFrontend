<script setup>
import { RouterView, useRoute } from 'vue-router'
import { onMounted, watch, ref, onUnmounted } from 'vue';
import router from "@/router/index.js";
import { axiosInsV1_1 as axios } from "@/service/axiosServer.js";
import { axiosInsV1_2 } from "@/service/axiosServer.js";
import { useI18n } from "vue-i18n";
import SideNavigationBar from "@/components/navigation/sideNavigation.vue";
import TopNavigationBar from "@/components/navigation/topNavigation.vue";
import TabSelector from "@/components/navigation/tabSelector.vue";
import BottomNavigation from "@/components/navigation/bottomNavigation.vue";
import { ElNotification } from "element-plus";
import { h } from 'vue';

let route = useRoute(); // 获取当前路由
let { t } = useI18n(); // 国际化翻译函数
let isApprove = ref(false); // 是否为审批页面，默认为否，用于条件渲染导航栏
let isSetting = ref(false) // 是否为设置页面，默认为否，用于条件渲染导航栏
let isMobile = ref(false); // 是否为移动端
let username = ref(null); // 用户名
let userID = ref(null); // 用户ID(与其他系统对齐为学生学号/教师工号)
let role = ref([]); // 后端返回的权限信息
let credits = ref([]); // 后端返回的用户权限
let originEmail = ref(""); // 用户邮箱

/**
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间
 * @returns {function(...[*]=)}
 * @description 防抖函数，用于resize事件
 */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * @description 根据窗口宽度判断是否为移动端
 * @returns {void}
 */
const handleResize = () => {
  const currentWidth = window.innerWidth;
  isMobile.value = currentWidth < 1000; // 直接根据实时宽度判断
};

/**
 * @description 检查邮箱设置
 */
const emailSettingCheck = () => {
  if (originEmail.value === "") {
    // 先检查本地是否已经关闭提醒
    if (!localStorage.getItem('disableEmailAlert') === true) {
      const notification = ElNotification({
        title: t("index.email_empty_alert_title"),
        message: h('div', [
          h('p', t("index.email_empty_alert_content")),
          h('div', { style: 'margin-top: 10px; display: flex; gap: 10px;' }, [ // 使用flex布局，增加按钮间距
            h('el-button', {
              size: 'small',
              style: { // 自定义按钮样式
                backgroundColor: '#409eff',
                color: '#fff',
                borderColor: '#409eff',

                borderRadius: '4px',
                padding: '6px 12px'
              },
              onClick: () => {
                notification.close();
              }
            }, t("index.known")),
            h('el-button', {
              size: 'small',
              type: 'primary',
              style: { // 自定义按钮样式
                backgroundColor: '#f0f2f5',
                color: '#333',
                borderColor: '#dcdfe6',
                borderRadius: '4px',
                padding: '6px 12px'
              },
              onClick: () => {
                localStorage.setItem('disableEmailAlert', 'true');
                notification.close();
              }
            }, t("index.dont_show_again"))
          ])
        ]),
        type: "warning",
        duration: 0, // 设置为0表示不自动关闭
      });
    }
  }
};

/**
 * @description 获取用户信息
 */
const userInfoGetter = () => {
  axios({
    method: 'get',
    url: '/User/info',
  }).then(res => {
    if (res.data.code === 0) {
      role.value = res.data.data.userAuthority.role; // 用户角色
      credits.value = res.data.data.userAuthority.credit; // 用户权限
      username.value = res.data.data.username; // 用户姓名
      userID.value = res.data.data.userID; // 用户学号/工号
      emailSettingGetter(); // 获取邮箱设置
    } else {
      console.error("请求失败，获取用户信息和权限信息失败");
      console.log(res.data.message);
    }
  })
}

/**
 * @description 获取邮箱设置
 */
const emailSettingGetter = () => {
  axiosInsV1_2({
    method: 'get',
    url: `/user/${userID.value}/email`,
  }).then(res => {
    if (res.data.code === 0) {
      originEmail.value = res.data.data; // 用户原邮箱
      emailSettingCheck(); // 检查邮箱设置
    } else {
      console.error("请求失败，获取邮箱失败");
      console.log(res.data.message);
    }
  })
}

// 监听路由变化
watch(route, (newRoute) => {
  isApprove.value = newRoute.path.includes('/approve');
  isSetting.value = newRoute.path.includes('/setting')
});

// 路由守卫，判断是否为审批页面
router.beforeEach((to, from, next) => {
  const notNavList = ["/approve", "/login"]
  isApprove.value = notNavList.includes(to.path)
  next();
})

const debouncedHandleResize = debounce(handleResize, 100); // 带防抖的resize处理

onMounted(() => {
  handleResize();  // 初始判断
  userInfoGetter(); // 获取用户信息和邮箱设置信息
  window.addEventListener('resize', debouncedHandleResize);  // 添加resize监听
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedHandleResize); // 移除resize监听
});
</script>

<template>
  <div class="app-container">
    <div v-if="isMobile" class="base-mobile">
      <div class="top-bar">
        <img src="/src/assets/logo.png" class="logo" alt="logo" />
      </div>
      <div class="mid-body">
        <RouterView />
      </div>
      <div class="bottom-navigation">
        <BottomNavigation />
      </div>
    </div>
    <div v-else class="base-desktop">
      <div class="left-navigation">
        <SideNavigationBar />
      </div>
      <div class="right-body">
        <div class="top-navigation">
          <TopNavigationBar />
        </div>
        <div class="content-container">
          <div class="tab-selector" v-if="!isApprove && !isSetting">
            <TabSelector />
          </div>
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.version-string {
  color: #ffffff;
  font-size: 12px;
  margin-top: 10px;
}

.mid-body {
  padding: 5px 5px 50px;
  background-color: #f5f7fa;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 5px;
  transition: all 0.3s ease;
}

.bottom-navigation {
  height: 50px;
}

.top-bar {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #1d39c4;
}

.logo {
  width: 80%;
  height: auto;
}

.base-desktop {
  display: grid;
  grid-template-columns: 20% 80%;
  min-height: max(100vh, 1200px);
  width: 100%;
}

.left-navigation {
  height: auto;
  background: inherit;
  margin-right: 5px;
}

.right-body {
  display: flex;
  flex-direction: column;
  height: auto;
}

.app-container {
  min-height: min(1200px, 100vh);
}

.content-container {
  height: auto;
}

.top-navigation {
  margin-bottom: 20px;
  height: 60px;
}

.el-message {
  background-color: white !important;
  box-shadow: 3px 3px 15px rgba(0, 0, 0, 0.15) !important;
  border: none !important;
}

.el-message__content {
  color: black !important;
}
</style>
