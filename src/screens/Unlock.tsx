import { useState } from 'react'
import { checkCode, deviceId, setUnlocked, verifyServer, CodeSeries } from '../lib/codes'
import { isWeChatBrowser } from '../lib/wechat'
import { nav } from '../lib/share'
import { track } from '@vercel/analytics'

const COPY: Record<CodeSeries, { title: string; product: string; perks: string[]; ph: string }> = {
  hid: {
    title: '解锁隐藏人格完整版报告',
    product: '「隐藏人格·完整版兑换码」',
    perks: ['五模块完整报告（含成因分析/关系切片/阴影预警）', '你的开关 + 使用建议', 'MBTI 隐藏配置', '附录：你一定说过的话 + 本周练习 + 同类档案室', '专属完整版精致海报'],
    ph: 'HY-XXXX-XXXX-XXXX-XXXX'
  },
  cf: {
    title: '解锁暴富时间表完整版',
    product: '「暴富体质·完整版兑换码」',
    perks: ['暴富人格侧写（动态分析你的决策模式）', '平行暴富时间表（选对全对的你，含逐题解析）', '完整错过清单', '陷阱题逐题深挖', '同开局通关秘籍', '改命模拟器 + 账本先生逐年底账'],
    ph: 'CF-XXXX-XXXX-XXXX-XXXX'
  }
}

export default function Unlock({ params }: { params: URLSearchParams }) {
  const series: CodeSeries = params.get('p') === 'cf' ? 'cf' : 'hid'
  const copy = COPY[series]
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  // 微信内置浏览器对复制/部分请求有限制：提前给一句「去浏览器打开」的引导（层3）
  const [inWeChat] = useState(() => isWeChatBrowser())

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setErr('')
    // 服务端验证优先:一码一设备,防截图转发;本地哈希比对作兜底(存量码/服务未配/断网)
    const server = await verifyServer(code, series, deviceId())
    if (server.kind === 'used_other_device') {
      setBusy(false)
      try { track('unlock_fail', { series, reason: 'used_other_device' }) } catch { /* ignore */ }
      setErr('该兑换码已在其他设备使用。一码仅限一台设备，如非本人操作请联系店铺客服')
      return
    }
    const ok = server.kind === 'ok' || (await checkCode(code, series))
    setBusy(false)
    if (ok) {
      setUnlocked(series)
      try { track('unlock_success', { series }) } catch { /* ignore */ }
      let back = '/'
      try { back = sessionStorage.getItem('wy_return') || '/' } catch { /* ignore */ }
      nav(back)
    } else {
      try { track('unlock_fail', { series }) } catch { /* ignore */ }
      setErr('兑换码无效，请检查后重试（不区分大小写和横杠）')
    }
  }

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className="unlock-wrap fade-in">
        <div className="hero" style={{ paddingTop: 10 }}>
          <div className="kicker">UNLOCK · 完整版</div>
          <h1 style={{ fontSize: 26 }}>{copy.title}</h1>
        </div>

        <div className="unlock-card">
          <h2>输入兑换码</h2>
          <div className="hint">
            获取方式：小红书店铺「whoyouare测试所」购买{copy.product}，
            收货后凭卡密在下方输入。一次解锁，长期有效，可解锁：
            {copy.perks.map((s, i) => <span key={i}><br />· {s}</span>)}
            {inWeChat && <><br />微信内如遇解锁失败，请复制链接到浏览器打开</>}
          </div>
          <input
            className="code-input"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder={copy.ph}
            maxLength={30}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
          />
          <div className="unlock-err">{err}</div>
          <button className="btn primary" onClick={submit} disabled={busy}>
            {busy ? '验证中…' : '解锁完整版'}
          </button>
        </div>

        <div className="foot-note">兑换码不区分大小写与横杠 · 如遇失效请联系店铺客服</div>
      </div>
    </>
  )
}
