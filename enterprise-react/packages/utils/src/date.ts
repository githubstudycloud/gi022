/**
 * 日期工具函数
 * 轻量级，不依赖 dayjs / date-fns
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * 格式化日期
 * @example formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
 */
export function formatDate(date: Date | number | string, pattern = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number, len = 2) => String(n).padStart(len, '0');

  return pattern
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()));
}

/**
 * 相对时间（中文）
 * @example relativeTime(Date.now() - 3600000) // '1小时前'
 */
export function relativeTime(date: Date | number | string): string {
  const now = Date.now();
  const target = new Date(date).getTime();
  const diff = now - target;

  if (diff < MINUTE) return '刚刚';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}分钟前`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}小时前`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}天前`;

  return formatDate(date);
}

/**
 * 判断是否同一天
 */
export function isSameDay(a: Date | number | string, b: Date | number | string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/**
 * 获取某月的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 日期范围生成
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return result;
}
