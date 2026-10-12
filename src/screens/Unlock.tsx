import { useState } from 'react'
import { checkCode, setUnlocked, CodeSeries } from '../lib/codes'
import { nav } from '../lib/share'
import { track } from '@vercel/analytics'

const COPY: Record<CodeSeries, { title: string; product: string; perks: string[]; ph: string }> = {
  hid: {
    title: '解锁隐藏人格完整版报告',
    product: '「隐藏人格·完整版兑换码」',
    perks: ['隐藏人格完整解读', '你的开关 + 使用建议', 'MBTI 隐藏配置', '完整版精致海报'],
    ph: 'HY-XXXX-XXXX-XXXX-XXXX'
  },
  cf: {
    title: '解锁暴富时间表完整版',
    product: '「暴富体质·完整版兑换码」',
    perks: ['平行暴富时间表（选对全对的你）', '完整错过清单', '陷阱题逐题解析'],
    ph: 'CF-XXXX-XXXX-XXXX-XXXX'
  }
}

export default function Unlock({ params }: { params: URLSearchParams }) {
  const series: CodeSeries = params.get('p') === 'cf' ? 'cf' : 'hid'
  const copy = COPY[series]
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (busy) return
    setBusy(true)
    setErr('')
    const ok = await checkCode(code, series)
    setBusy(false)
    if (ok) {
      setUnlocked(series)
      try { track('unlock_success', { series }) } catch { /* ignore */ }
      let back = '/'
      try { back = sessionStorage.getItem('wy_return') || '/' } catch { /* ignore */ }
      nav(back)
    } else {
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
            收货后凭卡密在下方输入。一次解锁，永久有效，可解锁：
            {copy.perks.map((s, i) => <span key={i}><br />· {s}</span>)}
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
