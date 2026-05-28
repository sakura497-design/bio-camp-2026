import type { CampEntry } from '../types'
import { SOURCE_FILES, RAW_BASE } from './config'
import { parseMarkdown, deduplicateEntries } from './markdown-parser'

/**
 * 从 GitHub 获取单个 Markdown 文件
 */
async function fetchMarkdown(file: string): Promise<string> {
  const url = `${RAW_BASE}/${file}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`获取 ${file} 失败: ${response.status}`)
  }
  return response.text()
}

/**
 * 并发获取所有数据源并解析
 */
export async function fetchAllData(): Promise<CampEntry[]> {
  const results = await Promise.allSettled(
    SOURCE_FILES.map(async ({ file, category }) => {
      const content = await fetchMarkdown(file)
      return parseMarkdown(content, file, category)
    })
  )

  const allEntries: CampEntry[] = []

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allEntries.push(...result.value)
    } else {
      console.warn('数据源加载失败:', result.reason)
    }
  }

  // 去重
  const deduped = deduplicateEntries(allEntries)

  // 只保留生物相关的
  const bioOnly = deduped.filter(e => e.isBioRelated)

  // 按截止日期排序（暂无排最后）
  bioOnly.sort((a, b) => {
    if (a.deadline === '暂无' && b.deadline === '暂无') return 0
    if (a.deadline === '暂无') return 1
    if (b.deadline === '暂无') return -1
    return a.deadline.localeCompare(b.deadline)
  })

  return bioOnly
}

/**
 * 获取缓存的数据（从 localStorage）
 */
export function getCachedData(): { data: CampEntry[]; timestamp: number } | null {
  try {
    const cached = localStorage.getItem('bio-camp-data')
    if (!cached) return null
    return JSON.parse(cached)
  } catch {
    return null
  }
}

/**
 * 缓存数据到 localStorage
 */
export function cacheData(data: CampEntry[]): void {
  try {
    localStorage.setItem('bio-camp-data', JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch {
    // localStorage 满了，忽略
  }
}

/**
 * 获取收藏列表
 */
export function getBookmarks(): Set<string> {
  try {
    const saved = localStorage.getItem('bio-camp-bookmarks')
    if (!saved) return new Set()
    return new Set(JSON.parse(saved))
  } catch {
    return new Set()
  }
}

/**
 * 保存收藏列表
 */
export function saveBookmarks(bookmarks: Set<string>): void {
  try {
    localStorage.setItem('bio-camp-bookmarks', JSON.stringify([...bookmarks]))
  } catch {
    // ignore
  }
}
