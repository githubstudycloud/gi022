/**
 * 基于 Web Crypto API 的加密工具
 */

/** AES-GCM 加密 */
export async function aesEncrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cryptoKey = await importKey(key)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encoder.encode(text),
  )

  const result = new Uint8Array([...iv, ...new Uint8Array(encrypted)])
  return btoa(String.fromCharCode(...result))
}

/** AES-GCM 解密 */
export async function aesDecrypt(ciphertext: string, key: string): Promise<string> {
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0))
  const iv = data.slice(0, 12)
  const encrypted = data.slice(12)
  const cryptoKey = await importKey(key)

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, encrypted)
  return new TextDecoder().decode(decrypted)
}

async function importKey(rawKey: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(rawKey.padEnd(32, '0').slice(0, 32))
  return crypto.subtle.importKey('raw', keyData, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

/** SHA-256 哈希（用于签名、校验） */
export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(text))
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** 生成随机字符串 */
export function generateNonce(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(array, (b) => chars[b % chars.length]).join('')
}
