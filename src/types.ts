export interface CampEntry {
  id: string
  school: string           // 学校名称
  unit: string             // 研究院/学院/具体单位
  title: string            // 通知标题
  deadline: string         // 截止日期 YYYY-MM-DD | '暂无'
  link: string             // 原始通知链接
  source: string           // 来源文件 (如 README-医农类.md)
  sourceCategory: string   // 来源分类 (医农类/理工类/主文件)
  tags: string[]           // 关键词标签
  status: 'active' | 'expired' | 'unknown'  // 状态
  isBioRelated: boolean    // 是否生物相关
  createdAt: string        // 数据抓取时间
}

export type SortField = 'deadline' | 'school' | 'title' | 'createdAt'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

export interface Filters {
  search: string
  schools: string[]
  statuses: ('active' | 'expired' | 'unknown')[]
  deadlineRange: 'all' | 'week' | 'month' | 'expired'
  sourceCategory: string[]
  onlyOpen: boolean        // "仅看今天后仍可报名"
}

export interface AppState {
  data: CampEntry[]
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  bookmarks: Set<string>   // 收藏的条目 ID
}
