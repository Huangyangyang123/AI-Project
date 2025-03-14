import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout, Menu, Input } from 'antd'
import { message } from 'antd'

// import type { SubMenuType } from 'antd/lib/menu/hooks/useItems'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { action } from 'mobx'

import { observer } from 'mobx-react-lite'
import { menu, icon } from '../../router/menu'
import { globalStore } from '../../store/global'

import { toPath,getNodeFromTree,getNodePathFromTree,logout,toLogin } from '../../shared'

import Watermark from '@/components/Watermark'
// import logoImg from '../../assets/logo.svg'
// import userImg from '../../assets/user.svg'
import './_layout.less'


const { Sider, Header, Content } = Layout

const getUserName = () => {
  const firstName = localStorage.getItem('firstName') ?? ''
  const lastName = localStorage.getItem('lastName') ?? ''
  return lastName + ' ' + firstName
}
/**
 * 
 * @param {any} name 
 * @returns 
 */
const getStorage = (name) => {
  return localStorage.getItem(name) ?? ''
}
/**
 * 
 * @param {String} label 
 * @param {String} key 
 * @param {React.ReactNode} icon 
 * @param {MenuItemC} children 
 * @returns 
 */
function getItem(label,key,icon,children) {
    return {
      key,
      icon: undefined, // 隐藏菜单图标
      children,
      label,
    }
  }

  const genMenuKey = (menus) => {
    function doGen(menus, parentKey = '') {
      return menus.map((i) => {
        if (i.children) {
          return {
            ...i,
            icon: i.menuIcon ? icon(i.menuIcon) : '',
            key: `${parentKey}/${i.name}`,
            children: doGen(i.children, `${parentKey}/${i.name}`),
          }
        }
        return {
          ...i,
          icon: i.menuIcon ? icon(i.menuIcon) : '',
          key: `${parentKey}/${i.name}`,
        }
      })
    }
    return doGen(menus, '')
  }

  const menuWithKey = genMenuKey(await menu())

  const items = (menuWithKey) => {
    return menuWithKey.map((i) => {
      return getItem(i.name, i.key || '', i.icon || '', i.children && items(i.children))
    })
  }

  const MENU_ITEMS = items(menuWithKey)

  const SideMenu = (menuProps) => {
    return (
      <Menu
        {...menuProps}
        mode='inline'
        className='menu'
        onClick={({ key }) => {
          const { path = '' } = getNodeFromTree(key, menuWithKey, 'key') || {}
        //   if (path.includes('https://')) {
        //     // 增加绿喵【https://】地址类型的三方跳转地址判断条件
        //     window.open(path)
        //   } else {
        //     location.hash = '#' + path
        //   }
          location.hash = '#' + path
        }}
      />
    )
  }

  function hightLightLabel(menu, label, searchText) {
    const idx = label.indexOf(searchText)
    if (idx == -1) {
      return menu.label
    }
    return (
      <>
        {(menu.label).substring(0, idx)}
        <span style={{ background: 'yellow' }}>
          {(menu.label).substring(idx, idx + searchText.length)}
        </span>
        {(menu.label).substring(idx + searchText.length)}
      </>
    )
  }

  function searchMenuItems(menus,searchText,openKeys){
    const result = []
    if(menus?.length){
        menus.forEach(menu=>{
            const matchedSubMenuItems = searchMenuItems(
                menu.children,
                searchText,
                openKeys
              )
              const label = (menu.label).toLowerCase()
              if (!menu.children) {
                if (label.includes(searchText)) {
                  result.push({
                    ...menu,
                    label: hightLightLabel(menu, label, searchText),
                  })
                }
              } else if (matchedSubMenuItems.length || label.includes(searchText)) {
                if (matchedSubMenuItems.length) {
                  openKeys.push(menu.key)
                }
                result.push({
                  ...menu,
                  label: hightLightLabel(menu, label, searchText),
                  children: matchedSubMenuItems.length ? matchedSubMenuItems : menu.children,
                })
              }
        })
    }

    return result
  }

  const Aside = observer((props)=>{
    const [searchText, setSearchText] = useState('')
    const [menuItems, setMenuItems] = useState(MENU_ITEMS)
    const [openKeys, setOpenKeys] = useState([])

    function onSearchTextChange(ev) {
        const text = ev.target.value
        setSearchText(text)
        const searchText = text.trim().toLowerCase()
        if (searchText) {
          const openKeys = []
          const menus = searchMenuItems(MENU_ITEMS, searchText, openKeys)
          setMenuItems(menus)
          setOpenKeys(openKeys)
        } else {
          setMenuItems(MENU_ITEMS)
        }
    }

    return (
        <Sider
        className='layout-sider'
        trigger={null}
        collapsible
        breakpoint='md'
        onBreakpoint={action((broken) => (globalStore.menuCollapsed = broken))}
        collapsed={globalStore.menuCollapsed}
        width={240}>
        <div className='sider-top'>
            < img />
            <span>汇丰金科</span>
        </div>
        <div className='sider-menu-search'>
            <Input
            allowClear
            value={searchText}
            onChange={onSearchTextChange}
            prefix={<SearchOutlined />}
            placeholder='菜单搜索'
            />
        </div>
        <SideMenu
            openKeys={openKeys}
            selectedKeys={[(props.currentMenu && props.currentMenu.key) || '']}
            items={menuItems}
            onOpenChange={setOpenKeys}
        />
        <div className='sider-bottom'>
            <MenuToggle />
            {globalStore.hasLogin && <span onClick={logout}>退出登录</span>}
        </div>
        </Sider>
    )
  })

  const MenuToggle = observer(() => {
    const toggleMenu = action(() => {
      globalStore.menuCollapsed = !globalStore.menuCollapsed
    })
    return globalStore.menuCollapsed ? (
      <MenuUnfoldOutlined onClick={toggleMenu} />
    ) : (
      <MenuFoldOutlined onClick={toggleMenu} />
    )
  })

  const PageLocation = (props) => {
    const path = getNodePathFromTree(props.currentMenu?.name ?? '', menuWithKey, 'name')
    const list = path.reduce(
      (prev, cur, idx) =>
        idx !== path.length - 1 ? [...prev, cur.name, '/'] : [...prev, cur.name],
      []
    )
    const pathList = list.map((i, idx) => <span key={i + idx}>{i}</span>)
    const detail =
      pathList.length > 1 ? <div className='detail'> {props.currentMenu?.key?.substr(1)} </div> : null
    return (
      <div className='layout-location'>
        {detail}
        <div className='title'>{props.currentMenu?.name}</div>
      </div>
    )
  }



