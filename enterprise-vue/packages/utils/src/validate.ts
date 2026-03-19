/**
 * 常用正则校验
 */

export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ID_CARD: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  IP: /^(\d{1,3}\.){3}\d{1,3}$/,
  POSTAL_CODE: /^\d{6}$/,
  CHINESE: /^[\u4e00-\u9fa5]+$/,
  /** 密码：8-20位，含大小写字母和数字 */
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,20}$/,
} as const

export const isPhone = (v: string) => REGEX.PHONE.test(v)
export const isEmail = (v: string) => REGEX.EMAIL.test(v)
export const isIdCard = (v: string) => REGEX.ID_CARD.test(v)
export const isUrl = (v: string) => REGEX.URL.test(v)
export const isChinese = (v: string) => REGEX.CHINESE.test(v)
export const isStrongPassword = (v: string) => REGEX.PASSWORD.test(v)

/**
 * 非空判断
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

export const isNotEmpty = (value: unknown) => !isEmpty(value)
