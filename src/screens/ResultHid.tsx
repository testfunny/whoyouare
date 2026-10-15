import { useEffect, useState } from 'react'
import { HID_QS, HID_CP, HID_VIBES, HID_LABELS } from '../data/hid'
import { PRICES } from '../data/prices'
import { scoreHID } from '../lib/scoring'
import { renderHIDPoster } from '../lib/poster'
import { isUnlocked, setUnlocked } from '../lib/codes'
import { dec, enc, nav, copyText, fullUrl } from '../lib/share'
import PosterModal from '../components/PosterModal'
import { Reveal, archiveNo } from '../components/ui'
import NextTests from '../components/NextTests'

const FAMILY_NAME: Record<string, string> = {
  fire: '情绪浓度系',
  ice: '人间清醒系',
  wind: '社交灵活系'
}

/* 人格 emoji 战力条 */
const LABEL_EMOJI: Record<string, string> = {
  danfeng: '😑 ⚔️ 🤯',
  qinglian: '🧠 💘 😵',
  dungan: '🎧 🛡️ 😴',
  gaoqian: '📊 💼 🔒',
  changE: '🎪 🔋 🌙',
  foxi: '🧘 📈 🔥',
  xinruan: '😇 📒 🚪',
  emo: '☀️ 🎭 🌙',
  tuoyan: '⏳ ⚡ ✨',
  duanzi: '🗿 🎤 😂',
  taohao: '😇 🌵 🦔',
  duxing: '🐺 📱 🍲'
}

