import './assets/main.css'

import { createApp } from 'vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

import VueAxios from 'vue-axios'
import axios from 'axios'

axios.defaults.baseURL = "/api/v1.1"

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(VueAxios, axios)

app.mount('#app')
