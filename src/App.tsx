import { useState, useMemo, useCallback, useEffect } from 'react'
import { RefreshCw, AlertCircle, ArrowUp, Bookmark } from 'lucide-react'
import { useData } from './hooks/useData'
import { FilterBar } from './components/FilterBar'
import { CampCard } from './components/CampCard'
import type { Filters, SortConfig } from './types'

function App() {
  const { data, loading, error, lastUpdated, bookmarks, toggleBookmark, refresh } = useData()

  const [filters, setFilters] = useState<Filters>({
    search: '',
    schools: [],
    statuses: [],
    deadlineRange: 'all',
    sourceCategory: [],
    onlyOpen: false,
  })
  const [sort, setSort] = useState<SortConfig>({ field: 'deadline', direction: 'asc' })
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false)

  // 初始化花瓣和粒子
  useEffect(() => {
    initParticles()
    initRosePetals()
  }, [])

  const filteredData = useMemo(() => {
    let result = [...data]
    if (filters.search) {
      const kw = filters.search.toLowerCase()
      result = result.filter(e =>
        e.title.toLowerCase().includes(kw) || e.school.toLowerCase().includes(kw) ||
        e.unit.toLowerCase().includes(kw) || e.tags.some(t => t.toLowerCase().includes(kw))
      )
    }
    if (filters.schools.length > 0) result = result.filter(e => filters.schools.includes(e.school))
    if (filters.deadlineRange !== 'all') {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      result = result.filter(e => {
        if (e.deadline === '暂无') return filters.deadlineRange === 'all'
        const d = new Date(e.deadline); d.setHours(0, 0, 0, 0)
        const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        switch (filters.deadlineRange) {
          case 'expired': return diff < 0
          case 'week': return diff >= 0 && diff <= 7
          case 'month': return diff >= 0 && diff <= 30
          default: return true
        }
      })
    }
    if (filters.onlyOpen) {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      result = result.filter(e => { if (e.deadline === '暂无') return true; return new Date(e.deadline).getTime() >= today.getTime() })
    }
    if (filters.sourceCategory.length > 0) result = result.filter(e => filters.sourceCategory.includes(e.sourceCategory))
    if (showBookmarksOnly) result = result.filter(e => bookmarks.has(e.id))
    result.sort((a, b) => {
      if (sort.field === 'deadline') {
        const aV = a.deadline === '暂无' ? 'z' : a.deadline
        const bV = b.deadline === '暂无' ? 'z' : b.deadline
        return sort.direction === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV)
      }
      if (sort.field === 'school') return sort.direction === 'asc' ? a.school.localeCompare(b.school, 'zh-CN') : b.school.localeCompare(a.school, 'zh-CN')
      if (sort.field === 'createdAt') return sort.direction === 'asc' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt)
      return 0
    })
    return result
  }, [data, filters, sort, bookmarks, showBookmarksOnly])

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const total = data.length
    const active = data.filter(e => { if (e.deadline === '暂无') return true; return new Date(e.deadline).getTime() >= today.getTime() }).length
    return { total, active, expired: total - active }
  }, [data])

  const handleSortChange = useCallback((s: SortConfig) => setSort(s), [])

  return (
    <div className="min-h-screen relative">
      {/* 背景层 */}
      <div className="bg-layer" />
      <div className="bg-overlay" />

      {/* 装饰齿轮 */}
      <div className="gears">
        <div className="gear gear-1" />
        <div className="gear gear-2" />
        <div className="gear gear-3" />
        <div className="gear gear-4" />
      </div>

      {/* 金色粒子 */}
      <div className="particles-bg" id="particlesBg" />

      {/* 蔷薇花瓣 */}
      <div className="rose-petals" id="rosePetals" />

      {/* 顶部导航 */}
      <header className="relative z-10">
        <div className="glass-strong border-b border-[rgba(168,28,46,0.15)] px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-[rgba(201,163,90,0.4)] flex items-center justify-center
                bg-gradient-to-br from-[var(--crimson)] to-[#4a0a12] shadow-[0_0_12px_rgba(168,28,46,0.2)]"
                style={{ animation: 'gearSpin 20s linear infinite' }}>
                <span className="text-[var(--gold-bright)] text-sm font-bold">B</span>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[var(--gold-bright)] tracking-wide"
                  style={{ textShadow: '0 0 16px rgba(201,163,90,0.3)' }}>
                  BioCamp Navigator
                </h1>
                <p className="text-[10px] text-[var(--text-dim)] tracking-widest uppercase">2026 生物相关保研夏令营</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold
                  bg-gradient-to-br from-[var(--crimson)] to-[#4a0a12] text-[var(--gold-bright)]
                  border border-[var(--crimson)] shadow-[0_0_14px_var(--glow-red)]
                  hover:shadow-[0_0_20px_var(--glow-red)] disabled:opacity-50 transition-all">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">刷新</span>
              </button>
            </div>
          </div>
        </div>

        {/* 统计条 */}
        <div className="glass border-b border-[rgba(168,28,46,0.1)] px-4 sm:px-6 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-6 flex-wrap">
            {[
              { label: '全部', value: stats.total, icon: '⏳' },
              { label: '可报名', value: stats.active, icon: '✦' },
              { label: '已截止', value: stats.expired, icon: '✕' },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-sm opacity-50">{s.icon}</span>
                <span className="text-xl font-bold text-[var(--gold-bright)]" style={{ fontFamily: 'Cinzel, serif', textShadow: '0 0 8px rgba(201,163,90,0.2)' }}>
                  {s.value}
                </span>
                <span className="text-[10px] text-[var(--text-dim)] tracking-wide">{s.label}</span>
              </div>
            ))}
            <div className="flex-1" />
            {bookmarks.size > 0 && (
              <button onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                  ${showBookmarksOnly
                    ? 'bg-[rgba(168,28,46,0.15)] text-[var(--gold-bright)] border-[var(--crimson)]'
                    : 'text-[var(--text-dim)] border-[rgba(201,163,90,0.15)] hover:text-[var(--gold)] hover:border-[rgba(201,163,90,0.35)]'
                  }`}>
                <Bookmark size={12} fill={showBookmarksOnly ? 'currentColor' : 'none'} />
                {bookmarks.size}
              </button>
            )}
            {lastUpdated && (
              <span className="text-[10px] text-[var(--text-dim)] tracking-wide">
                {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 筛选工具栏 */}
      <FilterBar data={data} filters={filters} sort={sort} onFiltersChange={setFilters} onSortChange={handleSortChange} />

      {/* 主体 */}
      <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-[rgba(168,28,46,0.2)] border-t-[var(--gold)] animate-spin" />
            <p className="text-sm text-[var(--text-dim)] mt-4 tracking-wide">正在获取最新数据...</p>
          </div>
        )}

        {error && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full bg-[rgba(168,28,46,0.1)] flex items-center justify-center mb-4">
              <AlertCircle size={24} className="text-[var(--crimson)]" />
            </div>
            <p className="text-sm font-bold text-[var(--gold-bright)] mb-1">数据加载失败</p>
            <p className="text-xs text-[var(--text-dim)] mb-4">{error}</p>
            <button onClick={refresh} className="px-5 py-2 rounded-full bg-gradient-to-br from-[var(--crimson)] to-[#4a0a12]
              text-[var(--gold-bright)] text-sm font-bold border border-[var(--crimson)] shadow-[0_0_14px_var(--glow-red)]">
              重新加载
            </button>
          </div>
        )}

        {!loading && !error && filteredData.length === 0 && data.length > 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-4xl opacity-30 mb-3">🥀</span>
            <p className="text-sm font-bold text-[var(--gold-bright)] mb-1">时间之流中，未寻得匹配项</p>
            <p className="text-xs text-[var(--text-dim)]">尝试调整筛选条件</p>
          </div>
        )}

        {filteredData.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-dim)] tracking-wide">共 {filteredData.length} 条</span>
                {filteredData.length !== data.length && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(168,28,46,0.1)] text-[#d07070] border border-[rgba(168,28,46,0.2)]">
                    已筛选
                  </span>
                )}
              </div>
              {showBookmarksOnly && (
                <button onClick={() => setShowBookmarksOnly(false)}
                  className="text-xs text-[var(--text-dim)] hover:text-[var(--gold)] transition-colors tracking-wide">
                  查看全部
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredData.map((entry, i) => (
                <div key={entry.id} style={{ animation: `fadeUp 0.45s ease both`, animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
                  <CampCard entry={entry} isBookmarked={bookmarks.has(entry.id)} onToggleBookmark={toggleBookmark} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* 回到顶部 */}
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full z-20
          bg-[rgba(18,12,22,0.75)] border border-[rgba(168,28,46,0.2)] backdrop-blur-md
          text-[var(--text-dim)] hover:text-[var(--gold)] hover:border-[rgba(201,163,90,0.3)]
          flex items-center justify-center transition-all shadow-lg">
        <ArrowUp size={16} />
      </button>

      {/* 底部 — Sakura */}
      <footer className="relative z-10 text-center py-12 overflow-hidden">
        {/* 脉冲光环 */}
        {[0, 1, 2].map(i => (
          <div key={i} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full
            border border-[rgba(168,28,46,0.08)] pointer-events-none"
            style={{ animation: `footerPulse 4s ease-out infinite`, animationDelay: `${i * 1.3}s` }} />
        ))}

        <div className="relative inline-block px-16 py-7">
          {/* 发光边框 */}
          <div className="absolute inset-0 border border-transparent pointer-events-none"
            style={{
              borderImage: 'linear-gradient(135deg, var(--crimson), var(--gold), var(--crimson), var(--gold)) 1',
              opacity: 0.4,
              animation: 'borderShimmer 4s linear infinite',
            }} />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(168,28,46,0.05)] to-[rgba(201,163,90,0.03)]" />

          <div className="text-[10px] text-[var(--text-dim)] tracking-[4px] uppercase mb-2 opacity-60">Made With Love</div>
          <div className="relative">
            <div className="text-2xl font-bold tracking-[6px] bg-gradient-to-br from-[var(--crimson-light)] via-[var(--gold-bright)] via-[var(--crimson)] to-[var(--gold)]
              bg-[length:300%_300%] bg-clip-text text-transparent"
              style={{ fontFamily: 'Cinzel, Noto Serif SC, serif', animation: 'sakuraGradient 5s ease infinite' }}>
              制作 By Sakura
            </div>
            {/* 发光层 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--crimson-light)] to-[var(--gold-bright)]
              bg-clip-text text-transparent blur-xl opacity-40 pointer-events-none"
              style={{ animation: 'sakuraGradient 5s ease infinite' }}>
              制作 By Sakura
            </div>
          </div>
          <div className="text-[10px] text-[var(--text-dim)] tracking-[2px] mt-2 opacity-50">
            数据仅供参考，请以各高校官方通知为准
          </div>
        </div>

        {/* 装饰花瓣 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {['❀', '✾', '✿', '❁'].map((c, i) => (
            <span key={i} className="absolute bottom-0 text-xs opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                color: ['#c41e3a', '#a81c2e', '#d43048', '#c9a35a'][i],
                animation: `petalRise linear infinite`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
                fontSize: `${10 + Math.random() * 6}px`,
              }}>
              {c}
            </span>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes footerPulse {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
        }
        @keyframes borderShimmer {
          0%   { border-image: linear-gradient(0deg, var(--crimson), var(--gold), var(--crimson)) 1; }
          25%  { border-image: linear-gradient(90deg, var(--gold), var(--crimson), var(--gold)) 1; }
          50%  { border-image: linear-gradient(180deg, var(--crimson), var(--gold), var(--crimson)) 1; }
          75%  { border-image: linear-gradient(270deg, var(--gold), var(--crimson), var(--gold)) 1; }
          100% { border-image: linear-gradient(360deg, var(--crimson), var(--gold), var(--crimson)) 1; }
        }
        @keyframes sakuraGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes petalRise {
          0%   { opacity: 0; transform: translateY(0) rotate(0deg) translateX(0); }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-120px) rotate(540deg) translateX(40px); }
        }
      `}</style>
    </div>
  )
}

// 初始化金色粒子
function initParticles() {
  const el = document.getElementById('particlesBg')
  if (!el || el.children.length > 0) return
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('div')
    d.className = 'gold-particle'
    d.style.left = Math.random() * 100 + '%'
    d.style.top = 40 + Math.random() * 60 + '%'
    d.style.animationDelay = (Math.random() * 8).toFixed(1) + 's'
    d.style.animationDuration = (4 + Math.random() * 5).toFixed(1) + 's'
    d.style.width = d.style.height = (2 + Math.random() * 2) + 'px'
    el.appendChild(d)
  }
}

// 初始化蔷薇花瓣
function initRosePetals() {
  const el = document.getElementById('rosePetals')
  if (!el || el.children.length > 0) return
  const types = ['❀', '✾', '✿', '❁', '✽', '🌸']
  const colors = ['#c41e3a', '#a81c2e', '#d43048', '#e05060', '#c9a35a', '#b8860b', '#8b0000', '#d07070']
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span')
    p.className = 'rose-petal'
    p.textContent = types[i % types.length]
    p.style.left = Math.random() * 100 + '%'
    p.style.color = colors[i % colors.length]
    p.style.fontSize = (10 + Math.random() * 14) + 'px'
    p.style.animationDelay = (Math.random() * 18).toFixed(1) + 's'
    p.style.animationDuration = (10 + Math.random() * 12).toFixed(1) + 's'
    p.style.filter = `drop-shadow(0 0 ${2 + Math.random() * 3}px rgba(168,28,46,0.2))`
    el.appendChild(p)
  }
}

export default App
