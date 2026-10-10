import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/** 滚动进入视口时渐入（子组件内的 .s-fill 属性条与 .seal 印章会被 .on 触发动画） */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          el.classList.add('on')
          io.disconnect()
        }
      }
    }, { threshold: 0.12 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className="rv" style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

export interface StatItem {
  label: string
  /** 0-100 */
  v: number
  /** 右侧数值文案，默认显示 v */
  hint?: string
}

export function StatBars({ items }: { items: StatItem[] }) {
  return (
    <div className="stats">
      {items.map((it, i) => (
        <div className="stat" key={i}>
          <div className="s-row">
            <b>{it.label}</b>
            <span>{it.hint ?? it.v}</span>
          </div>
          <div className="s-track">
            <div className="s-fill" style={{ '--w': `${it.v}%` } as CSSProperties} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProgressCells({ total, done, zh }: { total: number; done: number; zh: boolean }) {
  return (
    <div className={`cells${zh ? ' zh' : ''}`}>
      {Array.from({ length: total }).map((_, i) => (
        <i key={i} className={i < done ? 'lit' : ''} />
      ))}
    </div>
  )
}

/** 打字机逐字显示；text 变化时从头重播；轻触立即显示全文 */
export function Typewriter({ text, speed = 36, className }: { text: string; speed?: number; className?: string }) {
  const [prev, setPrev] = useState(text)
  const [n, setN] = useState(0)
  if (prev !== text) {
    setPrev(text)
    setN(0)
  }
  const done = n >= text.length

  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setN(v => Math.min(v + 1, text.length)), speed)
    return () => clearTimeout(t)
  }, [n, done, text, speed])

  return (
    <span className={className} onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {!done && <span className="tw-caret" />}
    </span>
  )
}

/** 由答案生成稳定档案编号，如 存字-3F2A */
export function archiveNo(seed: string, prefix: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return `${prefix}-${h.toString(16).toUpperCase().padStart(8, '0').slice(0, 4)}`
}
