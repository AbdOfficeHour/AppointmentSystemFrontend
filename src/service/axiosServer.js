/**
 * axiosServer.js
 * 处理基于axios的请求和响应
 */

import axios from 'axios'
import i18n from '/src/i18n/index.js';
import { ElMessage } from "element-plus";

// 环境变量
const API_BASE_URL = import.meta.env.VITE_API_URL;
const SSO_LOGIN_URL = import.meta.env.VITE_SSO_BASE;
const mode = import.meta.env.VITE_MODE;

/**
 * 统一实例配置工厂函数
 * @param version {string} API版本号
 * @returns {axios.AxiosInstance} 返回一个axios实例
 */
const createApiInstance = (version) => axios.create({
    timeout: 10000,
    withCredentials: true,
    baseURL: mode === "development"
        ? `/api/${version}`
        : `${API_BASE_URL}/${version}`
})

// 批量创建实例
const versionConfigs = ['v1.1', 'v1.2']
const [axiosInsV1_1, axiosInsV1_2] = versionConfigs.map(createApiInstance)

/**
 * 处理响应错误
 * @param error {AxiosError} axios错误对象
 * @returns {Promise<never>} 返回一个拒绝的Promise对象
 */
const handleResponseError = (error) => {
    if (!error.response) {
        ElMessage.error(i18n.global.t('web_connection.network_error'))
        return Promise.reject(error);
    }
    if (error.response.status === 401 && mode !== "development") { // 开发模式下不重定向
        window.location.href = SSO_LOGIN_URL;
    }
    return Promise.reject(error);
}

// axios响应拦截器
[axiosInsV1_1, axiosInsV1_2].forEach(instance => {
    instance.interceptors.response.use(
        response => response,
        handleResponseError
    )
});

export {
    axiosInsV1_1,
    axiosInsV1_2
}
