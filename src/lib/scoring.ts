import { ZH_QS, ZH_PAIR, ZH_RANKS, ZH_MINGGE, ZH_DIMS, MingGe } from '../data/zh'
import { HID_QS, HID_LABELS, HidLabel } from '../data/hid'
import { Opt } from '../data/types'

export interface Ev { q: number; opt: string; text: string }

function strip(t: string) {
  return t.replace(/^[「『]/, '').replace(/[」』]$/, '')
}

/* ============ 甄嬛传 · 评分 ============ */

export interface ZhResult {
  dims: Record<string, number>
  top2: [string, string]
  pairKey: string
  mgId: string
  mg: MingGe
  rankScore: number
  rankName: string
  rankQuip: string
  xue: number
  eggs: number
  ev: Ev[]
}

export function scoreZH(answers: number[]): ZhResult {
  const dims: Record<string, number> = { ye: 0, ren: 0, cai: 0, xing: 0 }
  let eggs = 0
  let xue = 0
  const picks: (Opt | undefined)[] = answers.map((oi, qi) => ZH_QS[qi]?.opts[oi])
  for (const o of picks) {
    if (!o) continue
    if (o.dim === 'xue') {
      if (o.correct) xue += o.pts
    } else {
      dims[o.dim] = (dims[o.dim] || 0) + o.pts
    }
    if (o.egg) eggs++
  }
  const ordered = Object.entries(dims).sort((a, b) => b[1] - a[1])
  const top2: [string, string] = [ordered[0][0], ordered[1][0]]
  const pairKey = `${top2[0]}|${top2[1]}`
  const fallback: Record<string, string> = { ye: 'feng', ren: 'gu', cai: 'jin', xing: 'leng' }
  const mgId = ZH_PAIR[pairKey] || fallback[top2[0]] || 'zhe'
  const mg = ZH_MINGGE[mgId]
  const rankScore = xue + eggs
  let rank = ZH_RANKS[0]
  for (const r of ZH_RANKS) if (rankScore >= r.min) rank = r

  // 证据回指：优先取与主/副维度一致的选项，其次任意有 reveal 的选项
  const ev: Ev[] = []
  const dimOrder = [top2[0], top2[1], '*', '*', '*', '*']
  for (const d of dimOrder) {
    for (let qi = 0; qi < picks.length && ev.length < 2; qi++) {
      const o = picks[qi]
      if (!o || !o.reveal || o.dim === 'xue') continue
      if (d !== '*' && o.dim !== d) continue
      if (ev.some(e => e.q === qi + 1)) continue
      ev.push({ q: qi + 1, opt: strip(o.t), text: o.reveal })
    }
  }

  return {
    dims, top2, pairKey, mgId, mg,
    rankScore, rankName: rank.name, rankQuip: rank.quip,
    xue, eggs, ev
  }
}

export function zhRankContrast(r: ZhResult): string {
  if (r.rankScore >= 6) return '命格与段位双高——甄学家认证，这剧你没白看。'
  if (r.rankScore <= 3) return `命格是「${r.mg.name}」，甄学段位却只有「${r.rankName}」——位分不够，剧来凑。`
  return `命格看天分，段位看刷剧量——两手都要抓，后宫才好混。`
}

/* ============ 隐藏人格 · 评分 ============ */

export interface HidResult {
  poles: Record<string, number>
  dom: string[]
  label: HidLabel
  ev: Ev[]
  userTags: string[]
}

export function scoreHID(answers: number[]): HidResult {
  const poles: Record<string, number> = { EN: 0, IN: 0, EM: 0, IC: 0, DO: 0, TH: 0, PL: 0, ED: 0 }
  const userTags: string[] = []
  const picks: (Opt | undefined)[] = answers.map((oi, qi) => HID_QS[qi]?.opts[oi])
  for (const o of picks) {
    if (!o) continue
    poles[o.dim] = (poles[o.dim] || 0) + o.pts
    for (const t of o.tags || []) if (!userTags.includes(t)) userTags.push(t)
  }
  const axes: [string, string][] = [['EN', 'IN'], ['EM', 'IC'], ['DO', 'TH'], ['PL', 'ED']]
  const dom = axes.map(([a, b]) => (poles[a] >= poles[b] ? a : b))

  let best = HID_LABELS[0]
  let bestScore = -1e9
  for (const L of HID_LABELS) {
    let s = 0
    L.sig.forEach((pole, i) => { s += pole === dom[i] ? L.w[i] : -0.5 })
    const hits = L.tags.filter(t => userTags.includes(t)).length
    s += hits * 0.7
    if (s > bestScore) { bestScore = s; best = L }
  }

  // 证据回指：优先选命中标签 tags 的选项，其次命中主导极的选项
  const ev: Ev[] = []
  for (let qi = 0; qi < picks.length && ev.length < 2; qi++) {
    const o = picks[qi]
    if (!o) continue
    if ((o.tags || []).some(t => best.tags.includes(t))) {
      ev.push({ q: qi + 1, opt: strip(o.t), text: o.reveal })
    }
  }
  for (let qi = 0; qi < picks.length && ev.length < 2; qi++) {
    const o = picks[qi]
    if (!o || ev.some(e => e.q === qi + 1)) continue
    if (dom.includes(o.dim)) ev.push({ q: qi + 1, opt: strip(o.t), text: o.reveal })
  }

  return { poles, dom, label: best, ev, userTags }
}

export { ZH_DIMS }
