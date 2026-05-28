// 生物相关关键词匹配规则
// 分为三档：核心（一定收录）、强相关（收录）、弱相关（标题+单位同时命中才收录）

export const BIO_KEYWORDS = {
  // 核心关键词 - 命中即收录
  core: [
    '生命科学', '生命学院', '生科', '生物学', '生物学院', '生物系',
    '生物技术', '生物工程', '生物医学', '基础医学', '药学', '药学院',
    '药理', '药物', '药化',
    '遗传学', '细胞生物', '分子生物', '神经科学', '神经生物',
    '微生物', '微生物学', '病毒学', '免疫学', '免疫',
    '生态学', '植物学', '动物学', '海洋生物',
    '农学', '农学院', '作物学', '园艺', '植保', '植物保护',
    '公共卫生', '公卫',
    '生物化学', '生化', '生物信息', '生信',
    '生物物理', '结构生物',
    '基因组', '蛋白质组', '代谢组',
    '干细胞', '再生医学', '肿瘤生物',
    '北京生命科学研究所', 'NIBS',
    '生物研究所', '药物研究所', '上海药物所',
    '热带植物园', '植物研究所', '动物研究所',
    '微生物研究所', '病毒研究所',
    '昆明动物所', '水生生物',
    '生物物理所', '遗传与发育',
    '前沿生物', '生物技术研究院',
    '生命健康', '生命医学',
    '脑科学', '脑研究中心',
  ],

  // 强相关 - 命中即收录
  strong: [
    '医学', '医学院', '医学部', '医学科学院',
    '临床', '基础医', '预防医学',
    '护理', '护理学',
    '口腔', '口腔医学',
    '中西医', '中医',
    '法医', '法医学',
    '检验', '检验医学',
    '影像', '影像医学',
    '康复', '康复医学',
    '食品科学', '食品工程', '食品安全',
    '环境科学', '环境工程', '环境学院',
    '化学', '化学系', '化学学院',
    '化学生物',
    '生物化工',
    '生命', '生科院',
    '组学', '系统生物',
    '合成生物',
    '农业', '农科',
    '林学', '林学院',
    '水产', '水产学',
    '畜牧', '兽医', '兽医学',
    '草学', '草业',
    '烟草',
    '血研所', '输血',
    '实验动物',
    '生物医学工程',
  ],

  // 弱相关 - 需要标题和单位同时命中
  weak: [
    '实验室', '研究中心', '研究所',
    '暑期', '夏令营', '交流营',
    '博士', '研究生', '硕士',
  ],
}

/**
 * 判断条目是否与生物相关
 * @param title 通知标题
 * @param unit 单位名称（学校+学院）
 * @returns 是否生物相关
 */
export function isBioRelated(title: string, unit: string): boolean {
  const text = `${title} ${unit}`.toLowerCase()

  // 核心关键词命中即收录
  for (const kw of BIO_KEYWORDS.core) {
    if (text.includes(kw.toLowerCase())) {
      return true
    }
  }

  // 强相关关键词命中即收录
  for (const kw of BIO_KEYWORDS.strong) {
    if (text.includes(kw.toLowerCase())) {
      return true
    }
  }

  // 弱相关：需要标题和单位同时命中相关词
  const titleLower = title.toLowerCase()
  const unitLower = unit.toLowerCase()

  const hasWeakInTitle = BIO_KEYWORDS.weak.some(kw => titleLower.includes(kw.toLowerCase()))
  const hasBioInUnit = [...BIO_KEYWORDS.core, ...BIO_KEYWORDS.strong].some(kw =>
    unitLower.includes(kw.toLowerCase())
  )

  // 弱相关标题 + 生物相关单位 = 收录
  if (hasWeakInTitle && hasBioInUnit) {
    return true
  }

  return false
}

/**
 * 为条目生成标签
 */
export function generateTags(title: string, unit: string): string[] {
  const text = `${title} ${unit}`
  const tags: string[] = []

  const tagRules: [string, string][] = [
    ['生命科学', '生命科学'],
    ['生物学', '生物学'],
    ['生物技术', '生物技术'],
    ['生物工程', '生物工程'],
    ['生物医学', '生物医学'],
    ['基础医学', '基础医学'],
    ['药学', '药学'],
    ['药物', '药物'],
    ['遗传', '遗传学'],
    ['细胞生物', '细胞生物学'],
    ['分子生物', '分子生物学'],
    ['神经', '神经科学'],
    ['微生物', '微生物学'],
    ['免疫', '免疫学'],
    ['生态', '生态学'],
    ['植物', '植物学'],
    ['动物', '动物学'],
    ['海洋生物', '海洋生物'],
    ['农学', '农学'],
    ['公卫', '公共卫生'],
    ['生物信息', '生物信息学'],
    ['脑科学', '脑科学'],
    ['干细胞', '干细胞'],
    ['肿瘤', '肿瘤学'],
    ['病毒', '病毒学'],
    ['合成生物', '合成生物学'],
    ['基因', '基因组学'],
    ['临床', '临床医学'],
    ['口腔', '口腔医学'],
    ['中医', '中医学'],
    ['食品', '食品科学'],
    ['环境', '环境科学'],
    ['化学', '化学'],
    ['兽医', '兽医学'],
    ['农', '农学'],
  ]

  const textLower = text.toLowerCase()
  for (const [keyword, tag] of tagRules) {
    if (textLower.includes(keyword.toLowerCase()) && !tags.includes(tag)) {
      tags.push(tag)
    }
  }

  return tags
}
