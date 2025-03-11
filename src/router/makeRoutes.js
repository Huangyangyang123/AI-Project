import React from "react";

// `import.meta.glob` 是一个 Vite 独有的功能而不是一个 Web 或 ES 标准
const modules = import.meta.glob('../pages/**/*.{jsx,tsx}')
const blackList = ['components', 'component', 'util', 'utils']
const layoutFileName = '_layout'

const flatRoutes = Object.keys(modules)
  .map((i) => {
    const fullPath = i.match(/\/pages(.+)\.[jt]sx/)?.[1].toLowerCase() || ''
    const parentPath = fullPath.slice(0, fullPath.lastIndexOf('/'))
    const module = modules[i]
    return {
      fullPath,
      parentPath,
      path: fullPath || '/',
      deep: parentPath.split('/').length,
      component: React.lazy(module),
    }
  })
  .filter((i) => !blackList.some((j) => i.fullPath.includes(j)))

  let layouts = flatRoutes
  .filter((i) => i.fullPath.includes(layoutFileName))
  // 容器层级向上提1
  .map((i) => ({ ...i, deep: i.deep - 1 }))
  // 按路径长度升序
  .sort((a, b) => a.deep - b.deep)

  let rest = flatRoutes.filter((i) => !i.fullPath.includes(layoutFileName))
  layouts.forEach((layout) => {
    const routes = rest.filter((j) => j.parentPath === layout.parentPath)
    rest = rest.filter((j) => j.parentPath !== layout.parentPath)
    if (routes.length) {
      layout.routes = routes
    }
    layout.path = layout.path.replace('/' + layoutFileName, '')
  })

  function layouts2RouteJson(layouts){
    const root = (path = '') => path.split('/')[1]
    const add2Leaf = (route, value) => {
        const doAdd = (route) => {
        if (value.deep === route.deep + 1) {
            route.routes ? route.routes.push(value) : (route.routes = [value])
        } else {
            const item = (route.routes || []).find((i) => value.path.startsWith(i.path))
            if (item) {
            item.routes ? item.routes.push(value) : (item.routes = [value])
            } else {
            route.routes ? route.routes.push(value) : (route.routes = [value])
            }
        }
        }
        doAdd(route)
    }
    let i = 0
    let j = 1
    while (layouts[i] && layouts[j]) {
      if (root(layouts[i].parentPath) === root(layouts[j].parentPath)) {
        // 将后一项合并至前一项
        add2Leaf(layouts[i], layouts[j])
        layouts.splice(j, 1)
      } else {
        if (j < layouts.length - 1) {
          j += 1
        } else {
          i += 1
          j = i + 1
        }
      }
    }
    layouts.forEach((i) => {
      const nest = rest.filter((j) => j.path.startsWith(i.path))
      nest.forEach((j) => add2Leaf(i, j))
      rest = rest.filter((j) => !j.path.startsWith(i.path))
    })
  }

  function notFoundRoute() {
    const index = rest.findIndex((i) => /^\/404(\/index)?$/.test(i.path))
    if (index < 0) return
    const removed = rest.splice(index, 1)
    removed[0].path = ''
    rest = [...rest, ...removed]
  }

  function indexRouteOmit(routes) {
    routes.forEach((i) => {
      i.path = i.path.replace(/\/index/, '')
      if (i.routes?.length) {
        indexRouteOmit(i.routes)
      }
    })
  }

layouts2RouteJson(layouts)
notFoundRoute()
const routes = [...layouts, ...rest]
indexRouteOmit(routes)

export { routes }