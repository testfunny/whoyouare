import { useEffect, useState } from 'react'
import { HID_QS, HID_CP } from '../data/hid'
import { scoreHID } from '../lib/scoring'
import { renderHIDPoster } from '../lib/poster'
import { isUnlocked, setUnlocked } from '../lib/codes'
import { dec, enc, nav, copyText, fullUrl } from '../lib/share'
import PosterModal from '../components/PosterModal'
import { Reveal, StatBars, archiveNo } from '../components/ui'
import NextTests from '../components/NextTests'

const FAMILY_NAME: Record<string, string> = {
  fire: '情绪浓度系',
  ice: '人间清醒系',
  wind: '社交灵活系'
}

export default function ResultHid({ params }: { params: URLSearchParams }) {
  const d = dec<number[]>(params.get('d'))
  const [poster, setPoster] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [unlocked, setUnlockedState] = useState(isUnlocked())

  useEffect(() => {
    if (!d || d.length !== HID_QS.length) nav('/')
  }, [d])

  if (!d || d.length !== HID_QS.length) return null

  const r = scoreHID(d)
  const L = r.label

  const cp = dec<{ t: string; f: string }>(params.get('c'))
  const rel = cp?.f ? (HID_CP[`${cp.f}|${L.family}`] || HID_CP[`${L.family}|${cp.f}`]) : null

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const goUnlock = () => {
    try { sessionStorage.setItem('wy_return', location.hash) } catch { /* ignore */ }
    nav('/unlock')
  }

  const shareCP = async () => {
    const link = fullUrl(`/quiz/hid?c=${enc({ t: 'hid', f: L.family, l: L.id })}`)
    const ok = await copyText(`我测出了「${L.name}」！来测你的隐藏人格，顺便看我们是什么关系局 → ${link}`)
    flash(ok ? '链接已复制，去粘贴给好友' : '复制失败，请手动截图')
  }

  const hidPreview = L.hidden.slice(0, 26)

  const axisItems = ([['EN', 'IN', '社交', '独处'], ['EM', 'IC', '外放', '内收'], ['DO', 'TH', '行动', '谋定'], ['PL', 'ED', '讨好', '边界']] as [string, string, string, string][])
    .map(([a, b, na, nb]) => {
      const pa = r.poles[a] || 0
      const pb = r.poles[b] || 0
      const pct = Math.round((pa / ((pa + pb) || 1)) * 100)
      return { label: `${na} ↔ ${nb}`, v: pct, hint: `${pct} : ${100 - pct}` }
    })

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className={`result-hero fade-in family hh-${L.family}`} data-char={L.name.slice(0, 1)}>
        <div className="kicker">隐藏人格 · 测定完毕</div>
        <h1>{L.name}</h1>
        <div className="hook">{L.hook}</div>
        <div className="arch">档案编号 {archiveNo(d.join(','), 'HID')} · {FAMILY_NAME[L.family]}存档</div>
      </div>

      {rel && (
        <div className="cp-card fade-in">
          <div className="c-names">你的好友是「{FAMILY_NAME[cp!.f] || cp!.f}」选手 · 你们是——</div>
          <h3>{rel.name}</h3>
          <p>{rel.line}</p>
        </div>
      )}

      <Reveal>
        <div className="section">
          <div className="s-title">第一层 · 表面人设</div>
          <p>{L.surface}</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">人格四轴</div>
          <StatBars items={axisItems} />
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--sub)' }}>由你的 8 次选择判定 · 决定你的结果标签</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">证据 · 为什么是你</div>
          <ul className="evidence">
            {r.ev.map((e, i) => (
              <li key={i}><b>第{e.q}题</b>「{e.opt}」——{e.text}</li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">你的副标签</div>
          <div className="chips">
            {L.subs.map((s, i) => <span className="chip" key={i}>{s}</span>)}
          </div>
        </div>
      </Reveal>

      {unlocked ? (
        <>
          <Reveal>
            <div className="section">
              <div className="s-title">第二层 · 隐藏人格（完整版）</div>
              <p>{L.hidden}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">第三层 · 你的开关（完整版）</div>
              <p>{L.sw}</p>
              <p style={{ marginTop: 10, color: '#ffd166' }}>{L.tip}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">MBTI 隐藏配置</div>
              <p>{L.mbti}</p>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <div className="section">
            <div className="s-title">第二 · 三层 · 完整版</div>
            <div className="locked">
              <div className="blur-zone">
                <p>{hidPreview}……你怕的从来不是……</p>
                <p>完整解读：这层人格如何在你的关系和职场里发作…</p>
                <p>你的开关：当有人……</p>
                <p>MBTI 隐藏配置 ≈ ██▓▓…</p>
                <p>专属完整版海报：档案卡双面样式…</p>
              </div>
              <div className="lock-overlay">
                <div className="l-title">🔒 隐藏人格 + 你的开关 + MBTI 配置</div>
                <div className="l-sub">小红书店铺购买「完整版兑换码」后输入即可<br />一次解锁，永久有效</div>
                <button className="btn primary small" onClick={goUnlock}>输入兑换码解锁完整版</button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <NextTests exclude="hid" />

      <div className="actions fade-in">
        <button className="btn primary" onClick={() => setPoster(renderHIDPoster(L, unlocked, r.poles))}>
          {unlocked ? '保存完整版海报' : '保存结果海报'}
        </button>
        <button className="btn ghost" onClick={shareCP}>拉好友测你们的CP关系局</button>
        <button className="btn ghost" onClick={() => nav('/quiz/hid')}>再测一次</button>
      </div>

      {poster && <PosterModal url={poster} onClose={() => setPoster(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
