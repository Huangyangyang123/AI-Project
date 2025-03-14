import { observable } from 'mobx'
const globalStore = observable({
  hasLogin: false,
  menuCollapsed: false,
})
export { globalStore }