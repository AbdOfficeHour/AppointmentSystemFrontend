import './assets/main.css';
import 'element-plus/dist/index.css';
import { createApp } from 'vue';
import router from './router';
import VueAxios from 'vue-axios';
import i18n from '@/i18n/index.js';
import App from './App.vue';
import { axiosInsV1_1 as axios } from '@/service/axiosServer.js';
import { initSentry } from "@/service/sentryServer.js";

const app = createApp(App); // 创建 Vue 实例
const devMode = import.meta.env.MODE; // 开发环境变量
if (devMode !== 'development') {
    initSentry(app, router); // 初始化 Sentry
}
app.use(router);
app.use(VueAxios, axios);
app.use(i18n);

app.mount('#app');
