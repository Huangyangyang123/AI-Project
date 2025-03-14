import React from 'react'
import ReactDOM from 'react-dom'
import { ConfigProvider, message } from 'antd'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isBetween from 'dayjs/plugin/isBetween'
import zhCN from 'antd/lib/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { observer } from 'mobx-react-lite'

import './styles/main.less'

import App from './App'
import AliveMonitor from './components/AliveMonitor'
import { globalStore } from './store/global'
import { beforeCreateApp, logout } from './shared'

message.config({ maxCount: 1 })
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(isBetween)

const Monitor = observer(() => {
  const aliveDuration = 10 * 60 * 1000 // 10分钟
  return globalStore.hasLogin ? <AliveMonitor duration={aliveDuration} onDie={logout} /> : null
})

function render() {
  ReactDOM.render(
    <React.StrictMode>
      {/* <Monitor /> */}
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

beforeCreateApp().finally(render)
