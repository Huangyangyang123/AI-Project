import { getEnv } from '@/shared'
export const toLogin = (to = '', env = getEnv()) => {
  if (import.meta.env.DEV) env = 'localhost'
  /** 登录地址 */
  let path = {
    localhost: 'http://localhost:3000/#/login',
    // dev: 'https://mobileapp-uds-frontend-dev.pinnacle-mobileapp.dev.ali.cloud.cn.hsbc/#/login',
    // sit: 'https://mobileapp-uds-frontend-sit.pinnacle-mobileapp.dev.ali.cloud.cn.hsbc/#/login',
    // oat: 'https://mobileapp-uds-frontend-oat.pinnacle-mobileapp.dev.ali.cloud.cn.hsbc/#/login',
    // uat: 'https://mobileapp-uds-frontend-uat.pinnacle-mobileapp.dev.ali.cloud.cn.hsbc/#/login',
    // prod: 'https://mobileapp-uds-frontend.pinnacle-mobileapp.prod.ali.cloud.cn.hsbc/#/login',
  }[env]
  let url = new URL(path || '')
  if (to) {
    url.searchParams.set('to', to)
  }
  console.log('跳转到登录地址', url.href)
  window.location.replace(url.href)
}