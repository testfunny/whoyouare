import { useEffect, useState } from 'react'
import { CF_IDENTITIES, cfScore, cfMoney, cfFactor, CF_TIERS } from '../data/cf'
import { isUnlocked } from '../lib/codes'
import { dec, nav, copyText, fullUrl } from '../lib/share'
import { renderCFPoster, CfTlItem } from '../lib/poster'
import PosterModal from '../components/PosterModal'
import { Reveal, StatBars, archiveNo } from '../components/ui'

export default function ResultCf({ params }: { params: URLSearchParams }) {
  const d = dec<number[]>(params.get('d'))
  const i = Number(params.get('i'))
  const identity = CF_IDENTITIES[i]

  const [poster, setPoster] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [unlocked, setUnlockedState] = useState(isUnlocked('cf'))
  const [shown, setShown] = useState(0)

  const valid = !!identity && !!d && identity.seq.length === d.length

  useEffect(() => {
    if (!valid) nav('/')
  }, [valid])

  // 暴富指数滚动计数
  useEffect(() => {
    if (!valid) return
    const target = cfScore(d!, identity!).index
    let raf = 0
    const t0 = performance.now()
    const dur = 950
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur)
      setShown(Math.round(target * p * (2 - p)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [valid])

  if (!valid) return null

  const r = cfScore(d!, identity!)
  const L = r.tier

  // 年代关键词：按表现派生
  const bestCount = r.items.filter(({ q }, qi) => d![qi] === q.best).length
  const extraKws: string[] = []
  if (r.gods >= 1) extraKws.push('神预判在身')
  if (r.traps >= 2) extraKws.push('踩坑专业户')
  else if (r.traps === 1) extraKws.push('半步惊坑')
  if (bestCount >= 7) extraKws.push('穿越教科书')
  else if (bestCount >= 4) extraKws.push('半仙之体')
  if (extraKws.length === 0) extraKws.push('平平无奇小天才')

  const items: CfTlItem[] = r.items.map(({ q, opt }) => ({
    year: q.year,
    text: opt.tl,
    kind: opt.trap ? 'trap' : opt.god ? 'god' : undefined
  }))

  // 付费内容：平行时间表 / 错过清单 / 陷阱解析
  const parallelItems = r.items.map(({ q }) => ({
    year: q.year,
    text: q.opts[q.best].tl
  }))
  const parallelMoney = identity.stash * cfFactor(100)
  const missed = r.items.filter(({ q }, qi) => d![qi] !== q.best)
  const trapNotes = r.items.filter(({ q }) => q.trapNote)

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const retake = () => {
    try { sessionStorage.removeItem('wy_cf_id') } catch { /* ignore */ }
    nav('/quiz/cf')
  }

  const share = async () => {
    const link = fullUrl('/quiz/cf')
    const ok = await copyText(`我穿越回去测了下自己的暴富体质，评了个「${L.name}」，暴富指数${r.index}。你也来抽个开局 → ${link}`)
    flash(ok ? '链接已复制，去粘贴给好友' : '复制失败，请手动截图')
  }

  const statItems = [
    { label: '你的最终身家', v: Math.max(6, r.index), hint: cfMoney(r.finalMoney) },
    { label: '同开局穿越者平均线', v: Math.min(98, Math.round((identity.avgFactor / 45) * 100)), hint: cfMoney(r.avgMoney) }
  ]

  return (
    <>
      <div className="topbar">
        <button className="back" onClick={() => nav('/')}>← 首页</button>
      </div>

      <div className="result-hero fade-in" data-char={L.ci}>
        <div className="kicker">穿越暴富体质 · 结算完毕</div>
        <h1>{L.name}</h1>
        <div className="hook">{identity.year}年的{identity.name} · 开局{identity.stashText}</div>
        <div className="arch">平行账本 · 编号 {archiveNo(d!.join(','), 'CF')}</div>
      </div>

      <Reveal>
        <div className="section">
          <div className="index-hero">
            <div className="big">{shown}<small> / 100</small></div>
            <div className="over">暴富指数 · 超过 {r.over}% 的穿越者</div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">体质鉴定 · 五档阶梯</div>
          <div className="tier-ladder">
            {CF_TIERS.map(t => (
              <div className={`tl-row${t.name === L.name ? ' act' : ''}`} key={t.name}>
                <div className="t-ci">{t.ci}</div>
                <div className="t-name">{t.name}{t.name === L.name ? ' · 你在这里' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">暴富账本 · 最终结算</div>
          <div className="money-hero">
            <div className="m-big">{cfMoney(r.finalMoney)}</div>
            <div className="m-avg">同开局平均 · {cfMoney(r.avgMoney)}</div>
          </div>
          <div style={{ marginTop: 12 }}>
            <StatBars items={statItems} />
          </div>
          {r.traps >= 2 && (
            <p style={{ marginTop: 12, color: '#ff8a8d', fontSize: 13 }}>
              你这一路精准踩了 {r.traps} 个坑——接盘侠的肌肉记忆，比风口的雷达还灵敏。
            </p>
          )}
          {r.gods >= 1 && r.traps === 0 && (
            <p style={{ marginTop: 12, color: '#ffd166', fontSize: 13 }}>
              一次神级预判，零次踩坑——你这不是穿越，是回家。
            </p>
          )}
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">毒舌判词</div>
          <p>{L.desc}</p>
          <div className="blame">{L.blame}</div>
          <div className="chips" style={{ marginTop: 12 }}>
            {L.subs.map((s, k) => <span className="chip gold" key={k}>{s}</span>)}
            {extraKws.map((s, k) => <span className="chip" key={`x${k}`}>{s}</span>)}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="section">
          <div className="s-title">时间轴 · 你这二十几年</div>
          <div>
            {items.map((it, k) => (
              <div className="tl-item" key={k}>
                <div className="tl-year">{it.year}</div>
                <div className="tl-text">
                  {it.text}
                  {it.kind === 'trap' && <span className="tl-badge trap">坑</span>}
                  {it.kind === 'god' && <span className="tl-badge god">神</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {unlocked ? (
        <>
          <Reveal>
            <div className="section">
              <div className="s-title">平行暴富时间表（完整版）</div>
              <p style={{ marginBottom: 10, color: '#7dd087', fontSize: 13 }}>
                如果你当年每次都选对——最终身家约 {cfMoney(parallelMoney)}
              </p>
              <div>
                {parallelItems.map((it, k) => (
                  <div className="para-line" key={k}>
                    <div className="tl-year">{it.year}</div>
                    <div className="tl-text">{it.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">完整错过清单 · {missed.length} 项（完整版）</div>
              {missed.length === 0 ? (
                <p>你没有错过任何东西——这本清单是空的，本身就是暴富的证明。</p>
              ) : (
                <ul className="evidence">
                  {missed.map(({ q, opt }, k) => (
                    <li key={k}><b>{q.year}年</b>{opt.tl}——你选了另一条路</li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">陷阱逐题解析（完整版）</div>
              <ul className="evidence">
                {trapNotes.map(({ q }, k) => (
                  <li key={k}><b>{q.year}年</b>{q.trapNote}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <div className="section">
            <div className="s-title">完整版 · 三件套</div>
            <div className="locked">
              <div className="blur-zone">
                <p>平行时间线：如果你当年每次都选对，身家约 █▓▓…</p>
                <p>错过清单：{identity.year}年你错过了……</p>
                <p>陷阱解析：那个坑的本质是……</p>
              </div>
              <div className="lock-overlay">
                <div className="l-title">🔒 平行暴富时间表 + 错过清单 + 陷阱解析</div>
                <div className="l-sub">小红书店铺购买「暴富完整版兑换码」后输入即可<br />一次解锁，永久有效</div>
                <button
                  className="btn primary small"
                  onClick={() => {
                    try { sessionStorage.setItem('wy_return', location.hash) } catch { /* ignore */ }
                    nav('/unlock?p=cf')
                  }}
                >
                  输入兑换码解锁完整版
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <div className="foot-note" style={{ color: '#8f8c97' }}>
        本测试仅供娱乐，不构成任何投资建议。
      </div>

      <div className="actions fade-in">
        <button
          className="btn primary"
          onClick={() => setPoster(renderCFPoster(identity, items, L, r.index, r.over, r.finalMoney, r.avgMoney))}
        >
          保存时间轴长图
        </button>
        <button className="btn ghost" onClick={retake}>再测一次 · 换开局</button>
        <button className="btn ghost" onClick={share}>邀请好友来穿越</button>
      </div>

      {poster && <PosterModal url={poster} onClose={() => setPoster(null)} />}
      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
