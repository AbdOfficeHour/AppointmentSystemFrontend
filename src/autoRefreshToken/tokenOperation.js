import axios_ins from './axiosObject'

let promise;

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getToken() {
    return localStorage.getItem('token');
}

export function setRefreshToken(refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
}

export function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

export async function refreshToken() {
  if (promise) {
    return promise
  }
  promise = new Promise(async (resolve, reject) => {
    console.log("刷新token")
    await axios_ins({
      method: 'post',
      url: `/api/token_refresh`, // 未来确保为SSO服务器的路由
      data: {
        refresh: getRefreshToken()
      },
      __isRefreshToken: true
    }).then(res => {
      if (res.code === 0) {
        console.log("刷新token成功")
        setToken(res.data.access)
        resolve(true)
      } else {
        resolve(false)
      }
    }).catch(err => {
      reject(err)
    }).finally(() => {
      promise = null
    })
  })
  return promise
}


export function isRefreshRequest(config) {
  return !!config.__isRefreshToken
}
