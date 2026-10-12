import { CODE_HASHES } from '../data/codes.gen'
import { CODE_HASHES as CODE_HASHES_CF } from '../data/codes_cf.gen'

export type CodeSeries = 'hid' | 'cf'

const SERIES: Record<CodeSeries, { hashes: string[]; key: string }> = {
  hid: { hashes: CODE_HASHES, key: 'wy_unlocked' },
  cf: { hashes: CODE_HASHES_CF, key: 'wy_unlocked_cf' }
}

/** 归一化：全角→半角、去空格/横杠/零宽字符、统一大写（防手机输入法坑） */
export function normalizeCode(s: string): string {
  let t = ''
  for (const ch of s) {
    const c = ch.codePointAt(0)!
    if (c === 0x3000) { t += ' '; continue }
    if (c >= 0xff01 && c <= 0xff5e) { t += String.fromCharCode(c - 0xfee0); continue }
    t += ch
  }
  return t.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

/** 校验兑换码（哈希比对，明文码不在前端包里） */
export async function checkCode(input: string, series: CodeSeries = 'hid'): Promise<boolean> {
  const n = normalizeCode(input)
  if (n.length < 8) return false
  const h = await sha256Hex(n)
  return SERIES[series].hashes.includes(h)
}

export function isUnlocked(series: CodeSeries = 'hid'): boolean {
  try { return localStorage.getItem(SERIES[series].key) === '1' } catch { return false }
}

export function setUnlocked(series: CodeSeries = 'hid'): void {
  try { localStorage.setItem(SERIES[series].key, '1') } catch { /* ignore */ }
}
