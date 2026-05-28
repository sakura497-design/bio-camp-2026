import { parseMarkdown, deduplicateEntries } from '../src/lib/markdown-parser'

const REPO_BASE = 'https://raw.githubusercontent.com/shenyanpai/awesome-summer-camp-2026/main'

const FILES = [
  { file: 'README-医农类.md', category: '医农类' },
  { file: 'README-医农类-截止日期.md', category: '医农类' },
  { file: 'README-理工类.md', category: '理工类' },
  { file: 'README-理工类-截止日期.md', category: '理工类' },
  { file: 'README.md', category: '主文件' },
]

async function main() {
  console.log('开始测试解析器...\n')

  const allEntries: any[] = []

  for (const { file, category } of FILES) {
    const url = `${REPO_BASE}/${file}`
    console.log(`正在获取: ${file}`)

    try {
      const res = await fetch(url)
      if (!res.ok) {
        console.log(`  ❌ 获取失败: ${res.status}`)
        continue
      }
      const content = await res.text()
      const entries = parseMarkdown(content, file, category)
      console.log(`  ✅ 解析出 ${entries.length} 条数据`)
      allEntries.push(...entries)
    } catch (err) {
      console.log(`  ❌ 错误: ${err}`)
    }
  }

  console.log(`\n总解析: ${allEntries.length} 条`)

  // 去重
  const deduped = deduplicateEntries(allEntries)
  console.log(`去重后: ${deduped.length} 条`)

  // 过滤生物相关
  const bioOnly = deduped.filter(e => e.isBioRelated)
  console.log(`生物相关: ${bioOnly.length} 条`)

  // 显示前10条
  console.log('\n前10条生物相关数据:')
  bioOnly.slice(0, 10).forEach((e, i) => {
    console.log(`  ${i + 1}. [${e.school}] ${e.title}`)
    console.log(`     截止: ${e.deadline} | 标签: ${e.tags.join(', ')}`)
    console.log(`     来源: ${e.sourceCategory} | 链接: ${e.link ? '有' : '无'}`)
  })
}

main().catch(console.error)
