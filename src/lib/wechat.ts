// ---------------------------------------------------------------------------
// 微信内置浏览器检测（移植自姊妹项目 survival 的「微信四层防御」）。
//
// 为什么单独做检测：小红书买家大量从微信里点链接进入 H5，而微信 webview
// 对部分网络/下载/复制行为有额外限制——跨域验证请求可能被静默拦截（尤其
// 首次请求）、长按复制链接也可能失败。四层防御（顶部预警横幅 / verifyServer
// 自动重试 / Unlock 页引导文案 / 发码台交付话术提醒）都以此为开关。
// ---------------------------------------------------------------------------

/**
 * 是否在微信/QQ 内置 webview 中打开。
 * 微信 webview 的 UA 恒带 `MicroMessenger`，QQ 内置浏览器带 `QQ/`——
 * 二者行为限制一致，故沿用 survival 的同款判定，一并覆盖。
 * @param ua 默认取当前 navigator.userAgent，显式传参便于测试
 */
export function isWeChatBrowser(ua: string = navigator.userAgent): boolean {
  return /MicroMessenger|QQ\//i.test(ua)
}
