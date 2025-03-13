<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from "vue-router";
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import { Comment, HomeFilled, Switch } from "@element-plus/icons-vue";
import { UserInfoFormat } from "@/utils/dataFormat.js";
import { ElNotification } from "element-plus";
import GlobalVar from "@/utils/globalVar.js";

const { t, locale } = useI18n(); // 获取国际化翻译函数和当前语言
const router = useRouter(); // 获取路由实例

let username = ref(null) // 用户名
let userID = ref(null) // 用户ID(与其他系统对齐为学生学号/教师工号)
let email = ref(null) // 用户邮箱
let role = ref([]) // 后端返回的权限信息
let credits = ref([]) // 后端返回的用户权限
let authorityTable = ref({}) // 经过格式化后的权限表
const connect_email = GlobalVar.connectEmail; // 联系邮箱地址

/**
 * @description 处理导航栏选中后，获取开发者联系方式的函数
 */
const connect_info = () => {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    console.error("当前浏览器不支持剪切板操作");
    ElNotification({
      title: t("setting.connect_error"),
      message: `${t("setting.connect_error_message_disabled_clipboard")} ${connect_email}`,
      type: "error",
      duration: 5000,
    });
    return;
  }
  navigator.clipboard.writeText(connect_email).then(() => {
    // 复制成功后显示通知
    ElNotification({
      title: t("setting.connect_success"),
      message: `${t("setting.connect_success_message")} ${connect_email}`,
      type: "success",
      duration: 5000, // 通知显示时间（毫秒）
    });
  }).catch((err) => {
    console.error("Failed to copy email:", err);
    ElNotification({
      title: t("setting.connect_error"),
      message: `${t("setting.connect_error_message")} ${connect_email}`,
      type: "error",
      duration: 5000,
    });
  });
};

/**
 * @description 处理导航栏选中后的函数
 * @param key - 当前点击的导航栏项目索引
 */
const handleSelect = (key) => {
  if (key === '1') {
    window.location.href = import.meta.env.VITE_SSO_BASE;
  }
  else if (key === '2') {
    change_language();
  }
  else if (key === '3-1') {
    window.location.href = import.meta.env.VITE_SSO_BASE;
  }
  else if (key === '3-2') {
    change_language();
  }
  else if (key === '4') {
    connect_info();
  }
};

/**
 * @description 切换语言
 */
const change_language = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
  localStorage.setItem("preferLanguage", locale.value)
};

// 初始化时，获取用户信息和权限信息
onMounted(() => {
  axios({
    method: 'get',
    url: '/User/info',
  }).then(res => {
    if(res.data.code === 0){
      role.value = res.data.data.userAuthority.role // 用户角色
      credits.value = res.data.data.userAuthority.credit // 用户权限
      authorityTable.value = UserInfoFormat.credit_format(credits.value) // 格式化权限信息
      username.value = res.data.data.username // 用户姓名
      userID.value = res.data.data.userID // 用户学号/工号
      email.value = res.data.data.email // 用户邮箱
    }
    else{
      console.error("请求失败，获取用户信息和权限信息失败")
      console.log(res.data.message)
    }
  })
});
</script>

<template>
  <el-menu
      :ellipsis="false"
      class="navigation-bar"
      mode="horizontal"
      @select="handleSelect"
  >
    <el-menu-item index="1">
      <router-link to="/index/classroom">
        <el-icon><HomeFilled /></el-icon>
      </router-link>
    </el-menu-item>
    <el-menu-item index="4">
      <el-icon><Comment /></el-icon>
    </el-menu-item>
    <el-menu-item index="2">
      <el-icon><Switch /></el-icon>
      <span>{{ t("navigation.ChangeLanguage") }}</span>
    </el-menu-item>
    <el-sub-menu index="3">
      <template #title>
        <el-avatar :size="40" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
        <span class="username-string">{{username}}</span>
      </template>
      <el-menu-item index="3-1">{{ t("navigation.Logout") }}</el-menu-item>
      <el-menu-item index="3-2">{{ t("navigation.ChangeLanguage") }}</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>
.el-menu--horizontal > .el-menu-item:nth-child(2) {
  margin-right: auto;
}

.username-string {
  margin-left: 10px;
  font-weight: bold;
}

.el-menu-item.is-disabled {
  color: white !important;
  opacity: 1 !important;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 20px;
}
</style>