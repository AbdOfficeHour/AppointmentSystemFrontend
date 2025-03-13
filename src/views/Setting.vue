<script setup>
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'
import { useI18n } from "vue-i18n";
import { axiosInsV1_1 as axios } from '/src/service/axiosServer.js'
import { axiosInsV1_2 } from "/src/service/axiosServer.js";
import MarkdownIt from 'markdown-it'; // 导入 Markdown 解析器
import { UserInfoFormat } from "@/utils/dataFormat.js";
import GlobalVar from "@/utils/globalVar.js";
import { ElNotification } from "element-plus";
import versionInfoMdEn from '/src/assets/VersionInfo_en.md?raw'; // 导入 Markdown 文件
import versionInfoMdZh from '/src/assets/VersionInfo_zh.md?raw'; // 导入 Markdown 文件

let username = ref(null); // 用户名
let userID = ref(null); // 用户ID(与其他系统对齐为学生学号/教师工号)
let role = ref([]); // 后端返回的权限信息
let credits = ref([]); // 后端返回的用户权限
let authorityTable = ref({}); // 经过格式化后的权限表
let userInfoLoading = ref(true); // 用户信息加载状态
let versionInfoDialogVisible = ref(false); // 版本信息弹窗状态
let versionInfoDrawerVisible = ref(false); // 版本信息抽屉状态
let emailSettingVisible = ref(false) // 邮箱设置弹窗状态
let isMobile = ref(false); // 是否为移动端
let originEmail = ref("") // 后端返回的原邮箱地址
let emailInput = ref("") // 用户输入的新邮箱地址
let emailFormatErrorFlag = ref(false) // 用户输入邮箱格式是否合法

const { t, locale } = useI18n(); // 国际化翻译函数和语言设置
const connect_email = GlobalVar.connectEmail; // 邮箱地址
const version = GlobalVar.version; // 版本号
const mdParser = new MarkdownIt(); // 创建 Markdown 解析器实例
const versionInfoHtmlEn = ref(''); // 用于存储解析后的 HTML 英文内容
const versionInfoHtmlZh = ref(''); // 用于存储解析后的 HTML 中文内容

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
  console.log(currentWidth)
  isMobile.value = currentWidth < 1000; // 直接根据实时宽度判断
};

const debouncedHandleResize = debounce(handleResize, 100); // 带防抖的resize处理

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
      authorityTable.value = UserInfoFormat.credit_format(credits.value); // 格式化权限信息
      username.value = res.data.data.username; // 用户姓名
      userID.value = res.data.data.userID; // 用户学号/工号
      emailSettingGetter(); // 获取邮箱设置
    } else {
      console.error("请求失败，获取用户信息和权限信息失败");
      console.log(res.data.message);
    }
    userInfoLoading.value = false;
  });
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
    } else {
      console.error("请求失败，获取邮箱失败");
      console.log(res.data.message);
    }
  });
}

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
 * @description 上传邮箱设置
 */
const uploadEmailSetting = () => {
  if (!emailFormatErrorFlag.value) {
    ElNotification({
      title: t("setting.email_format_error"),
      message: t("setting.email_format_error_message"),
      type: "error",
      duration: 1000,
    });
    return;
  }
  axiosInsV1_2({
    method: 'put',
    url:`/Management/user/${userID.value}/email`,
    data: {
      email: emailInput.value
    }
  }).then(res => {
    if (res.data.code === 0) {
      ElNotification({
        title: t("setting.email_upload_success"),
        message: t("setting.email_upload_success_message"),
        type: "success",
        duration: 5000,
      });
      closeEmailSettingDialog()
    } else {
      ElNotification({
        title: t("setting.email_upload_error"),
        message: t("setting.email_upload_error_message"),
        type: "error",
        duration: 5000,
      });
    }
  }).catch(err => {
    console.log(err)
    ElNotification({
      title: t("setting.email_upload_error"),
      message: t("setting.email_upload_error_message"),
      type: "error",
      duration: 5000,
    });
  })
}

/**
 * @description Markdown 文件解析
 */
