import type { CampEntry } from '../types'
import { isBioRelated, generateTags } from './bio-filter'

/**
 * 从 Markdown 表格行中解析出原始数据
 * 支持两种格式：
 * - 3列：截止时间 | 学校名称 | 通知
 * - 2列：截止时间 | 通知（学校从上下文推断）
 */

/**
 * 解析 Markdown 链接 [text](url)
 */
function parseMarkdownLink(text: string): { title: string; link: string } {
  const match = text.match(/\[([^\]]*)\]\(([^)]*)\)/)
  if (match) {
    return { title: match[1].trim(), link: match[2].trim() }
  }
  return { title: text.trim(), link: '' }
}

/**
 * 解析截止日期字段
 * - "暂无" -> '暂无'
 * - "~~2026-05-26~~" -> '2026-05-26' (已过期)
 * - "2026-06-15" -> '2026-06-15'
 */
function parseDeadline(raw: string): { deadline: string; isExpired: boolean } {
  let cleaned = raw.trim()
  let isExpired = false

  // 移除删除线标记
  if (cleaned.includes('~~')) {
    isExpired = true
    cleaned = cleaned.replace(/~~/g, '')
  }

  // 移除加粗标记
  cleaned = cleaned.replace(/\*\*/g, '')

  // 标准化日期格式
  cleaned = cleaned.trim()

  if (cleaned === '暂无' || cleaned === '-' || cleaned === '' || cleaned === 'nan') {
    return { deadline: '暂无', isExpired: false }
  }

  // 验证日期格式 YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return { deadline: cleaned, isExpired }
  }

  // 尝试其他日期格式
  const dateMatch = cleaned.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (dateMatch) {
    const [, y, m, d] = dateMatch
    return { deadline: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`, isExpired }
  }

  return { deadline: '暂无', isExpired: false }
}

/**
 * 从通知标题中提取单位信息
 */
function extractUnit(title: string, _school: string): string {
  // 尝试从标题中提取学院/单位
  // 常见模式："2026年XXX学院..." 或 "XXX大学YYY学院..."
  const patterns = [
    /(?:年|大学|学院|研究所|研究院|实验室|医学部)(.*?(?:学院|系|研究所|研究院|实验室|中心|医学部|药学部))/,
    /(.*?(?:学院|系|研究所|研究院|实验室|中心|医学部))/,
  ]

  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return ''
}

/**
 * 解析3列格式的表格行（截止时间 | 学校名称 | 通知）
 */
function parse3ColRow(line: string, source: string, category: string): CampEntry | null {
  // 分割表格列
  const cells = line.split('|').map(c => c.trim()).filter(c => c !== '')
  if (cells.length < 3) return null

  const [rawDeadline, rawSchool, rawTitle] = cells
  const { deadline, isExpired } = parseDeadline(rawDeadline)
  const { title, link } = parseMarkdownLink(rawTitle)

  if (!title && !link) return null

  const school = rawSchool.trim()
  const unit = extractUnit(title, school)
  const fullUnit = unit ? `${school} ${unit}` : school

  const entry: CampEntry = {
    id: generateId(school, title, link),
    school,
    unit: unit || school,
    title,
    deadline,
    link,
    source,
    sourceCategory: category,
    tags: generateTags(title, fullUnit),
    status: isExpired ? 'expired' : deadline === '暂无' ? 'unknown' : 'active',
    isBioRelated: isBioRelated(title, fullUnit),
    createdAt: new Date().toISOString(),
  }

  return entry
}

/**
 * 生成去重用的 ID
 */
function generateId(school: string, title: string, link: string): string {
  const raw = `${school}|${title}|${link}`
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `entry_${Math.abs(hash).toString(36)}`
}

/**
 * 解析整个 Markdown 文件
 * 自动检测是3列（按截止日期）还是2列（按学校分类）格式
 */
export function parseMarkdown(content: string, sourceFile: string, category: string): CampEntry[] {
  const lines = content.split('\n')
  const entries: CampEntry[] = []
  let currentSchool = ''
  let is3ColFormat = false
  let tableStarted = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 检测表格格式：查看第一个表头行
    if (line.startsWith('|') && !tableStarted) {
      tableStarted = true
      const headerCells = line.split('|').map(c => c.trim()).filter(c => c !== '')
      is3ColFormat = headerCells.length >= 3 && headerCells.some(c => c.includes('学校'))
    }

    // 2列格式：从标题行提取学校名
    if (!is3ColFormat) {
      let newSchool = ''

      // 匹配 ### 学校名 或 ## 学校名 (Markdown 格式)
      const mdSchoolMatch = line.match(/^#{2,4}\s+(.+?)(?:\s*$)/)
      if (mdSchoolMatch) {
        const raw = mdSchoolMatch[1].trim()
        if (!raw.includes('合集') && !raw.includes('通知') && !raw.includes('排序') &&
            !raw.includes('导航') && !raw.includes('清单') && raw.length < 30) {
          newSchool = raw.replace(/\(.*?\)/, '').trim()
        }
      }

      // 匹配 <h3>学校名</h3> (HTML 格式)
      const htmlSchoolMatch = line.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i)
      if (htmlSchoolMatch) {
        const raw = htmlSchoolMatch[1].replace(/<[^>]+>/g, '').trim()
        if (raw && !raw.includes('合集') && !raw.includes('通知') && !raw.includes('排序') &&
            !raw.includes('导航') && !raw.includes('清单') && raw.length < 30) {
          newSchool = raw
        }
      }

      if (newSchool) {
        currentSchool = newSchool
        tableStarted = false  // 新学校，重置表格状态
      }
    }

    // 解析表格数据行
    if (line.startsWith('|') && tableStarted) {
      // 跳过表头行和分隔行
      if (line.includes('---') || line.includes('截止') || line.includes('学校')) {
        continue
      }

      if (is3ColFormat) {
        const entry = parse3ColRow(line, sourceFile, category)
        if (entry) entries.push(entry)
      } else {
        // 2列格式：截止时间 | 通知
        const cells = line.split('|').map(c => c.trim()).filter(c => c !== '')
        if (cells.length >= 2) {
          const [rawDeadline, rawTitle] = cells
          const { deadline, isExpired } = parseDeadline(rawDeadline)
          const { title, link } = parseMarkdownLink(rawTitle)

          if (title || link) {
            const unit = extractUnit(title, currentSchool)
            const fullUnit = unit ? `${currentSchool} ${unit}` : currentSchool

            entries.push({
              id: generateId(currentSchool, title, link),
              school: currentSchool,
              unit: unit || currentSchool,
              title,
              deadline,
              link,
              source: sourceFile,
              sourceCategory: category,
              tags: generateTags(title, fullUnit),
              status: isExpired ? 'expired' : deadline === '暂无' ? 'unknown' : 'active',
              isBioRelated: isBioRelated(title, fullUnit),
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }

    // 非表格行重置表格状态
    if (!line.startsWith('|') && tableStarted && line === '') {
      tableStarted = false
    }
  }

  return entries
}

/**
 * 去重：同一学校+标题+链接只保留一条，合并来源
 */
export function deduplicateEntries(entries: CampEntry[]): CampEntry[] {
  const map = new Map<string, CampEntry>()

  for (const entry of entries) {
    const key = `${entry.school}|${entry.title}|${entry.link}`
    const existing = map.get(key)

    if (existing) {
      // 保留更精确的截止日期
      if (existing.deadline === '暂无' && entry.deadline !== '暂无') {
        existing.deadline = entry.deadline
        existing.status = entry.status
      }
      // 合并来源
      if (!existing.source.includes(entry.source)) {
        existing.source += `, ${entry.source}`
      }
      // 合并标签
      for (const tag of entry.tags) {
        if (!existing.tags.includes(tag)) {
          existing.tags.push(tag)
        }
      }
    } else {
      map.set(key, { ...entry })
    }
  }

  return Array.from(map.values())
}
