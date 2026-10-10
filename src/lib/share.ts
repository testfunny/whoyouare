/* 路由 / 编码 / 复制 工具 */

export function parseHash(): { path: string; params: URLSearchParams } {
  const h = location.hash.replace(/^#/, '') || '/'
  const qi = h.indexOf('?')
  const path = qi === -1 ? h : h.slice(0, qi)
  const params = new URLSearchParams(qi === -1 ? '' : h.slice(qi + 1))
  return { path: path || '/', params }
}

export function nav(path: string): void {
  location.hash = path
}

export function fullUrl(path: string): string {
  return location.href.split('#')[0] + '#' + path
}

export function enc(obj: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let bin = ''
  bytes.forEach(b => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function dec<T>(s: string | null | undefined): T | null {
  if (!s) return null
  try {
    const b = s.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b + '='.repeat((4 - (b.length % 4)) % 4)
    const bin = atob(pad)
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    return null
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}
