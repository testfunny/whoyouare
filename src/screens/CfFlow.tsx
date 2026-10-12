import { useEffect, useRef, useState } from 'react'
import { CF_IDENTITIES, CF_QS, cfMoney, cfWorthLine, butlerSay } from '../data/cf'
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
  const [flash, setFlash] = useState('')
  const [stashVal, setStashVal] = useState(0)
  const [money, setMoney] = useState(0)
  const [butler, setButler] = useState('')
  const [shake, setShake] = useState(false)
  const [nextTease, setNextTease] = useState(false)
  const restoredId = raw != null
  const finalRef = useRef<number[]>([])
  const dispRef = useRef(0)

  /* 身家数字滚动动画 */
  useEffect(() => {
    if (!stashVal) return
    const from = dispRef.current || 0
    const t0 = performance.now()
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / 480)
      const v = Math.round(from + (stashVal - from) * p * (2 - p))
      dispRef.current = v
      setMoney(v)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [stashVal])

  const identity = idIdx != null ? CF_IDENTITIES[idIdx] : null
  const qs = identity ? identity.seq.map(id => CF_QS[id]).filter(Boolean) : []

  if (!identity) {
    return <Draw onPick={i => { try { sessionStorage.setItem('wy_cf_id', String(i)) } catch { /* ignore */ } setIdIdx(i); setStashVal(CF_IDENTITIES[i].stash) }} />
  }

  const q = qs[idx]

  const calcStash = (list: number[]) => {
    // 与结果页 cfScore 完全同源：整条链算完再钳制，不做逐步下限
    let v = identity.stash
    list.forEach((oi, qi) => {
      const qq = qs[qi]
      if (!qq) return
      const mx = Math.max(...qq.opts.map(o => o.pts))
      v = v * (0.4 + (qq.opts[oi].pts / mx) * 1.45)
    })
    return Math.max(100, Math.round(v))
  }

  const pick = (oi: number) => {
    if (busy || sel !== null) return
    setSel(oi)
    buzz(8)
    setBusy(true)
    setFlash(q.opts[oi].tl)
    const nextList = [...answers, oi]
    const nextStash = calcStash(nextList)
    setStashVal(nextStash)
    const mx = Math.max(...q.opts.map(o => o.pts))
    setButler(butlerSay(!!q.opts[oi].trap, !!q.opts[oi].god, q.opts[oi].pts / mx))
    if (nextList.length < qs.length) {
      window.setTimeout(() => setNextTease(true), 420)
    }
    if (q.opts[oi].trap) {
      setShake(true)
      setTimeout(() => setShake(false), 480)
    }
    setTimeout(() => {
      setSel(null)
      setBusy(false)
      setFlash('')
      if (nextList.length < qs.length) {
        setAnswers(nextList)
        setNextTease(false)
        setIdx(i => i + 1)
      } else {
        finalRef.current = nextList
        setShowGen(true)
      }
    }, 650)
  }

  const back = () => {
    if (idx > 0 && !busy) {
      const rest = answers.slice(0, -1)
      setAnswers(rest)
      setIdx(i => i - 1)
      setStashVal(calcStash(rest))
      setButler('')
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
        {restoredId && answers.length === 0 && (
          <div className="restore-note">📋 已恢复你上次抽到的开局「{identity.name}」· 账本从头记起</div>
        )}
        <div style={{ textAlign: 'center' }}>
          <div className={`ledger-strip${shake ? ' shake' : ''}`}>
            <span className="ls-label">身家账本</span>
            <span className="ls-amount">{cfMoney(money)}</span>
            <span className="ls-caption">{cfWorthLine(money, identity.id)}</span>
          </div>
          {butler && <div className="butler-note">{butler}</div>}
        </div>
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
        {flash && <div className="reveal-flash">🕰 时间轴 +1：{flash}</div>}
        {nextTease && qs[idx + 1] && <div className="next-tease">⏪ 翻页中 · 下一站 {qs[idx + 1].year}年 · {qs[idx + 1].label.replace('第?题 · ', '')}</div>}
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
