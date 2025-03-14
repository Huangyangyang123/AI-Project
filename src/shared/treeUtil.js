/**
 * 获取树中某节点的完整路径
 * @param {any} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @example
 */
const getNodePathFromTree = (id,tree=[],idKey='id',childrenKey='children')=>{
    const root = {
        data: { [childrenKey]: tree, [idKey]: Symbol('uniqueId') },
        level: 0,
      }
      let stack = [root]
      let path = []
      while (stack.length) {
        const item = stack.pop()
        const { data, level } = item
        if (path.length && level <= path[path.length - 1].level) {
          path = path.filter((i) => i.level < level)
        }
        path.push(item)
        if (data[idKey] === id) {
          path.shift()
          return path.map((i) => i.data)
        }
        const children = data[childrenKey] || []
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push({ data: children[i], level: level + 1 })
        }
      }
      return []
}

/**
 * 获取树中某节点
 * @param {any} id 节点ID
 * @param {array} tree 树
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @example
 */

const getNodeFromTree = (id,tree=[],idKey='id',childrenKey='children')=>{
    let stack = [{ [childrenKey]: tree, [idKey]: Symbol('uniqueId') }]
    while (stack.length) {
      const item = stack.pop()
      if (item[idKey] === id) {
      return item
      }
      const children = item[childrenKey] || []
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
      }
    }
    return null
}

/**
 * 获取树中所有叶子节点
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 * @example
 */
const getLeavesFromTree = (tree = [], childrenKey = 'children')=>{
    let stack = [{ [childrenKey]: tree }]
    let leaves = []
    while (stack.length && tree.length) {
        const item = stack.pop()
        const children = item[childrenKey] || []
        if (!children.length) {
        leaves.push(item)
        }
        for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i])
        }
    }
    return leaves
}

/**
 * 获取树中所有叶子节点
 * @param {array} tree 树
 * @param {string} childrenKey 子节点字段名
 * @example
 */
const treeToFlat = (tree=[],childrenKey='children')=>{
  let stack = [{ [childrenKey]: tree }]
  let flat = []
  while (stack.length) {
    const item = stack.pop()
    const children = item[childrenKey] || []
    flat.push(item)
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i])
    }
  }
  flat.shift()
  return flat
}

/**
 * 一维数组转树结构
 * @param {array} flat 一维数组
 * @param {string} idKey id字段名
 * @param {string} childrenKey 子节点字段名
 * @param {string} parentKey 父节点字段名
 * @example
 */

const flatToTree = (flat = [],idKey = 'id',childrenKey = 'children',parentKey = 'parentId')=>{
    let copyFlat = [...flat]
    let tree = []
    for (let i = 0; i < copyFlat.length; i++) {
      // 找出每一项的父节点，并将其作为父节点的 children
      for (let j = 0; j < copyFlat.length; j++) {
        if (copyFlat[i][parentKey] === copyFlat[j][idKey]) {
          if (!copyFlat[j][childrenKey]) {
            copyFlat[j][childrenKey] = []
          }
          copyFlat[j][childrenKey].push(copyFlat[i])
        }
      }
      // 根节点
      if (!copyFlat[i][parentKey]) {
        tree.push(copyFlat[i])
      }
    }
    return tree
}

export { getNodePathFromTree, getNodeFromTree, getLeavesFromTree, treeToFlat, flatToTree } 
