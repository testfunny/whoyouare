# whoyouare · 你是谁测试所(三合一测试 H5)

[![Deploy GitHub Pages](https://github.com/wjh941/whoyouare/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/wjh941/whoyouare/actions/workflows/deploy-pages.yml) [![React](https://img.shields.io/badge/React-18-087EA4?logo=react&logoColor=white)](https://react.dev) [![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> 题题有梗,结果能晒,海报直接存相册。
> **答得好晒高分,答得差晒「官方认证接盘侠」——两个方向都要能传播。**

面向小红书虚拟产品变现的三款趣味测试 H5:《甄嬛传》宫斗命格测试(引流款) / 隐藏人格测试(付费主力款) / 穿越暴富体质测试(爆款款)。打开即用,无需注册,后端零依赖,数据只存浏览器本地。

**线上地址(Vercel 主线路): https://whoyouare-five.vercel.app** · 备用线路(GitHub Pages, 国内可达): https://wjh941.github.io/whoyouare/

> ⚠️ 定位是娱乐向内容:所有结果仅供娱乐,不构成心理测评或投资建议;穿越款全站规避收益承诺类表述(稳赚/买入/收益/涨停/下注/赔率零出现),历史行情仅做情境还原,结果页与长图均固定展示免责声明。

## 功能特性

### 三款测试

| 产品 | 定位 | 题量 | 结果物 | 变现 |
| --- | --- | --- | --- | --- |
| **《甄嬛传》宫斗命格测试** | 引流款 | 8题+3进阶 | 圣旨体判词(逐字宣读) / 四维属性条 / 宫斗结局 / 核心武器 / 甄学段位 / 好友CP关系局 | 免费,引流涨粉 |
| **隐藏人格测试** | 付费主力款 | 8情境题 | 表面人设(免费) / 隐藏人格三层报告 / 你的开关 / MBTI隐藏配置 / 三轴属性条 | `HY-` 兑换码解锁完整版 |
| **穿越暴富体质测试** | 爆款款 | 盲盒抽开局 + 9~10题 | 5种开局身份盲盒 / 暴富指数+超过N%穿越者 / 五档体质+专属甩锅台词 / 25年时间轴长图(Canvas一键保存) | `CF-` 兑换码解锁平行时间表+错过清单+陷阱解析 |

### 核心机制

| 机制 | 说明 |
| --- | --- |
| **开局盲盒** | 抽中 1998下岗工人 / 2005大学生 / 2012程序员 / 5000块普通人 / 50万小老板 之一,每种开局走专属题目分支,可换一张重抽 |
| **陷阱题** | 牛市山顶 / 生态化反 / 高息平台 3 道必经坑题,选入扣分并触发专属结局文案,付费层给逐题解析 |
| **神预言** | 2009电子货币 / 2014世界杯7:1 等彩蛋选项,选中触发「神」标记(世界杯仅做预言玩梗,无任何下注表述) |
| **时间轴长图** | Canvas 动态高度直绘:开局身份卡 → 逐年经历(带「坑/神」徽章) → 最终身家 vs 同开局平均线 → 毒舌判词 → 免责声明,长按即可保存 |
| **CP关系局** | 好友链接携带 `?c=` 参数,双方测完解锁关系判词(甄嬛款10局 / 隐藏人格6局) |
| **档案编号** | 每份报告按答案生成稳定编号(敬事房存字 / 人格档案库 / 平行账本),仪式感细节 |
| **进度留存** | 答题进度 sessionStorage 持久化,中途退出可回到已答位置;解锁状态 localStorage 永久有效 |

## 三步上手(本地开发)

```bash
npm install        # 安装依赖
npm run dev        # 本地开发 http://localhost:5173
npm run build      # 构建到 dist/
```

部署双线路:

```bash
npx vercel deploy --prod --yes    # 主线路: Vercel(账号 wjh941, 项目 whoyouare)
git push                           # 备用线路: GitHub Pages(main 分支推送自动触发 workflow 构建)
```

## 兑换码机制

- 两套独立码池:`HY-` 开头解锁隐藏人格完整版,`CF-` 开头解锁暴富时间表完整版,互不通用
- 生成:`node scripts/gen-codes.mjs 10 HY`(隐藏人格) / `node scripts/gen-codes.mjs 10 CF`(暴富)
- 明文码只在生成时打印一次,前端只存 SHA-256 哈希,抓包/看源码拿不到码
- 重新运行同系列会**整体替换**哈希列表,旧码全部失效;要追加就手动把新哈希粘进对应 `codes*.gen.ts`
- 码强度为 8 位无易混淆字符,无法暴力穷举;但**用户截图转发码无法防**,按单份卖、不回收
- 解锁状态存 localStorage(`wy_unlocked` / `wy_unlocked_cf`),换设备需重新输入

## 改内容(不用懂代码)

所有文案集中在三个数据文件,改完推送即自动重新上线:

| 内容 | 文件 |
| --- | --- |
| 甄嬛传题目/选项/证据回指/进阶题 | `src/data/zh.ts` → `ZH_QS` |
| 命格判词/结局/武器/甩锅彩蛋 | `src/data/zh.ts` → `ZH_MINGGE` |
| 段位表 | `src/data/zh.ts` → `ZH_RANKS` |
| 好友CP关系 | `src/data/zh.ts` → `ZH_CP` |
| 隐藏人格题目/选项 | `src/data/hid.ts` → `HID_QS` |
| 12标签三层报告/MBTI/副标签 | `src/data/hid.ts` → `HID_LABELS` |
| CP关系 | `src/data/hid.ts` → `HID_CP` |
| 穿越5种开局/题目顺序 | `src/data/cf.ts` → `CF_IDENTITIES` |
| 穿越26道题/时间轴文案/陷阱解析 | `src/data/cf.ts` → `CF_QS` |
| 五档体质判词+甩锅台词 | `src/data/cf.ts` → `CF_TIERS` |
| 兑换码购买引导文案 | `src/screens/Unlock.tsx` |

换标签季度更新的做法:直接改 `HID_LABELS` 里的报告文案和名字(题目不用动),重新部署——这就是"每季度换一批标签"的低成本实现。

## 运营红线(改文案时自查)

1. 不出现"评论区扣1+私信发链接"、站外链接、二维码、微信号
2. 不用病理化词汇(人格障碍/抑郁/治疗),玩梗词(疯批/发疯)可以用
3. 不承诺"测得准/科学认证",不写绝对化用语;穿越款禁用 稳赚/买入/收益/涨停/下注/赔率
4. 不伪造用户评论;引流走笔记内容 + 店铺商品 + 群聊
5. 甄嬛传款只做免费引流;**任何收费交付物一律用原创体系**(甄嬛传IP仅用于免费款,付费墙在原创的隐藏人格/穿越款上)
6. AI 生成图片若用于笔记,记得勾"AI合成内容"声明

## 数据埋点(迭代时建议加)

当前无埋点。上线验证期先看小红书侧数据(点击/私信/订单);要精细化漏斗时,在 `Quiz.pick` 和 `ResultHid.goUnlock` 里接 Umami/Plausible 或自建计数接口,关键事件:
`quiz_start / quiz_finish / poster_save / cp_share / unlock_view / unlock_success`。

## 第二期预留(架构已留位,未实现)

- **穿越款双人合测**:沿站点通用 `?c=` 参数机制扩展
- **隐藏结局**:全踩坑触发"天台结局"、约1%概率"时代宠儿"稀有结局——在 `cfScore` 已返回的 `traps/gods` 基础上加判定分支即可

## 已知取舍

- 兑换码验证在前端完成(哈希比对),够用且零成本;以后要防重用/统计核销,加一个 Vercel KV + serverless 即可
- 海报为 Canvas 直绘,不同手机字体略有差异,属可接受范围
- 甄嬛传引流的"进阶题"答案固定,甄学家可能背题——季度换一批进阶题即可(改 `ZH_QS` 后三题)
- Vercel 主线路在国内部分网络不可达,GitHub Pages 备用线路兜底(本仓库转公开即为此)
