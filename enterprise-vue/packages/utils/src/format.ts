import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期时间
 */
export function formatDate(
  date: string | number | Date,
  format = 'YYYY-MM-DD HH:mm:ss',
): string {
  return dayjs(date).format(format)
}

/**
 * 相对时间
 */
export function fromNow(date: string | number | Date): string {
  return dayjs(date).fromNow()
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化金额（人民币）
 */
export function formatCurrency(
  amount: number,
  currency = 'CNY',
  locale = 'zh-CN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num: number, locale = 'zh-CN'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * 手机号脱敏
 */
export function maskPhone(phone: string): string {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 邮箱脱敏
 */
export function maskEmail(email: string): string {
  return email.replace(/(.{2}).+(@.+)/, '$1****$2')
}

/**
 * 身份证脱敏
 */
export function maskIdCard(id: string): string {
  return id.replace(/(\d{4})\d{10}(\w{4})/, '$1**********$2')
}
