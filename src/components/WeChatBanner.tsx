import { useState } from 'react'
import { isWeChatBrowser } from '../lib/wechat'

const DISMISS_KEY = 'wy_wx_banner_dismissed'

/**
 * 微信内置浏览器顶部预警横幅（四层防御 · 层1，口径同 survival）：
 * 检测到微信/QQ 环境时在页面顶部提示「如遇无法打开/复制失败，
 * 点右上角···选择在浏览器打开」；手动关闭后本次会话（sessionStorage）
 * 不再显示，下次新开会话仍会提醒一次。
 */
export default function WeChatBanner() {
  const [inWeChat] = useState(() => isWeChatBrowser())
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1' } catch { return false }
  })

  if (!inWeChat || dismissed) return null

  const close = () => {
    setDismissed(true)
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
  }

  return (
    <div className="wx-banner" role="note">
      <span className="wx-banner-text">
        微信内打开：如遇页面无法打开 / 复制失败，点右上角「···」选择「在浏览器打开」
      </span>
      <button className="wx-banner-close" aria-label="关闭提示" onClick={close}>×</button>
    </div>
  )
}
