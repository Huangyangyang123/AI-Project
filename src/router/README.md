## 约定式路由

约定式路由也叫文件路由，就是不需要手写配置，文件系统即路由，通过目录和文件及其命名分析出路由配置。
约定路由起始于 `src/pages` 目录。
比如以下文件结构

```
|--- pages
  |--- index.jsx
  |--- login.jsx
  |--- school
     |--- study.jsx
```
会生成路由配置

```
[
  { exact: true, path: '/', component: '@/pages/index' },
  { exact: true, path: '/login', component: '@/pages/login' },
  { exact: true, path: '/school/study', component: '@/pages/school/study' }
]
```
### Layout
约定目录下有 `_layout.jsx` (除 `/src/pages/` 目录外) 时会生成特殊的嵌套路由，以 `_layout.jsx` 为该目录的 layout。
layout 文件需要返回一个 React 组件，并通过 `props.children` 渲染子组件。
比如以下文件结构
```
|--- pages
  |--- login.jsx
  |--- school
     |--- _layout.jsx
     |--- learn.jsx
     |--- study.jsx
```
会生成路由
```
[
  { exact: true, path: '/login', component: '@/pages/login' },
  { path: '/school', component: '@/pages/school/_layout',
    routes: [
      { path: '/school/learn', component: '@/pages/school/learn' },
      { path: '/school/study', component: '@/pages/school/study' },
    ]
  }
]
```
### 404 路由
约定 `src/pages/404.jsx` 为 404 页面
比如以下文件结构
```
|--- pages
  |--- login.jsx
  |--- 404.jsx
```
会生成路由
```
[
  { exact: true, path: '/login', component: '@/pages/login' },
  { exact: true, path: '', component: '@/pages/404' }
]
```

404 路由处于数组最后一个，会在其他路由都匹配不上时渲染
### index 特殊处理
约定目录下的 index.jsx 生成路由时需要省略
比如以下文件结构
```
|--- pages
  |--- school
     |--- _layout.jsx
     |--- index.jsx
     |--- study.jsx
  |--- user
     |--- index.jsx
     |--- age.jsx
  |--- login.jsx
```
会生成路由

```
[
  { path: '/school', component: '@/pages/school/_layout',
    routes: [
      { path: '/school', component: '@/pages/school/index' },
      { path: '/school/study', component: '@/pages/school/study' }
    ]
  },
  { exact: true, path: '/user', component: '@/pages/user/index'},
  { exact: true, path: '/user/age', component: '@/pages/user/age' },
  { exact: true, path: '/login', component: '@/pages/login' },
]
```