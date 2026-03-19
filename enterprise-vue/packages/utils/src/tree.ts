import type { TreeNode } from '@enterprise/types'

/**
 * 列表转树形结构
 */
export function listToTree<T extends { id: string | number; parentId?: string | number | null }>(
  list: T[],
  rootId: string | number | null = null,
  idKey = 'id',
  parentKey = 'parentId',
): (T & { children?: T[] })[] {
  const map = new Map(list.map((item) => [item[idKey as keyof T], { ...item, children: [] as T[] }]))

  const roots: (T & { children?: T[] })[] = []

  for (const item of map.values()) {
    const parentId = item[parentKey as keyof typeof item]
    if (parentId === rootId || parentId === null || parentId === undefined) {
      roots.push(item)
    } else {
      const parent = map.get(parentId as string | number)
      if (parent) {
        ;(parent as T & { children: T[] }).children.push(item as T)
      }
    }
  }

  return roots
}

/**
 * 树形结构转列表
 */
export function treeToList<T extends { children?: T[] }>(tree: T[]): Omit<T, 'children'>[] {
  const result: Omit<T, 'children'>[] = []
  const queue = [...tree]
  while (queue.length > 0) {
    const node = queue.shift()!
    const { children, ...rest } = node
    result.push(rest as Omit<T, 'children'>)
    if (children?.length) queue.push(...children)
  }
  return result
}

/**
 * 查找树节点
 */
export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
): T | null {
  for (const node of tree) {
    if (predicate(node)) return node
    if (node.children?.length) {
      const found = findTreeNode(node.children as T[], predicate)
      if (found) return found
    }
  }
  return null
}

/**
 * 获取节点路径
 */
export function getTreePath<T extends TreeNode>(
  tree: T[],
  id: string | number,
): T[] {
  const path: T[] = []

  function dfs(nodes: T[]): boolean {
    for (const node of nodes) {
      path.push(node)
      if (node.id === id) return true
      if (node.children?.length && dfs(node.children as T[])) return true
      path.pop()
    }
    return false
  }

  dfs(tree)
  return path
}
