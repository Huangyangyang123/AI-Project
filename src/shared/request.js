import { extend } from 'umi-request'
import { message } from 'antd'
import { startProgress, stopProgress } from './progress'
import { downloadFileFromBlob, getType, filterEmpty } from './util'
import { REQUEST_PREFIX, PORTAL_API } from './constant'

const errorMessage = '系统繁忙，请稍后再试'
const codeMessage = {
  400: '发出的请求有误',
  403: '暂无权限',
  404: '请求地址不存在',
  500: errorMessage,
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

const getContentDispositionInfo = (headers) => {
    const info = {}
    const contentDisposition = headers.get('content-disposition') ?? ''
    contentDisposition
      .split(';')
      .map((i) => i.trim())
      .forEach((i) => {
        const [key, value] = i.split('=')
        info[key] = value
      })
    return info
}

const request = extend({
    prefix: REQUEST_PREFIX,
    timeout: 10 * 1000,
    getResponse: true,
    errorHandler: (error) => {
      const { response, name } = error
      const { status, statusText } = response || {}
      const headers = new Headers(response?.headers)
      const redirect = headers.get('redireturl')
      // SAML重定向，去登录
      if (redirect && status === 401) {
        const relayState = location.origin + `?redirectUrl=${encodeURIComponent(location.href)}`
        let url = decodeURIComponent(
          encodeURIComponent(`${redirect}&RelayState=${encodeURIComponent(relayState)}`)
        )
        location.href = url
        return
      }
      if (status) {
        message.error(codeMessage[status] || statusText || errorMessage)
      } else if (name === 'CustomerError' || error.message) {
        message.error(error.message)
      } else if (!response) {
        message.error('您的网络发生异常，无法连接服务器')
      }
      stopProgress()
      throw error
    },
  })

// 中间件，portal的服务路径去掉/uds，（适应后端需求）
request.use(async (ctx, next) => {
  if (PORTAL_API.includes(ctx.req.url.replace(REQUEST_PREFIX, ''))) {
    ctx.req.url = ctx.req.url.replace('/uds', '')
  }
  await next()
})

// 中间件，文件下载，统一处理返回数据
request.use(async (ctx,next)=>{
    if (ctx.req.url.indexOf('/file/uploadfile') != -1) {
        ctx.req.options.timeout = 900 * 1000
      }
      const { downloadFile } = ctx.req.options
      if (downloadFile) {
        ctx.req.options.responseType = 'blob'
      }
    await next()
    const { req, res } = ctx
    const { data, response } = res
    const cd = getContentDispositionInfo(response.headers)
    if ('attachment' in cd) {
        return downloadFileFromBlob(data, cd.filename)
    }
    let errorData
    if (downloadFile) {
        // responseType='blob' 获取文件的文本
        errorData = JSON.parse(await new Response(data).text())
    } else {
        errorData = data
    }
    const { message, retCode, data: dataValue } = errorData
    const { dataLevel = 'pure', skipErrorMessage = false } = req.options
    if (retCode !== 10000) {
        const error = new Error(message || errorMessage)
        error.name = 'CustomerError'
        if (!skipErrorMessage) {
        throw error
        }
    }
    ctx.res = dataLevel !== 'pure' ? data : dataValue
})

// 中间件，统一过滤空字段
request.use(async (ctx, next) => {
    const { filterEmptyData = true, data } = ctx.req.options
    if (filterEmptyData && data) {
      const fullData = filterEmpty(data)
      if (Object.keys(fullData).length || getType(fullData) === 'formdata') {
        ctx.req.options.data = fullData
      } else {
        delete ctx.req.options.data
      }
    }
    await next()
})
// 中间件统一添加token
request.use(async (ctx, next) => {
    const headers = ctx.req.options.headers
    const token = localStorage.getItem('token')
    if (token) {
      ctx.req.options.headers = {
        ...headers,
        'X-HSBC-E2E-Trust-Token': token,
        'X-HSBC-Global-Tenant-Id': 'HXN',
        // 和后端i联调
        // 'X-HSBC-Pinnacle-UDS-StaffId': '45372692',
      }
    }
    // /** 联调后台本地 */
    // ctx.req.options.headers = {
    //   ...headers,
    //   'X-HSBC-Pinnacle-UDS-Role': 'InfoDir-PinnacleUDS-DEV-ADMIN',
    //   'X-HSBC-Pinnacle-UDS-StaffId': '45305757',
    // }
    await next()
  })

  // 中间件，统一处理loading，防止重复提交表单
request.use(async (ctx, next) => {
    const { url } = ctx.req.options
    startProgress(url.includes('/query') ? { delay: 500 } : { freeze: true })
    await next()
    stopProgress()
  })
  function get(url, params, config) {
    console.warn(`项目约定统一使用 post 形式，请确认接口：${url} `)
    return request.get(url, { ...config, params })
  }
  function post(url, data, config){
    return request.post(url, { ...config, data })
  }
  export { request, get, post }
  




