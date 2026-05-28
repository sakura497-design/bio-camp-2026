// 学校 Logo 映射表
// 使用各高校官网 favicon 或公开 logo
// 如果加载失败，组件会 fallback 到首字显示

const LOGO_MAP: Record<string, string> = {
  '清华大学': 'https://www.tsinghua.edu.cn/favicon.ico',
  '北京大学': 'https://www.pku.edu.cn/favicon.ico',
  '浙江大学': 'https://www.zju.edu.cn/favicon.ico',
  '上海交通大学': 'https://www.sjtu.edu.cn/favicon.ico',
  '复旦大学': 'https://www.fudan.edu.cn/favicon.ico',
  '南京大学': 'https://www.nju.edu.cn/favicon.ico',
  '中国科学技术大学': 'https://www.ustc.edu.cn/favicon.ico',
  '华中科技大学': 'https://www.hust.edu.cn/favicon.ico',
  '西安交通大学': 'https://www.xjtu.edu.cn/favicon.ico',
  '中山大学': 'https://www.sysu.edu.cn/favicon.ico',
  '北京协和医学院': 'https://www.pumc.edu.cn/favicon.ico',
  '同济大学': 'https://www.tongji.edu.cn/favicon.ico',
  '北京师范大学': 'https://www.bnu.edu.cn/favicon.ico',
  '南开大学': 'https://www.nankai.edu.cn/favicon.ico',
  '厦门大学': 'https://www.xmu.edu.cn/favicon.ico',
  '吉林大学': 'https://www.jlu.edu.cn/favicon.ico',
  '南方科技大学': 'https://www.sustech.edu.cn/favicon.ico',
  '上海科技大学': 'https://www.shanghaitech.edu.cn/favicon.ico',
  '中国海洋大学': 'https://www.ouc.edu.cn/favicon.ico',
  '西湖大学': 'https://www.westlake.edu.cn/favicon.ico',
  '中国科学院': 'https://www.cas.cn/favicon.ico',
  '中国医学科学院': 'https://www.pumc.edu.cn/favicon.ico',
  '广州医科大学': 'https://www.gzhmu.edu.cn/favicon.ico',
  '海南大学': 'https://www.hainanu.edu.cn/favicon.ico',
  '安徽医科大学': 'https://www.ahmu.edu.cn/favicon.ico',
  '暨南大学': 'https://www.jnu.edu.cn/favicon.ico',
  '华东政法大学': 'https://www.ecupl.edu.cn/favicon.ico',
  '上海财经大学': 'https://www.shufe.edu.cn/favicon.ico',
  '北京第二外国语学院': 'https://www.bisu.edu.cn/favicon.ico',
  '中国科学院大学': 'https://www.ucas.ac.cn/favicon.ico',
  '香港大学': 'https://www.hku.hk/favicon.ico',
  '香港中文大学(深圳)': 'https://www.cuhk.edu.cn/favicon.ico',
  '澳门大学': 'https://www.um.edu.mo/favicon.ico',
  '广东工业大学': 'https://www.gdut.edu.cn/favicon.ico',
  '福建农林大学': 'https://www.fafu.edu.cn/favicon.ico',
  '重庆邮电大学': 'https://www.cqupt.edu.cn/favicon.ico',
  '上海人工智能实验室': 'https://www.shlab.org.cn/favicon.ico',
}

export function getSchoolLogo(school: string): string | null {
  return LOGO_MAP[school] || null
}

// 学校首字（用于 logo 加载失败时的 fallback）
export function getSchoolInitial(school: string): string {
  // 处理 "中国科学技术大学" -> "中", "清华大学" -> "清"
  return school.charAt(0)
}

// 根据学校名生成一致的背景色
const COLOR_POOL = [
  'bg-emerald-100 text-emerald-700',
  'bg-blue-100 text-blue-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
]

export function getSchoolColor(school: string): string {
  let hash = 0
  for (let i = 0; i < school.length; i++) {
    hash = ((hash << 5) - hash) + school.charCodeAt(i)
    hash |= 0
  }
  return COLOR_POOL[Math.abs(hash) % COLOR_POOL.length]
}
