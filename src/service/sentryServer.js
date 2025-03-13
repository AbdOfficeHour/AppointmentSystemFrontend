/**
 * sentryServer.js
 * 处理Sentry监控系统的相关配置
 */

import * as Sentry from '@sentry/vue'
import { jwtDecode } from 'jwt-decode'
import globalVar  from "@/utils/globalVar.js";
import Cookies from "js-cookie";
import { UAParser } from "ua-parser-js";

const sentry_dsn = import.meta.env.VITE_SENTRY_DSN
const mode = import.meta.env.MODE
const app_version = globalVar.version

/**
 * @description: 获取用户令牌的解码信息
 * @return {Object} 用户信息
 */
function getUserFromToken() {
  try {
    const token = Cookies.get('jwt_token')
    if (!token) {
      return null
    }
    const decoded = jwtDecode(token)
    return {
      username: decoded.username,
      name: decoded.name,
      grade: decoded.grade,
      major_class: decoded.major_class,
      id: decoded.id,
      role: decoded.role,
      is_superuser: decoded.is_superuser,
      is_staff: decoded.is_staff,
    }
  } catch (error) {
    console.error('getUserFromToken error:', error)
    return null
  }
}

/**
 * @description: 设置Sentry用户信息
 * @return {*}
 */
function sentryUserSettings() {
  const user = getUserFromToken()
  if (user) {
      Sentry.setUser(user)
  }
}

function sentryContextSettings() {
  const parser = new UAParser();
  const { browser, os, device } = parser.getResult();
  const user = getUserFromToken();

  Sentry.setContext("用户信息", {
    name: user ? user.name : "未登录",
    username: user ? user.username : "未登录",
    grade: user ? user.grade : "未登录",
    major_class: user ? user.major_class : "未登录",
    id: user ? user.id : "未登录",
    role: user ? user.role : "未登录",
    is_superuser: user ? user.is_superuser : "未登录",
    is_staff: user ? user.is_staff : "未登录",
  })

  Sentry.setContext("设备信息", {
    resolution: `${window.screen.width}x${window.screen.height}`, // 屏幕分辨率
    browser: `${browser.name} ${browser.version}`, // 浏览器
    os: `${os.name}`, // 操作系统
    device: `${device.vendor} ${device.model}`, // 设备
  });
}

export function initSentry(app, router) {
  Sentry.init({
    app,
    dsn: sentry_dsn,
    environment: mode,

    // Vue 特定配置
    attachProps: true,
    logErrors: true,
    trackComponents: true,
    hooks: ['activate', 'mount', 'update'],

    // 集成配置
    integrations: [
      Sentry.browserTracingIntegration({
        router
      }),
      Sentry.replayIntegration({
        // 由于是内部项目，不需要隐藏信息
        maskAllText: false,
        blockAllMedia: false,
        // 记录所有控制台日志
        maskAllInputs: false
      })
    ],

    // 采样率配置
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,

    // 在发送事件前添加用户信息和上下文
    beforeSend(event) {
      console.log('Sentry meet an error, beforeSend event:', event)
      try {
        const user = getUserFromToken()
        if (user) {
          event.user = user
        }

        event.contexts = {
          ...event.contexts,
          app: {
            version: app_version
          }
        }
        return event
      } catch (error) {
        console.error('Sentry beforeSend error:', error)
        return event
      }
    },
  })
  sentryUserSettings();
  sentryContextSettings();
}

/**
 * @description: 手动上报错误
 * @return {*}
 * @param error
 * @param context
 */
export function reportError(error, context) {
  Sentry.captureException(error, { extra: context })
}

/**
 * @description: 手动上报警告
 * @return {*}
 * @param warning
 * @param context
 */
export function reportWarning(warning, context) {
  Sentry.captureMessage(warning, { extra: context })
}
