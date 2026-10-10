import { useRef, useState } from 'react'
import { CF_IDENTITIES, CF_QS } from '../data/cf'
import { enc, nav } from '../lib/share'
import { ProgressCells } from '../components/ui'
import GenLoading from '../components/GenLoading'

function buzz(ms: number) {
  try { navigator.vibrate && navigator.vibrate(ms) } catch { /* ignore */ }
}

function Draw({ onPick }: { onPick: (i: number) => void }) {
  const [flipped, setFlipped] = useState<number | null>(null)
  const [shaking, setShaking] = useState(false)

  const draw = () => {
    if (shaking) return
    setShaking(true)
    setTimeout(() => {
      setFlipped(Math.floor(Math.random() * CF_IDENTITIES.length))
      setShaking(false)
      buzz(12)
    }, 480)
  }

  const it = flipped != null ? CF_IDENTITIES[flipped] : null

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className="result-hero fade-in" style={{ paddingBottom: 0 }}>
        <div className="kicker">TIME TRAVEL · 穿越通道已打开</div>
        <h1 style={{ fontSize: 27 }}>先抽你的穿越身份</h1>
        <div className="hook">
          1998年的下岗工人、2005年的毕业生、手里只有5000块的普通人…<br />
          命运给你发的是哪个剧本？
        </div>
      </div>

      {it == null ? (
        <div className={`cf-card fade-in${shaking ? ' shaking' : ''}`} onClick={draw}>
          <div className="q-mark">❓</div>
          <div className="c-hint">{shaking ? '命运的盲盒正在洗牌…' : <>点一下，抽你的穿越剧本<br />不满意可以换一张</>}</div>
        </div>
      ) : (
        <>
          <div className="cf-card flipped" key={flipped}>
            <div className="cf-year">{it.year} 年</div>
            <div className="cf-name">{it.name}</div>
            <div className="cf-stash">开局 · {it.stashText}</div>
            <div className="cf-desc">{it.desc}</div>
            <div className="cf-tease">⚠ 本剧本埋了 3 道陷阱题 · 别怪命运没提醒你</div>
          </div>
          <div style={{ maxWidth: 320, margin: '18px auto 0' }}>
            <div className="actions">
              <button className="btn primary" onClick={() => onPick(flipped)}>就这个身份，开测</button>
              <button className="btn ghost" onClick={() => setFlipped(null)}>换一张</button>
            </div>
          </div>
        </>
      )}

      <div className="foot-note">回答当年每个财富节点的选择题 · 换个开局重测体验完全不同</div>
    </>
  )
}

export default function CfFlow() {
  const raw = (() => {
    try { return sessionStorage.getItem('wy_cf_id') } catch { return null }
  })()
  const [idIdx, setIdIdx] = useState<number | null>(raw == null ? null : Number(raw))

  const [answers, setAnswers] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [showGen, setShowGen] = useState(false)
  const finalRef = useRef<number[]>([])

  const identity = idIdx != null ? CF_IDENTITIES[idIdx] : null
  const qs = identity ? identity.seq.map(id => CF_QS[id]).filter(Boolean) : []

  if (!identity) {
    return <Draw onPick={i => { try { sessionStorage.setItem('wy_cf_id', String(i)) } catch { /* ignore */ } setIdIdx(i) }} />
  }

  const q = qs[idx]

  const pick = (oi: number) => {
    if (busy || sel !== null) return
    setSel(oi)
    buzz(8)
    setBusy(true)
    setTimeout(() => {
      const next = [...answers, oi]
      setSel(null)
      setBusy(false)
      if (next.length < qs.length) {
        setAnswers(next)
        setIdx(i => i + 1)
      } else {
        finalRef.current = next
        setShowGen(true)
      }
    }, 260)
  }

  const back = () => {
    if (idx > 0 && !busy) {
      setAnswers(a => a.slice(0, -1))
      setIdx(i => i - 1)
    }
  }

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
        {idx > 0 && <button className="back" onClick={back}>← 上一题</button>}
      </div>

      <div className="progress-wrap" key={`p${idx}`}>
        <div className="progress-label">
          <span>{identity.year}年 · {identity.name} · {q.label}</span>
          <span>{idx + 1} / {qs.length}</span>
        </div>
        <ProgressCells total={qs.length} done={idx} zh={false} />
      </div>

      <div className="q-card slide-in" key={`q${idx}`}>
        <div className="q-sub ticket">⏪ 穿越至 {q.year} 年</div>
        <div className="q-text">{q.q}</div>
      </div>

      <div className="opts slide-in" key={`o${idx}`}>
        {q.opts.map((o, i) => (
          <button
            className={`opt${sel === i ? ' sel' : ''}`}
            key={i}
            style={sel !== null && sel !== i ? { opacity: 0.45, transition: 'opacity .2s' } : undefined}
            onClick={() => pick(i)}
          >
            <span className="key">{'ABCD'[i]}</span>{o.t}
          </button>
        ))}
        {idx === 0 && answers.length === 0 && (
          <div className="q-hint">凭当年的直觉选 · 选错可返回修改</div>
        )}
      </div>

      {showGen && (
        <GenLoading
          testId="cf"
          onDone={() => {
            try { sessionStorage.removeItem('wy_cf_id') } catch { /* ignore */ }
            nav(`/result/cf?d=${enc(finalRef.current)}&i=${idIdx}`)
          }}
        />
      )}
    </>
  )
}
