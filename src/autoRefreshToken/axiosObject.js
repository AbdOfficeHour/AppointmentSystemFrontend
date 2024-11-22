import axios from 'axios'
import { setToken, getToken, setRefreshToken,  } from './tokenOperation'
import { refreshToken, isRefreshRequest } from './tokenOperation'

const axios_ins = axios.create({
  baseURL: "/api/v1.1", // 路由还不对，现在是子系统路由而不是SSO服务器路由
  headers: {
    Authorization: `Bearer ${getToken()}`
  }
})

axios_ins.interceptors.response.use(async( response ) =>{
  if (response.headers.authorization) {
    const token = response.headers.authorization.replace('Bearer ', '')
    setToken(token)
    axios_ins.defaults.headers.Authorization = `Bearer ${token}`
  }
  if (response.headers.refreshtoken) {
    const refreshToken = response.headers.refreshtoken.replace('Bearer ', '')
    setRefreshToken(refreshToken)
  }
  return response.data
}, async (error) => {
  if (error.response.status === 401 && !isRefreshRequest(error.config)) {
    // 刷新token
    const isSuccess = await refreshToken()
    if (isSuccess) {
      // 重新请求
      console.log("重新请求")
      error.config.headers.Authorization = `Bearer ${getToken()}`
      const originalRequest = error.config;
      const resp = await axios_ins.request(originalRequest);
      return resp
    }
    else {
      // 无权限
      console.log("无权限，返回单点登录页")
      return Promise.reject(error);
    }
  }
})

axios_ins.interceptors.request.use((request)=>{
  const token = getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

export default axios_ins