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

app.use(router)
app.use(VueAxios, axios)
app.use(i18n)

app.mount('#app')
