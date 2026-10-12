import { useEffect, useState } from 'react'
import { ZH_QS, ZH_CP, ZH_DIMS } from '../data/zh'
import { scoreZH, zhRankContrast } from '../lib/scoring'
import { renderZHPoster } from '../lib/poster'
import { dec, enc, nav, copyText, fullUrl } from '../lib/share'
import PosterModal from '../components/PosterModal'
import { Reveal, StatBars, Typewriter, archiveNo } from '../components/ui'
import NextTests from '../components/NextTests'

export default function ResultZh({ params }: { params: URLSearchParams }) {
  const d = dec<number[]>(params.get('d'))
  const [poster, setPoster] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!d || d.length !== ZH_QS.length) nav('/')
  }, [d])

  if (!d || d.length !== ZH_QS.length) return null

  const r = scoreZH(d)
  const cp = dec<{ t: string; d: string }>(params.get('c'))
  const rel = cp?.d ? (ZH_CP[`${cp.d}|${r.top2[0]}`] || ZH_CP[`${r.top2[0]}|${cp.d}`]) : null

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const showPoster = () => setPoster(renderZHPoster(r.mg, r.rankName, r.rankQuip, r.mg.subs, r.dims))

  const shareCP = async () => {
    const link = fullUrl(`/quiz/zh?c=${enc({ t: 'zh', d: r.top2[0] })}`)
    const ok = await copyText(`我在宫斗命格测试测出了「${r.mg.name}」！来跟我组局，测你们的宫斗关系 → ${link}`)
    flash(ok ? '链接已复制，去粘贴给好友' : '复制失败，请手动截图')
  }

  const statItems = ['ye', 'ren', 'cai', 'xing'].map(k => ({
    label: ZH_DIMS[k],
    v: Math.max(14, Math.min(98, Math.round((r.dims[k] || 0) * 10)))
  }))

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className="result-hero fade-in" data-char={r.mg.name.slice(0, 1)}>
        <div className="kicker">宫斗命格 · 测定完毕</div>
        <h1>{r.mg.name}</h1>
        <div className="hook">{r.mg.title}</div>
        <div className="arch">档案编号 {archiveNo(d.join(','), '存字')} · 敬事房存档</div>
      </div>

      {rel && (
        <div className="cp-card fade-in">
          <div className="c-names">你的好友是「{cp!.d === 'ye' ? '野心' : cp!.d === 'ren' ? '隐忍' : cp!.d === 'cai' ? '口才' : '清醒'}」系选手 · 你们是——</div>
          <h3>{rel.name}</h3>
          <p>{rel.line}</p>
        </div>
      )}

      <Reveal>
        <div className="section">
          <div className="s-title">圣旨 · 判词（逐字宣读）</div>
          <div className="feng"><Typewriter text={r.mg.feng} /></div>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">四维命格属性</div>
          <StatBars items={statItems} />
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--sub)' }}>属性由你的 8 次选择判定 · 主副维度决定命格</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">甄学段位 · 考级结果</div>
          <div className="rank-strip">
            <div className="seal">{r.rankName.slice(0, 2)}</div>
            <div>
              <div className="r-name">{r.rankName} · 进阶答对 {r.xue}/3 · 深梗命中 {r.eggs}/5</div>
              <div className="r-quip">{r.rankQuip}</div>
            </div>
          </div>
          <p style={{ marginTop: 10, fontSize: 13, color: '#ffd166' }}>{zhRankContrast(r)}</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">你的宫斗结局</div>
          <p>{r.mg.ending}</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">核心武器</div>
          <div className="weapon">
            <div className="w-char">{r.mg.weapon.char}</div>
            <p>{r.mg.weapon.desc}</p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">生存策略 · 两条</div>
          {r.mg.tactics.map((t, i) => (
            <p key={i} style={{ marginBottom: 8 }}>{i + 1}. {t}</p>
          ))}
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
            {r.mg.subs.map((s, i) => <span className="chip gold" key={i}>{s}</span>)}
          </div>
        </div>
      </Reveal>

      <NextTests exclude="zh" />

      <div className="actions fade-in">
        <button className="btn primary" onClick={showPoster}>保存命格圣旨海报</button>
        <button className="btn ghost" onClick={shareCP}>拉好友测你们的宫斗关系</button>
        <button className="btn ghost" onClick={() => nav('/quiz/zh')}>再测一次</button>
      </div>

      {poster && <PosterModal url={poster} onClose={() => setPoster(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
