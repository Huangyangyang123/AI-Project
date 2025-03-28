import React from 'react'
import { get } from '@/shared'

import { AppstoreOutlined, DiffOutlined, BgColorsOutlined, BulbOutlined } from '@ant-design/icons';

export const icon = (iconEle) => (
  iconEle
)
export const menu = async () => {

  const resources = [
    {
      "id": "11187059925811200",
      "name": "工作组&空间管理",
      "code": null,
      "ids": null,
      "menuIcon": <AppstoreOutlined />,
      "path": "/main/workGroup",
      "paths": null,
      "parentId": null,
      "type": 1,
      "sort": 1,
      "level": 1,
      "children": null,
      "pageIndex": null,
      "pageSize": null
    },{
      "id": "11187059925811201",
      "name": "文档管理",
      "code": null,
      "ids": null,
      "menuIcon": <DiffOutlined />,
      "path": "/main/documentMangement",
      "paths": null,
      "parentId": null,
      "type": 2,
      "sort": 2,
      "level": 2,
      "children": null,
      "pageIndex": null,
      "pageSize": null
    },
    {
      "id": "11187059925811202",
      "name": "模版",
      "code": null,
      "ids": null,
      "menuIcon": <BulbOutlined />,
      "path": "/main/templateChat",
      "paths": null,
      "parentId": null,
      "type": 3,
      "sort": 3,
      "level": 3,
      "children": null,
      "pageIndex": null,
      "pageSize": null
    },
    {
      "id": "11187059925811203",
      "name": "知识库",
      "code": null,
      "ids": null,
      "menuIcon": <BgColorsOutlined />,
      "path": "/main/chat",
      "paths": null,
      "parentId": null,
      "type": 4,
      "sort": 4,
      "level": 4,
      "children": null,
      "pageIndex": null,
      "pageSize": null
    }
  ]
  return resources
}