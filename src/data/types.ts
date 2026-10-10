export interface Opt {
  /** 选项文案 */
  t: string
  /** 维度（甄嬛传：ye/ren/cai/xing/xue；隐藏人格：EN/IN/EM/IC/DO/TH/PL/ED） */
  dim: string
  /** 加分 */
  pts: number
  /** 证据回指素材 */
  reveal: string
  /** 深梗彩蛋（甄嬛传进阶段位用） */
  egg?: boolean
  /** 副标签 flag（隐藏人格） */
  tags?: string[]
  /** 进阶题正确项 */
  correct?: boolean
}

export interface Q {
  q: string
  sub?: string
  opts: Opt[]
}

export interface Evidence {
  q: number
  text: string
}

export type TestId = 'zh' | 'hid'
