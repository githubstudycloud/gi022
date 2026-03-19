/**
 * 类型安全的 localStorage / sessionStorage 封装
 */

export interface StorageOptions {
  /** 过期时间（毫秒） */
  expires?: number;
  /** 存储类型 */
  type?: 'local' | 'session';
}

interface StorageItem<T> {
  value: T;
  expires?: number;
}

function getStorage(type: 'local' | 'session'): Storage {
  return type === 'local' ? localStorage : sessionStorage;
}

/**
 * 存储数据
 */
export function setItem<T>(key: string, value: T, options: StorageOptions = {}): void {
  const { expires, type = 'local' } = options;
  const item: StorageItem<T> = {
    value,
    ...(expires ? { expires: Date.now() + expires } : {}),
  };
  getStorage(type).setItem(key, JSON.stringify(item));
}

/**
 * 读取数据（自动处理过期）
 */
export function getItem<T>(key: string, type: 'local' | 'session' = 'local'): T | null {
  const raw = getStorage(type).getItem(key);
  if (!raw) return null;

  try {
    const item = JSON.parse(raw) as StorageItem<T>;
    if (item.expires && Date.now() > item.expires) {
      getStorage(type).removeItem(key);
      return null;
    }
    return item.value;
  } catch {
    return null;
  }
}

/**
 * 删除数据
 */
export function removeItem(key: string, type: 'local' | 'session' = 'local'): void {
  getStorage(type).removeItem(key);
}

/**
 * 清空所有数据
 */
export function clearStorage(type: 'local' | 'session' = 'local'): void {
  getStorage(type).clear();
}

/**
 * 创建带命名空间的 Storage 实例
 */
export function createStorage(namespace: string, type: 'local' | 'session' = 'local') {
  const prefix = (key: string) => `${namespace}:${key}`;

  return {
    set: <T>(key: string, value: T, options?: Omit<StorageOptions, 'type'>) =>
      setItem(prefix(key), value, { ...options, type }),
    get: <T>(key: string) => getItem<T>(prefix(key), type),
    remove: (key: string) => removeItem(prefix(key), type),
    clear: () => clearStorage(type),
  };
}
