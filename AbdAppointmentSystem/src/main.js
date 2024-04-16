import './assets/main.css'

import { createApp } from 'vue'

import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

import VueAxios from 'vue-axios'
import axios from 'axios'

import i18n from './vue_i18n/index.js'

axios.defaults.baseURL = "/api/v1.1"

const app = createApp(App)

//添加路由守卫
router.beforeEach((to, from, next) => {
    if(to.fullPath==="/"){
        next("/index/appointment")
    }else if(!localStorage.getItem("token")){
        next("/login")
    }
    next()
})

//axios拦截器
axios.interceptors.response.use((response) =>{
    return response;
}, (error)=> {
    if (error.response.status === 401) {
        localStorage.removeItem('token')
        router.push('/login')
    }
    return Promise.reject(error);
})


app.use(router)
app.use(VueAxios, axios)
app.use(i18n)

app.mount('#app')
