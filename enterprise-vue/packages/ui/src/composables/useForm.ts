import { ref, reactive } from 'vue'

type Rules<T> = {
  [K in keyof T]?: Array<{
    required?: boolean
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (value: T[K]) => string | null
    message?: string
  }>
}

/**
 * 通用表单管理 Composable
 */
export function useForm<T extends Record<string, unknown>>(initialValues: T, rules?: Rules<T>) {
  const model = reactive<T>({ ...initialValues })
  const errors = reactive<Partial<Record<keyof T, string>>>({})
  const submitting = ref(false)

  function validate(): boolean {
    let valid = true
    if (!rules) return true

    for (const key of Object.keys(rules) as Array<keyof T>) {
      const fieldRules = rules[key]
      if (!fieldRules) continue

      for (const rule of fieldRules) {
        const value = model[key]

        if (rule.required && (value === null || value === undefined || value === '')) {
          errors[key] = rule.message ?? `${String(key)} 不能为空`
          valid = false
          break
        }

        if (rule.min && typeof value === 'string' && value.length < rule.min) {
          errors[key] = rule.message ?? `最少 ${rule.min} 个字符`
          valid = false
          break
        }

        if (rule.max && typeof value === 'string' && value.length > rule.max) {
          errors[key] = rule.message ?? `最多 ${rule.max} 个字符`
          valid = false
          break
        }

        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
          errors[key] = rule.message ?? '格式不正确'
          valid = false
          break
        }

        if (rule.validator) {
          const err = rule.validator(value as T[keyof T])
          if (err) {
            errors[key] = err
            valid = false
            break
          }
        }

        delete errors[key]
      }
    }
    return valid
  }

  function reset(): void {
    Object.assign(model, initialValues)
    for (const key of Object.keys(errors)) delete errors[key as keyof T]
  }

  async function submit(handler: (data: T) => Promise<void>): Promise<boolean> {
    if (!validate()) return false
    submitting.value = true
    try {
      await handler({ ...model } as T)
      return true
    } finally {
      submitting.value = false
    }
  }

  return { model, errors, submitting, validate, reset, submit }
}
