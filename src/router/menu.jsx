import React from 'react'
import { get } from '@/shared'

import { AppstoreOutlined } from '@ant-design/icons';

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
      "parentId": "10711834179821568",
      "type": 1,
      "sort": 20,
      "level": 3,
      "children": null,
      "pageIndex": null,
      "pageSize": null
    }
  ]
  return resources
}