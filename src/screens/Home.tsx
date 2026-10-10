import { dec } from '../lib/share'

interface CpTop { t?: 'zh' | 'hid'; d?: string; f?: string; l?: string }

const MARQUEE = [
  '圣旨体判词', '官方认证接盘侠', '表面淡人实际隐藏疯批', '甄学太后', '暴富指数 98',
  '清醒的恋爱脑', '平行暴富时间表', '神预言 7:1', '钝感力大师', '眉庄式深情'
]

export default function Home({ params }: { params: URLSearchParams }) {
  const cp = dec<CpTop>(params.get('c'))
  const quizLink = (id: string) => `#/quiz/${id}${cp ? `?c=${params.get('c')}` : ''}`
  const strip = MARQUEE.map(m => `◆ ${m}`).join('　')

  return (
    <>
      <div className="hero fade-in">
        <div className="kicker">WHOUARE.TEST · 你是谁测试所</div>
        <h1>
          90秒，<em>测出没见过的自己</em>
        </h1>
        <div className="rotator">
          <span>题题有梗，结果能晒，海报直接存相册</span>
          <span>答得好晒高分，答得差晒「官方认证接盘侠」</span>
          <span>换个开局再测一次，剧本完全不同</span>
        </div>
      </div>

      <div className="marquee fade-in" aria-hidden="true">
        <div className="marquee-inner">
          <span>{strip}</span>
          <span>{strip}</span>
        </div>
      </div>

      <div className="steps fade-in">
        <div><b>①</b>挑一张牌子</div>
        <div><b>②</b>90秒答完</div>
        <div><b>③</b>存海报开晒</div>
      </div>

      {cp && (
        <div className="cp-banner fade-in">
          <b> 有人向你发来战书 </b>
          <br />
          好友已测出「{cp.t === 'hid' ? '隐藏人格' : cp.t === 'cf' ? '暴富体质' : '宫斗命格'}」，测完解锁你们的关系局。
        </div>
      )}

      <div className="entries fade-in">
        <a className="entry zh" href={quizLink('zh')} data-emoji="📜">
          <span className="tagline">免费引流款 · 玩梗浓度拉满</span>
          <span className="badge">限时免费</span>
          <h2>《甄嬛传》宫斗命格测试</h2>
          <div className="desc">
            圣旨体判词 · 宫斗结局 · 核心武器 · 甄学段位考级。
            看过剧的会心一笑，没看过的也能选——8道题，出你的命格。
          </div>
          <span className="go">揭榜开测 →</span>
          <span className="no">壹</span>
        </a>

        <a className="entry hid" href={quizLink('hid')} data-emoji="🌙">
          <span className="tagline">付费主力款 · 长青系列</span>
          <span className="badge">表面免费 · 深层解锁</span>
          <h2>隐藏人格测试</h2>
          <div className="desc">
            表面人设 / 隐藏人格 / 你的开关。免费出第一层，
            兑换码解锁完整版——含MBTI隐藏配置和付费版海报。
          </div>
          <span className="go">查看人设 →</span>
          <span className="no">贰</span>
        </a>

        <a className="entry cf" href={quizLink('cf')} data-emoji="💰">
          <span className="tagline">爆款新上 · 历史假设</span>
          <span className="badge">基础免费 · 时间表解锁</span>
          <h2>穿越暴富体质测试</h2>
          <div className="desc">
            抽一个开局盲盒，回到1998/2008/2015做当年的决定。
            暴富指数 + 五档体质 + 25年时间轴长图——
            答得好晒高分，答得差晒「官方认证接盘侠」，双向传播。
          </div>
          <span className="go">抽开局 →</span>
          <span className="no">叁</span>
        </a>
      </div>

      <div className="foot-note">
        测试为娱乐向内容，不构成心理测评、医疗或投资建议<br />
        结果海报可长按保存 · 欢迎转发给一起测
      </div>
    </>
  )
}
