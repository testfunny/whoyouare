/**
 * 兑换码批量注册到服务端码池(配合 api/admin-register.ts)。
 *
 * 用法:
 *   VERIFY_API_BASE=https://whoyouare-five.vercel.app ADMIN_KEY=你的管理密钥 \
 *     node scripts/register-codes.mjs hid HY-XXXX-XXXX-XXXX-XXXX HY-YYYY-...
 *   # 或从文件读(每行一个码,- 代表 stdin):
 *   cat new-codes.txt | VERIFY_API_BASE=... ADMIN_KEY=... node scripts/register-codes.mjs cf -
 *
 * 零依赖(Node 18+ 自带 fetch)。码池与服务端验证解耦:注册后立即可用,
 * 无需重新构建前端;gen-codes.mjs 生成的码推荐同时登记服务端(防截图转发)
 * 并保留在哈希包里(断网/未配 KV 时兜底)。
 */
const args = process.argv.slice(2)
const series = args[0]
if (series !== 'hid' && series !== 'cf') {
  console.error('用法: node scripts/register-codes.mjs <hid|cf> <code...|->(stdin,每行一码)')
  process.exit(1)
}

const base = (process.env.VERIFY_API_BASE || '').replace(/\/$/, '')
const adminKey = process.env.ADMIN_KEY || ''
if (!base || !adminKey) {
  console.error('需要环境变量 VERIFY_API_BASE(如 https://whoyouare-five.vercel.app) 与 ADMIN_KEY')
  process.exit(1)
}

let codes = []
if (args[1] === '-') {
  codes = readFileSync(0, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)
} else {
  codes = args.slice(1).map(s => s.trim()).filter(Boolean)
}
if (!codes.length) {
  console.error('没有可注册的兑换码')
  process.exit(1)
}

const BATCH = 500
let ok = 0, bad = 0
for (let i = 0; i < codes.length; i += BATCH) {
  const batch = codes.slice(i, i + BATCH)
  const res = await fetch(`${base}/api/admin-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ series, codes: batch })
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 200 && data.ok) {
    ok += data.registered || 0
    bad += data.invalid_or_failed || 0
    console.log(`批次 ${Math.floor(i / BATCH) + 1}: 收到 ${data.received},登记 ${data.registered},无效/失败 ${data.invalid_or_failed}`)
  } else {
    console.error(`批次失败 HTTP ${res.status}:`, JSON.stringify(data))
    process.exit(1)
  }
}
console.log(`完成:成功登记 ${ok} 个${bad ? `,无效/失败 ${bad} 个` : ''}`)
