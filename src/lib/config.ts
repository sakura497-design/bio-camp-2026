// GitHub 仓库配置
export const REPO_OWNER = 'shenyanpai'
export const REPO_NAME = 'awesome-summer-camp-2026'
export const BRANCH = 'main'

export const RAW_BASE = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}`

// 要抓取的文件列表（按优先级排序）
export const SOURCE_FILES = [
  { file: 'README-医农类.md', category: '医农类' },
  { file: 'README-医农类-截止日期.md', category: '医农类' },
  { file: 'README-理工类.md', category: '理工类' },
  { file: 'README-理工类-截止日期.md', category: '理工类' },
  { file: 'README.md', category: '主文件' },
  { file: 'README-截止日期.md', category: '主文件' },
]

// 仓库页面链接
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`
export const WEBSITE_URL = 'https://www.baoyantongzhi.com'
