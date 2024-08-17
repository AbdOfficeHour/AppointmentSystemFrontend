import './assets/main.css'

import { createApp } from 'vue'

import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

import VueAxios from 'vue-axios'
import axios from 'axios'

import i18n from './vue_i18n/index.js'
import {ElMessage} from "element-plus";

axios.defaults.baseURL = "http://ohour-backend.abdn.kirisame.cc/api/v1.1"
axios.defaults.withCredentials = true

const app = createApp(App)

//添加路由守卫
// router.beforeEach((to, from, next) => {
//     if(to.fullPath==="/"){
//         next("/index/appointment")
//     }else if(!localStorage.getItem("token")){
//         next("/login")
//     }
//     next()
// })

//axios拦截器
axios.interceptors.response.use((response) =>{
    return response;
}, (error)=> {
    if(!error.response){
        ElMessage.error("网络错误，请检查网络连接")
        return Promise.reject(error);
    }

    if (error.response.status === 401) {
        // window.location.href = 'http://sso.abdn.kirisame.cc/officehour/login.html';
    }
    return Promise.reject(error);
})

// axios.interceptors.request.use((request)=>{
//     request.headers.Authorization = `Bearer ${localStorage.getItem("token")}`
//     return request
// })


app.use(router)
app.use(VueAxios, axios)
app.use(i18n)

app.mount('#app')