export default function MainLayout(props){
    
  const location = useLocation()
  const currentMenu = getNodeFromTree(location.pathname, menuWithKey, 'path')
  const [ready, setReady] = useState(false)
  // 返回所有带有children的id
  const getAllChildrenId = (data) => {
    return data.reduce((a, b) => {
      let res = [...a, b.path]
      if (b.children) res = [...res, ...getAllChildrenId(b.children)]
      return res
    }, [])
  }

  useEffect(() => {
    const arr = getAllChildrenId(menuWithKey).filter((item) => item != null && item != 'null')
    // if (
    //   !arr.includes(location.pathname) &&
    //   location.pathname != '/main' &&
    //   location.pathname != '/login'
    // ) {
    //   message.error('抱歉，你暂无此页面访问权限')
    //   toPath('/403')
    // }
    // 接口文档地址：https://wpb-confluence.systems.uk.hsbc/display/WPBP/01.02.14.01.01.00.QueryDropDownList
    // post('/stationsms/querydropdownlist')
    //   .then((data = {}) => {
    //     Object.keys(data).forEach((key) => {
    //       ENUM[key] = (data[key] ?? []).map((i) => ({
    //         label: i.value,
    //         value: i.id,
    //         parent: i.parent ?? '',
    //       }))
    //     })
    //   })
    //   .finally(() => setReady(true))
  }, [currentMenu, location])

  //登录页面不设置
  if (globalStore.hasLogin) {
    //设置水印
    Watermark.setWaterMark({
      w_texts: [`${getStorage('staffID')} ${getUserName()}`, getStorage('loginDate')],
    })
  }


  return (
    <Layout className='p-layout'>
      <Aside currentMenu={currentMenu} />
      <Layout>
        <Header className='layout-header'>
          {/* <div className='nav' onClick={() => toLogin()}>
            <SwapOutlined />
            汇丰汇选
          </div> */}
          <div className='items'>
            <div className='header-item'>
              < img src='' />
              <span>{getUserName()}</span>
            </div>
          </div>
        </Header>
        <Content>
          <PageLocation currentMenu={currentMenu} />
          <div className='layout-main'>{ready && props.children}</div>
        </Content>
      </Layout>
    </Layout>
  )
}