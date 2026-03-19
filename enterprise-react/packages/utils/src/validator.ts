/**
 * 常用校验工具函数
 */

/** 邮箱 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** 手机号（中国大陆） */
export function isPhone(value: string): boolean {
  return /^1[3-9]\d{9}$/.test(value);
}

/** URL */
export function isURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** 身份证号（简单校验） */
export function isIdCard(value: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(
    value,
  );
}

/** 纯数字字符串 */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/** 空值检测（null / undefined / '' / [] / {}） */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
}

/** 密码强度（0-4） */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

/**
 * 链式校验器
 * @example
 * const result = createValidator('test@invalid')
 *   .required('邮箱不能为空')
 *   .email('邮箱格式不正确')
 *   .validate()
 */
export function createValidator(value: string) {
  const errors: string[] = [];

  const self = {
    required(msg = '此字段不能为空') {
      if (isEmpty(value)) errors.push(msg);
      return self;
    },
    email(msg = '邮箱格式不正确') {
      if (value && !isEmail(value)) errors.push(msg);
      return self;
    },
    phone(msg = '手机号格式不正确') {
      if (value && !isPhone(value)) errors.push(msg);
      return self;
    },
    minLength(min: number, msg?: string) {
      if (value.length < min) errors.push(msg ?? `最少 ${min} 个字符`);
      return self;
    },
    maxLength(max: number, msg?: string) {
      if (value.length > max) errors.push(msg ?? `最多 ${max} 个字符`);
      return self;
    },
    pattern(regex: RegExp, msg = '格式不正确') {
      if (value && !regex.test(value)) errors.push(msg);
      return self;
    },
    validate() {
      return { valid: errors.length === 0, errors };
    },
  };

  return self;
}
