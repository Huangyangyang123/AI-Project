import { runInAction } from 'mobx'
import { post } from './request'
import { REQUEST_PREFIX } from './constant'
import { globalStore } from '@/store/global'
import dayjs from 'dayjs'
import React, { useEffect } from 'react'
import Watermark from '@/components/Watermark'
import { toLogin } from '@/shared'

/**
 * 
 * @param {Blob, } data 
 * @param {String} filename 
 * @returns 
 */
const downloadFileFromBlob = (data, filename = '')=>{
  if (!data) return
  const url = URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.download = filename || `${+new Date()}`
  link.click()
  URL.revokeObjectURL(url)
}
/**
 * 
 * @param {any} data 
 * @returns 'string' | 'number' | 'object' | 'array' | 'function' | 'undefined' | 'null' | 'date' | 'regexp' | .....
 */
const getType = (data)=>{
    return Object.prototype.toString.call(data).slice(8, -1).toLowerCase()
}
/**
 * 过滤掉空字段
 * @param {any} data 
 */
const filterEmpty = (data)=>{
  const type = getType(data)
  if (type === 'array') {
    return data.map(() => filterEmpty(i))
  }
  if (type === 'object') {
    let res = {}
    Object.keys(data).forEach((key) => {
      const value = data[key]
      if (!isEmpty(value)) {
        res[key] = filterEmpty(value)
      }
    })
    return res
  }
  return data
}

/**
 * 当前代码所在环境
 */
const getEnv = ()=>{
  const origin = window.location.origin
  if (origin.includes('prod')) return 'prod' // 汇丰uat 是预生产
  if (origin.includes('uat')) return 'uat'
  if (origin.includes('sit')) return 'sit'
  if (origin.includes('oat')) return 'oat'
  if (origin.includes('dev') || origin.includes('localhost')) return 'dev'
  return 'prod'
}

/**
 * 
 * @param {String} name  要获取的参数名 若为空 将返回所有参数
 * @param {Object} querys {[key:String]}  要获取的参数名 若为空 将返回所有参数
 */
export const getUrlQuery = (name='')=>{
  let querys = {}
  location.search
    .substr(1)
    .split('&')
    .filter((i) => i)
    .forEach((i) => (querys[i.split('=')[0]] = i.split('=')[1]))
  // console.log(name ? querys[name] : querys)
  return name ? querys[name] : querys
}

export const isMac = ()=>{
  const macKeys = ['Mac']
  return macKeys.some((i) => navigator.userAgent.includes(i))
}

export const beautyScrollbar = ()=>{
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerText = `
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(50, 50, 50, 0.3);
    border-radius: 1em;
  }
  `
  document.head.appendChild(style)
}

export const beforeCreateApp = async()=>{
  const querys = getUrlQuery()
  if (!isMac()) {
    beautyScrollbar()
  }
  console.debug('rest', querys)
  if (querys) {
    const { redirectUrl, ...rest } = querys
    if (redirectUrl) {
      //设置用户登录时间到本地
      localStorage.setItem('loginDate', dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'))
      Object.keys(rest).forEach((key) => {
        localStorage.setItem(key, decodeURIComponent(rest[key]))
      })
      location.replace(decodeURIComponent(redirectUrl))
      return
    }
  }
  runInAction(() => {
    globalStore.hasLogin = !!localStorage.getItem('token')
  })
}

//退出登录删除水印
export async function logout() {
  await post('/adgroup/ssoAuth/logout')
  localStorage.clear()
  // toPath('/login')
  toLogin()
  runInAction(() => {
    globalStore.hasLogin = false
    Watermark.removeWatermark()
  })
}

export const toPath = (path='/')=>{
  location.hash = `#${path}`
}


export {downloadFileFromBlob, getType, filterEmpty, getEnv}