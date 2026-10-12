import { useEffect, useState } from 'react'
import { CF_IDENTITIES, cfScore, cfMoney, cfFactor, CF_TIERS, cfHiddenEnding, CF_BEST_WHY, CF_TRAP_DEEP, cfProfile, CF_PLAYBOOKS } from '../data/cf'
import { isUnlocked } from '../lib/codes'
import { dec, nav, copyText, fullUrl } from '../lib/share'
import { renderCFPoster, CfTlItem } from '../lib/poster'
import PosterModal from '../components/PosterModal'
import { Reveal, StatBars, archiveNo } from '../components/ui'
import NextTests from '../components/NextTests'

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

  // 隐藏结局（确定性判定，可复现）
  const ending = cfHiddenEnding(identity, d!, r.index, r.traps)
  // 暴富人格侧写（动态）
  const prof = cfProfile(r.index, r.traps, r.gods)

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
  const ratio = r.finalMoney > 0 ? Math.round(parallelMoney / r.finalMoney) : 999
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

      {ending && (
        <Reveal>
          <div className="section ending-card">
            <div className="kicker">{ending.kicker}</div>
            <h2>{ending.name}</h2>
            <p>{ending.desc}</p>
            <p className="bait">{ending.bait}</p>
          </div>
        </Reveal>
      )}

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
              <div className="s-title">完整版报告 · 目录</div>
              <p style={{ fontSize: 12.5, color: 'var(--sub)' }}>
                模块一 · 暴富人格侧写　模块二 · 平行暴富时间表<br />
                模块三 · 完整错过清单　模块四 · 陷阱逐题解析<br />
                模块五 · 同开局通关秘籍
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块一 · 暴富人格侧写</div>
              <div className="chips"><span className="chip gold">{prof.title}</span></div>
              <p style={{ marginTop: 10 }}>{prof.body}</p>
              <p style={{ marginTop: 10, color: '#ffd166' }}>{prof.agree}</p>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块二 · 平行暴富时间表</div>
              <p style={{ marginBottom: 10, color: '#7dd087', fontSize: 13 }}>
                如果你当年每次都选对——最终身家约 {cfMoney(parallelMoney)}
                {ratio > 1 ? `，是现在的 ${ratio} 倍` : '。你已经活在最优时间线里，这份表就是你的生平。'}
              </p>
              <div>
                {r.items.map(({ q }, k) => (
                  <div className="para-line" key={k}>
                    <div className="tl-year">{q.year}</div>
                    <div className="tl-text">
                      {q.opts[q.best].tl}
                      <br />
                      <span style={{ color: '#8f8c97', fontSize: 12 }}>为什么是它：{CF_BEST_WHY[q.id]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块三 · 完整错过清单 · {missed.length} 项</div>
              {missed.length === 0 ? (
                <p>清单是空的——你一步都没错过，这本身就是暴富的证明。</p>
              ) : (
                <ul className="evidence">
                  {missed.map(({ q, opt }, k) => (
                    <li key={k}><b>{q.year}年</b>你选了「{opt.t}」——错过：{q.opts[q.best].tl}</li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块四 · 陷阱逐题解析</div>
              {trapNotes.length === 0 ? (
                <p>你一个坑都没踩——解析部分免费送你当奖状。</p>
              ) : (
                trapNotes.map(({ q }, k) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <p><b style={{ color: '#ff8a8d' }}>{q.year}年 · 那个坑</b></p>
                    <p style={{ marginTop: 6 }}>{(CF_TRAP_DEEP[q.id] || q.trapNote || '').split('\n').map((line, i2) => <span key={i2}>{line}<br /></span>)}</p>
                  </div>
                ))
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="section">
              <div className="s-title">模块五 · {CF_PLAYBOOKS[identity.id].title}</div>
              <ul className="evidence">
                {CF_PLAYBOOKS[identity.id].steps.map((s, k) => (
                  <li key={k}><b>第{k + 1}步</b>{s}</li>
                ))}
              </ul>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--sub)' }}>历史情境复盘 · 仅供娱乐，不构成任何投资建议</p>
            </div>
          </Reveal>
        </>
      ) : (
        <Reveal>
          <div className="section">
            <div className="s-title">完整版报告 · 共 5 模块</div>
            <div className="locked">
              <div className="blur-zone">
                <p>模块一 · 暴富人格侧写：你的决策模式显示……</p>
                <p>模块二 · 平行时间表：每次都选对的你，身家约 █▓▓，是现在的 █ 倍…</p>
                <p>模块三 · 错过清单：{missed.length} 项，每一项都有当年的真相…</p>
                <p>模块四 · 陷阱解析：那个坑的本质，是有人精确利用了你的…</p>
                <p>模块五 · 通关秘籍：如果重来一次，你的三步打法是…</p>
              </div>
              <div className="lock-overlay">
                <div className="l-title">🔒 暴富人格侧写 + 时间表 + 解析 + 秘籍</div>
                <div className="l-sub">小红书店铺购买「暴富完整版兑换码」后输入即可<br />一次解锁，长期有效</div>
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

      <NextTests exclude="cf" />

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
