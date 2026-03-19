/**
 * 格式化工具函数
 */

/**
 * 数字千分位格式化
 * @example formatNumber(1234567.89) // '1,234,567.89'
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = 'zh-CN',
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * 货币格式化
 * @example formatCurrency(1234.5) // '¥1,234.50'
 */
export function formatCurrency(
  value: number,
  currency = 'CNY',
  locale = 'zh-CN',
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

/**
 * 文件大小格式化
 * @example formatFileSize(1024 * 1024) // '1.00 MB'
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 字符串截断
 * @example truncate('Hello World', 8) // 'Hello...'
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * 驼峰 → 连字符
 */
export function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * 连字符 → 驼峰
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * 深度克隆（结构化克隆）
 */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * 防抖
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval: number,
): (...args: Parameters<T>) => void {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}
