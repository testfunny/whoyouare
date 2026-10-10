# whoyouare · 你是谁测试所

三个测试产品的 H5，已部署 Vercel。

- **宫斗命格测试**（引流款，免费）：8 题，圣旨判词 + 宫斗结局 + 核心武器 + 甄学段位 + 好友 CP 关系局
- **隐藏人格测试**（付费主力款）：8 道情境题，表面人设免费，完整三层报告 + MBTI 隐藏配置用兑换码解锁
- **穿越暴富体质测试**（爆款款）：抽开局盲盒（5 种身份），8-10 题历史节点二难选择，暴富指数 + 五档体质 + 25年时间轴长图；兑换码解锁平行时间表/错过清单/陷阱解析

## 常用命令

```bash
npm run dev         # 本地开发 http://localhost:5173
npm run build       # 构建到 dist/
npm run preview     # 本地预览生产构建
npm run gen:codes   # 生成隐藏人格兑换码（HY系列）
npx scripts: 无——穿越款用：node scripts/gen-codes.mjs 10 CF
npx vercel deploy --prod --yes   # 部署上线
```

## 兑换码机制

- 两套独立码池：`HY-` 开头解锁隐藏人格完整版，`CF-` 开头解锁暴富时间表完整版，互不通用
- 生成：`node scripts/gen-codes.mjs 10 HY`（隐藏人格）/ `node scripts/gen-codes.mjs 10 CF`（暴富）
- 明文码只生成时打印一次，前端只存 SHA-256 哈希，抓包/看源码拿不到码
- 重新运行同系列会**整体替换**哈希列表，旧码全部失效；要追加就手动把新哈希粘进对应 `codes*.gen.ts`
- 码的强度是 8 位无易混淆字符，无法暴力穷举；但**用户截图转发码无法防**，按单份卖、不回收
- 解锁状态存 localStorage（`wy_unlocked` / `wy_unlocked_cf`），换设备需重新输入

## 修改内容（不用懂代码也能改）

所有文案都在两个数据文件里，改完 `npx vercel deploy --prod --yes` 重新上线即可：

| 内容 | 文件 |
| --- | --- |
| 甄嬛传题目/选项/证据回指/进阶题 | `src/data/zh.ts` → `ZH_QS` |
| 命格判词/结局/武器/副标签 | `src/data/zh.ts` → `ZH_MINGGE` |
| 段位表 | `src/data/zh.ts` → `ZH_RANKS` |
| 好友CP关系 | `src/data/zh.ts` → `ZH_CP` |
| 隐藏人格题目/选项 | `src/data/hid.ts` → `HID_QS` |
| 12标签三层报告/MBTI/副标签 | `src/data/hid.ts` → `HID_LABELS` |
| CP关系 | `src/data/hid.ts` → `HID_CP` |
| 兑换码购买引导文案 | `src/screens/Unlock.tsx` |
| 穿越5种开局/题目顺序 | `src/data/cf.ts` → `CF_IDENTITIES` |
| 穿越26道题/时间轴文案/陷阱解析 | `src/data/cf.ts` → `CF_QS` |
| 五档体质判词 | `src/data/cf.ts` → `CF_TIERS` |

第二期预留（未实现，架构已留位）：穿越款双人合测（沿站点通用 `?c` 参数机制扩展）、隐藏结局（全踩坑触发"天台结局"、约1%概率"时代宠儿"稀有结局——在 `cfScore` 返回的 `traps/gods` 基础上加判定分支即可）。

换标签季度更新的做法：直接改 `HID_LABELS` 里的报告文案和名字（题目不用动），重新部署——这就是"每季度换一批标签"的低成本实现。

## 上线地址

- 生产：https://whoyouare-five.vercel.app
- Vercel 项目名：`whoyouare`（账号 wjh941），部署保护已关闭（公网可直接访问）

## 运营红线备忘（改文案时自查）

1. 不出现"评论区扣1+私信发链接"、站外链接、二维码、微信号
2. 不用病理化词汇（人格障碍/抑郁/治疗），玩梗词（疯批/发疯）可以用
3. 不承诺"测得准/科学认证"，不写绝对化用语
4. 不伪造用户评论；引流走笔记内容 + 店铺商品 + 群聊
5. 甄嬛传款只做免费引流；**任何收费交付物一律用原创体系**（当前付费墙只在隐藏人格款上，天然合规）
6. AI 生成图片若用于笔记，记得勾"AI合成内容"声明

## 数据埋点（迭代时建议加）

当前无埋点。上线验证期先看小红书侧数据（点击/私信/订单）；要精细化漏斗时，在 `Quiz.pick` 和 `ResultHid.goUnlock` 里接 Umami/Plausible 或自建计数接口，关键事件：
`quiz_start / quiz_finish / poster_save / cp_share / unlock_view / unlock_success`。

## 已知取舍

- 兑换码验证在前端完成（哈希比对），够用且零成本；以后要防重用/统计核销，加一个 Vercel KV + serverless 即可
- 海报为 Canvas 直绘，不同手机字体略有差异，属可接受范围
- 甄嬛传引流的"进阶题"答案固定，甄学家可能背题——季度换一批进阶题即可（改 `ZH_QS` 后三题）