export default function ResultHid({ params }: { params: URLSearchParams }) {
  const d = dec<number[]>(params.get('d'))
  const [poster, setPoster] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [unlocked, setUnlockedState] = useState(isUnlocked())
  /* 附录B · 口头禅命中互动：Hooks 必须在早退 return 之前声明，否则条件 Hooks 违规 */
  const [mirrorHits, setMirrorHits] = useState<boolean[]>(() => {
    const ok = !!d && d.length === HID_QS.length
    return ok ? scoreHID(d).label.mirror.map(() => false) : []
  })

  useEffect(() => {
    if (!d || d.length !== HID_QS.length) nav('/')
  }, [d])

  if (!d || d.length !== HID_QS.length) return null

  const r = scoreHID(d)
  const L = r.label

  /* 预言局对照 */
  const gi = (() => {
    const n = Number(params.get('g'))
    return Number.isInteger(n) && n >= 0 && n < HID_VIBES.length ? n : null
  })()
  const vibe = gi != null ? HID_VIBES[gi] : null
  const prophecyHit = vibe ? vibe.ids.includes(L.id) : false
  /* 完整版字数（真实统计） */
  const reportWords = [L.hidden, L.deep, L.rel[0], L.rel[1], L.rel[2], L.sw, L.tip, L.dark, L.mbti, L.mirror[0], L.mirror[1], L.mirror[2], L.grow[0], L.grow[1], L.grow[2]].join('').length

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

  /* 雷达图几何：四轴菱形 */
  const axisPcts = axisItems.map(a => a.v)
  const RC = 88
  const RR = 70
  const ringPts = (f: number) => [0, 1, 2, 3].map(i => {
    const ang = (-90 + i * 90) * Math.PI / 180
    return `${(RC + RR * f * Math.cos(ang)).toFixed(1)},${(RC + RR * f * Math.sin(ang)).toFixed(1)}`
  }).join(' ')
  const radarPts = axisPcts.map((v, i) => {
    const ang = (-90 + i * 90) * Math.PI / 180
    const rr = (v / 100) * RR
    return { x: RC + rr * Math.cos(ang), y: RC + rr * Math.sin(ang) }
  })
  const AXIS_SHORT = ['社交', '外放', '行动', '讨好']

  /* 隐藏层厚度：四轴极性强度 + 自认知偏差（预言局），确定性可复现 */
  const polarity = Math.round(axisPcts.reduce((s, v) => s + Math.abs(v - 50), 0) / 2)
  let thickness = Math.min(100, Math.round(22 + polarity * 0.9))
  if (gi != null) thickness = Math.min(100, thickness + (prophecyHit ? 6 : 18))
  const thicknessTier = thickness >= 85 ? '厚到能当防弹衣'
    : thickness >= 65 ? '相当有厚度'
    : thickness >= 45 ? '常规厚度'
    : thickness >= 25 ? '偏薄 · 基本透明'
    : '薄如蝉翼 · 明牌型选手'

  /* 同类档案室 */
  const myVibe = HID_VIBES.find(v => v.ids.includes(L.id))
  const sibs = myVibe ? myVibe.ids.filter(id => id !== L.id).slice(0, 2) : []
  const sibLabels = sibs
    .map(id => HID_LABELS.find(x => x.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x)

  /* 附录B · 口头禅命中互动 */
  const hitCount = mirrorHits.filter(Boolean).length
  const mirrorQuip = hitCount >= 3 ? '全中。这份档案就是为你立的案，本案审结。'
    : hitCount === 2 ? '命中率过半——档案可信，建议归档。'
    : hitCount === 1 ? '轻微命中。表面那层没白测。'
    : '一条没中？档案室怀疑你答题时在演别人。'

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className={`result-hero fade-in family hh-${L.family}`} data-char={L.name.slice(0, 1)}>
        <div className="kicker">隐藏人格 · 测定完毕</div>
        <h1>{L.name}</h1>
        <div className="hero-emoji">{LABEL_EMOJI[L.id] || '🎭'}</div>
        <div className="hook">{L.hook}</div>
        <div className="arch">档案编号 {archiveNo(d.join(','), 'HID')} · {FAMILY_NAME[L.family]}存档</div>
      </div>

      {vibe && (
        <Reveal>
          <div className={`section prophecy ${prophecyHit ? 'hit' : 'miss'}`}>
            <div className="kicker">开场预言局 · 结算时刻</div>
            <div className="p-duel">
              <div className={`p-side ${prophecyHit ? '' : 'lose'}`}>
                <i>你的押注</i>
                <b>{vibe.emoji} {vibe.name}</b>
              </div>
              <div className="p-vs">vs</div>
              <div className="p-side">
                <i>实测裁定</i>
                <b>{LABEL_EMOJI[L.id]} {L.name}</b>
              </div>
            </div>
            {prophecyHit ? (
              <>
                <h3>预言命中 ✅</h3>
                <p>你押了「{vibe.name}」，实测确实是这条街的——你对表面人设的认知相当到位。但提醒一句：这一层是免费看的。<b style={{ color: '#ffd166' }}>完整版拆的，是你没押到的那一层。</b></p>
              </>
            ) : (
              <>
                <h3>预言翻车 🎭</h3>
                <p>你押的是「{vibe.name}」，测出来是「{L.name}」。自评和实测之间的这段差距，就是你隐藏层的厚度——<b style={{ color: '#ffd166' }}>完整版专门拆它。</b></p>
              </>
            )}
          </div>
        </Reveal>
      )}

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
          <div className="s-title">人格四轴 · 雷达</div>
          <div className="radar-wrap">
            <svg viewBox="0 0 176 176" role="img" aria-label="人格四轴雷达图">
              {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ringPts(f)} className="radar-ring" />)}
              {[0, 1, 2, 3].map(i => {
                const ang = (-90 + i * 90) * Math.PI / 180
                return <line key={i} x1={RC} y1={RC} x2={RC + RR * Math.cos(ang)} y2={RC + RR * Math.sin(ang)} className="radar-axis" />
              })}
              <polygon points={radarPts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} className="radar-poly" />
              {radarPts.map((p, i) => <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3} className="radar-dot" />)}
              <text x={RC} y={RC - RR - 7} textAnchor="middle" fill="#9b98a3" fontSize="10">{AXIS_SHORT[0]}</text>
              <text x={RC + RR + 5} y={RC + 3} textAnchor="start" fill="#9b98a3" fontSize="10">{AXIS_SHORT[1]}</text>
              <text x={RC} y={RC + RR + 13} textAnchor="middle" fill="#9b98a3" fontSize="10">{AXIS_SHORT[2]}</text>
              <text x={RC - RR - 5} y={RC + 3} textAnchor="end" fill="#9b98a3" fontSize="10">{AXIS_SHORT[3]}</text>
            </svg>
          </div>
          <p className="radar-cap">读数 · 社交 {axisPcts[0]} : {100 - axisPcts[0]} 独处 · 外放 {axisPcts[1]} : {100 - axisPcts[1]} 内收<br />行动 {axisPcts[2]} : {100 - axisPcts[2]} 谋定 · 讨好 {axisPcts[3]} : {100 - axisPcts[3]} 边界</p>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">隐藏层厚度 · 检测</div>
          <div className="meter-tier"><b>{thicknessTier}</b><span style={{ fontSize: 12, color: 'var(--sub)' }}>{thickness} / 100</span></div>
          <div className="meter"><div className="meter-fill" style={{ width: `${thickness}%` }} /></div>
          <p style={{ marginTop: 10, fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.8 }}>
            厚度 = 你四轴的极性强度（偏移指数 {polarity}）{gi != null ? (prophecyHit ? ' + 预言命中修正' : ' + 自认知偏差修正') : ''}。壳越厚，说明表面人设和底下那台机器的差值越大——<b style={{ color: '#ffd166' }}>完整版拆的就是这个差值。</b>
          </p>
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
              <div className="s-title">完整版报告 · 目录</div>
              <p style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                模块一 · 隐藏人格　模块二 · 成因分析　模块三 · 关系切片<br />
                模块四 · 开关与说明　模块五 · 阴影面预警<br />
                附录 · MBTI隐藏配置 / 你一定说过的话 / 本周练习 / 同类档案室
              </p>
              <p style={{ marginTop: 8, fontSize: 12.5, color: '#ffd166', fontWeight: 700 }}>本份报告约 {reportWords} 字 · 按你的答案单独生成</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块一 · 隐藏人格</div>
              <p>{L.hidden}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块二 · 成因分析：这层人格是怎么长出来的</div>
              <p>{L.deep}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块三 · 关系切片：三个场景里的你</div>
              <p><b style={{ color: '#ffd166' }}>职场</b>　{L.rel[0]}</p>
              <p style={{ marginTop: 10 }}><b style={{ color: '#ffd166' }}>朋友</b>　{L.rel[1]}</p>
              <p style={{ marginTop: 10 }}><b style={{ color: '#ffd166' }}>亲密关系</b>　{L.rel[2]}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块四 · 你的开关 & 使用说明</div>
              <p>{L.sw}</p>
              <p style={{ marginTop: 10, color: '#ffd166' }}>{L.tip}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块五 · 阴影面预警</div>
              <div className="shadow-card"><p>{L.dark}</p></div>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">附录A · MBTI 隐藏配置</div>
              <p>{L.mbti}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">附录B · 这些话，你一定说过（点你中过的）</div>
              {L.mirror.map((m, i) => (
                <button
                  key={i}
                  className={`mirror-row${mirrorHits[i] ? ' on' : ''}`}
                  onClick={() => setMirrorHits(h => {
                    const base = h.length === L.mirror.length ? h : L.mirror.map(() => false)
                    return base.map((v, j) => (j === i ? !v : v))
                  })}
                >
                  <span className="mk">{mirrorHits[i] ? '✅' : '⬜'}</span>「{m}」
                </button>
              ))}
              <p style={{ marginTop: 10, fontSize: 12.5, color: hitCount >= 2 ? '#9be2a8' : 'var(--sub)' }}>
                命中 {hitCount} / {L.mirror.length} —— {mirrorQuip}
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">附录C · 本周练习（挑一条做到就值回票价）</div>
              <ul className="evidence">
                {L.grow.map((g, i) => <li key={i}><b>练习 {i + 1}</b>{g}</li>)}
              </ul>
            </div>
          </Reveal>
          {sibLabels.length > 0 && myVibe && (
            <Reveal>
              <div className="section">
                <div className="s-title">附录D · 同类档案室 · {myVibe.name}柜</div>
                <p style={{ fontSize: 13, color: 'var(--sub)' }}>和你存进同一个档案柜的邻居——你八成能在里面认出一个人。</p>
                {sibLabels.map(s => (
                  <div className="sib-card" key={s.id}>
                    <b>{s.name}</b>
                    <p>{s.hook}</p>
                  </div>
                ))}
                <p style={{ marginTop: 10, fontSize: 12, color: 'var(--sub)' }}>——把测试甩给 TA，验证一下档案室有没有放错柜子</p>
              </div>
            </Reveal>
          )}
        </>
      ) : (
        <Reveal>
          <div className="section">
            <div className="s-title">完整版报告 · 共 5 模块 + 3 附录</div>
            <div className="locked">
              <div className="blur-zone">
                <p>模块一：{hidPreview}……这层人格其实一直在运转…</p>
                <p>模块二 · 成因分析：这层外壳是怎么一点点长出来的…</p>
                <p>模块三 · 关系切片：职场 / 朋友 / 亲密关系里的真实你…</p>
                <p>模块四 · 你的开关 + 模块五 · 阴影面预警…</p>
                <p>附录：MBTI隐藏配置 + 「你一定说过的话」+ 本周练习 + 同类档案室…</p>
              </div>
              <div className="lock-overlay">
                <div className="l-title">🔒 五模块完整报告 + 四附录 + 专属海报</div>
                <div className="l-sub">小红书店铺购买「完整版兑换码」后输入即可<br />一次解锁，长期有效</div>
                <div className="l-price">完整版 ¥{PRICES.hid} · {reportWords} 字 · 5模块+4附录</div>
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

      {poster && <PosterModal url={poster} series={ 'hid' } onClose={() => setPoster(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
