import React, { Children } from 'react'
import { get } from '@/shared'
export const icon = (src) => (
  <span style={{ paddingTop: '1px' }}>
    < img src={src} />
  </span>
)
export const menu = async () => {
  const resources = [
    {
      "id": "11272107578916864",
      "name": "测试文件",
      "code": "operation",
      "ids": null,
      "menuIcon": null,
      "path": null,
      "paths": null,
      "parentId": "1",
      "type": 0,
      "sort": 20,
      "level": 1,
      children:[
        {
          "id": "10711834179821568",
          "name": "我的",
          "code": "messageManage",
          "ids": null,
          "menuIcon": null,
          "path": "null",
          "paths": null,
          "parentId": "11272107578916864",
          "type": 0,
          "sort": 20,
          "level": 2,
          children:[
            {
              "id": "11187059925811200",
              "name": "我的测试页面",
              "code": null,
              "ids": null,
              "menuIcon": null,
              "path": "/main/domain/index",
              "paths": null,
              "parentId": "10711834179821568",
              "type": 1,
              "sort": 20,
              "level": 3,
              "children": null,
              "pageIndex": null,
              "pageSize": null
            }
          ]
        }
      ]
    }
  ]
  return resources
}