const markdownRender = () => {
  try {
    versionInfoHtmlEn.value = mdParser.render(versionInfoMdEn);
    versionInfoHtmlZh.value = mdParser.render(versionInfoMdZh);
  }
  catch (err) {
    console.error("Failed to render markdown file:", err);
    versionInfoHtmlEn.value = "Parsing the version information file failed.";
    versionInfoHtmlZh.value = "解析版本信息文件失败";
  }
}

/**
 * @description 切换语言
 */
const change_language = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
  localStorage.setItem("preferLanguage", locale.value);
};

/**
 * @description 返回SSO登录页面
 */
const back_to_sso = () => {
  window.location.href = import.meta.env.VITE_SSO_BASE;
};

/**
 * @description 下载用户手册
 */
const downloadUserManual = () => {
  const url = 'https://abdnims.scnu.edu.cn/officehour/file/UserManual_zh.pdf';
  window.open(url, '_blank');
}

/**
 * @description 打开版本信息
 */
const openVersionDialog = () => {
  versionInfoDrawerVisible.value = true;
  versionInfoDialogVisible.value = true;
}

/**
 * @description 关闭版本信息
 */
const closeVersionDialog = () => {
  versionInfoDrawerVisible.value = false;
  versionInfoDialogVisible.value = false;
}

/**
 * @description 邮箱格式正则验证
 */
const validateEmail = () => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  emailFormatErrorFlag.value = !emailPattern.test(emailInput.value);
};

/**
 * @description 打开邮箱设置
 */
const openEmailSettingDialog = () => {
  emailSettingVisible.value = true;
}

/**
 * @description 关闭邮箱设置
 */
const closeEmailSettingDialog = () => {
  emailSettingVisible.value = false;
  emailFormatErrorFlag.value = false;
  emailInput.value = "";
}

// 初始化时，获取用户信息
onMounted(() => {
  handleResize();  // 初始判断
  window.addEventListener('resize', debouncedHandleResize);  // 添加resize监听
  userInfoLoading.value = true;
  userInfoGetter(); // 获取用户信息
  markdownRender(); // 解析 Markdown 文件内容
});

// 组件刷新时，重新解析 Markdown 文件内容
onUpdated(() => {
  markdownRender();
});

onUnmounted(() => {
  window.removeEventListener('resize', debouncedHandleResize); // 移除resize监听
});
</script>

