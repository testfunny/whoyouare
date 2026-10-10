import { useEffect, useRef, useState } from 'react'
import { ZH_QS } from '../data/zh'
import { HID_QS } from '../data/hid'
import { enc, nav } from '../lib/share'
import { TestId } from '../data/types'
import { ProgressCells } from '../components/ui'
import GenLoading from '../components/GenLoading'

function buzz() {
  try { navigator.vibrate && navigator.vibrate(8) } catch { /* ignore */ }
}

export default function Quiz({ testId, params }: { testId: TestId; params: URLSearchParams }) {
  const qs = testId === 'zh' ? ZH_QS : HID_QS
  const storeKey = `wy_quiz_${testId}`
  const c = params.get('c')

  const saved = (() => {
    try {
      const raw = sessionStorage.getItem(storeKey)
      const arr = raw ? JSON.parse(raw) : null
      if (Array.isArray(arr) && arr.length > 0 && arr.length < qs.length) return arr as number[]
    } catch { /* ignore */ }
    return [] as number[]
  })()

  const [answers, setAnswers] = useState<number[]>(saved)
  const [idx, setIdx] = useState(saved.length)
  const [sel, setSel] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [showGen, setShowGen] = useState(false)
  const finalRef = useRef<number[]>([])

  const q = qs[idx]

  const save = (a: number[]) => {
    try { sessionStorage.setItem(storeKey, JSON.stringify(a)) } catch { /* ignore */ }
  }

  const finish = (final: number[]) => {
    finalRef.current = final
    save(final)
    setShowGen(true)
  }

  const pick = (oi: number) => {
    if (busy || sel !== null) return
    setSel(oi)
    buzz()
    setBusy(true)
    setTimeout(() => {
      const next = [...answers, oi]
      setSel(null)
      setBusy(false)
      if (next.length < qs.length) {
        setAnswers(next)
        setIdx(i => i + 1)
      } else {
        finish(next)
      }
    }, 260)
  }

  const back = () => {
    if (idx > 0 && !busy) {
      const rest = answers.slice(0, -1)
      setAnswers(rest)
      setIdx(i => i - 1)
      save(rest)
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
          <span>{q.sub || `第 ${idx + 1} 题`}</span>
          <span>{idx + 1} / {qs.length}</span>
        </div>
        <ProgressCells total={qs.length} done={idx} zh={testId === 'zh'} />
      </div>

      <div className="q-card slide-in" key={`q${idx}`}>
        <div className="q-sub">{q.sub || ''}</div>
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
          <div className="q-hint">点选项即作答 · 选错可返回上一题修改</div>
        )}
      </div>

      {showGen && (
        <GenLoading
          testId={testId}
          onDone={() => {
            try { sessionStorage.removeItem(storeKey) } catch { /* ignore */ }
            nav(`/result/${testId}?d=${enc(finalRef.current)}${c ? `&c=${c}` : ''}`)
          }}
        />
      )}
    </>
  )
}