<template>
  <div class="app-container" v-loading="userInfoLoading">
    <div class="user-info-part">
      <el-avatar :size="80" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"></el-avatar>
      <div class="string-part">
        <div class="username-string">{{ username }}</div>
        <div class="role-part">
          <span style="margin-right: 5px; font-weight: bold; font-size: 13px">{{ t("setting.user_role") }}</span>
          <span v-for="(item, index) in role" class="role-string">
            {{ item }}
            <span v-if="index < role.length - 1">、</span>
          </span>
        </div>
      </div>
    </div>
    <div class="info-block change-language" @click="change_language()">
      <img src="/icon/language_black.svg" alt="change language" class="icon" />
      <span>{{ t("setting.change_language") }}</span>
    </div>
    <div class="info-block back-to-sso" @click="back_to_sso()">
      <img src="/icon/home_black.svg" alt="back to sso" class="icon" />
      <span>{{ t("setting.back_to_sso") }}</span>
    </div>
    <div class="info-block connect-with-us" @click="connect_info()">
      <img src="/icon/phone_black.svg" alt="connect with us" class="icon" />
      <span>{{ t("setting.connect") }}</span>
    </div>
    <div class="info-block version-info" @click="openVersionDialog">
      <img src="/icon/version_black.svg" alt="version info" class="icon" />
      <span>{{ t("setting.version") }}</span>
    </div>
    <div class="info-block user-manual" @click="downloadUserManual">
      <img src="/icon/user_manual_black.svg" alt="user manual" class="icon" />
      <span>{{ t("setting.user_manual") }}</span>
    </div>
    <div class="info-block email_setting" @click="openEmailSettingDialog">
      <img src="/icon/email_black.svg" alt="email setting" class="icon" />
      <span>{{ t("setting.email_setting") }}</span>
    </div>
    <el-dialog
      v-model="versionInfoDialogVisible"
      :title="version + t('setting.version')"
      custom-class="version-dialog"
      draggable
      v-if="!isMobile"
    >
      <div v-if="locale === 'zh'" class="markdown_content" v-html="versionInfoHtmlZh"></div>
      <div v-else class="markdown_content" v-html="versionInfoHtmlEn"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="closeVersionDialog">
            {{ t('setting.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
        v-model="emailSettingVisible"
        :title="t('setting.email_setting_title')"
        custom-class="email-dialog"
        draggable
        v-if="!isMobile"
    >
      <div class="email_usage_intro">{{ t("setting.email_upload_intro") }}</div>
      <div class="email_block_origin">
        <span class="email_intro_span">{{ t("setting.email_origin") }}</span>
        <el-input disabled :placeholder="originEmail === '' ? 'None' : originEmail"></el-input>
      </div>
      <div class="email_block_new">
        <span class="email_intro_span">{{ t("setting.input_new_email") }}</span>
        <el-input
            v-model="emailInput"
            @input="validateEmail"
            :placeholder="t('setting.input_email_placeholder')"
        ></el-input>
        <p v-if="emailFormatErrorFlag" style="color: red;">{{ t("setting.email_format_error") }}</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="uploadEmailSetting">
            {{ t('setting.email_upload') }}
          </el-button>
          <el-button type="info" @click="closeEmailSettingDialog">
            {{ t('setting.cancel') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-drawer
      v-model="versionInfoDrawerVisible"
      direction="btt"
      v-if="isMobile"
      class="version-info-drawer"
      :lock-scroll="true"
      size="80%"
    >
      <template #header>
        <h4 style="font-weight: bold; font-size: 20px;">{{ version + t('setting.version') }}</h4>
      </template>
      <template #default>
        <div>
          <div v-if="locale === 'zh'" class="markdown_content" v-html="versionInfoHtmlZh"></div>
          <div v-else class="markdown_content" v-html="versionInfoHtmlEn"></div>
        </div>
      </template>
      <template #footer>
        <div style="flex: auto">
          <div class="dialog-footer">
            <el-button type="primary" @click="closeVersionDialog">
              {{ t('setting.confirm') }}
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>
    <el-drawer
        v-model="emailSettingVisible"
        direction="btt"
        v-if="isMobile"
        class="email-drawer"
        :lock-scroll="true"
        size="80%"
    >
      <template #header>
        <h4 style="font-weight: bold; font-size: 20px;">{{ t('setting.email_setting_title') }}</h4>
      </template>
      <template #default>
        <div class="email_usage_intro">{{ t("setting.email_upload_intro") }}</div>
        <div class="email_block_origin">
          <span class="email_intro_span">{{ t("setting.email_origin") }}</span>
          <el-input disabled :placeholder="originEmail === '' ? 'None' : originEmail"></el-input>
        </div>
        <div class="email_block_new">
          <span class="email_intro_span">{{ t("setting.input_new_email") }}</span>
          <el-input
              v-model="emailInput"
              @input="validateEmail"
              :placeholder="t('setting.input_email_placeholder')"
          ></el-input>
          <p v-if="emailFormatErrorFlag" style="color: red;">{{ t("setting.email_format_error") }}</p>
        </div>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="uploadEmailSetting">
            {{ t('setting.email_upload') }}
          </el-button>
          <el-button type="info" @click="closeEmailSettingDialog">
            {{ t('setting.cancel') }}
          </el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: min(1200px, 100vh);
  display: flex;
  flex-direction: column;
}

.info-block {
  display: flex;
  flex-direction: row;
  padding: 10px 10px 10px 20px;
  background-color: #fdfdfd;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.role-string {
  font-size: 13px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 20px;
}

.user-info-part {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  padding: 10px 10px 10px 20px;
  background-color: #d8e9f6;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0 ,0, 0.1);
}

.role-part {
  display: flex;
  flex-direction: row;
}

.string-part {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.username-string {
  font-size: 30px;
  font-weight: bold;
}

@media (max-width: 1000px) {
  .version-dialog {
    margin-left: 50px !important;;
    margin-right: 50px !important;
    width: 300px !important;
  }
}

.email_usage_intro {
  margin-bottom: 10px;
}

.email_intro_span {
  font-weight: bold;
}

.email_block_origin {
  margin-bottom: 10px;
}

.email_block_new {
  margin-bottom: 10px;
}
</style>