import { SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw, Search, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { CampEntry, Filters, SortConfig } from '../types'

interface FilterBarProps {
  data: CampEntry[]
  filters: Filters
  sort: SortConfig
  onFiltersChange: (f: Filters) => void
  onSortChange: (s: SortConfig) => void
}

export function FilterBar({ data, filters, sort, onFiltersChange, onSortChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)

  const uniqueSchools = useMemo(() => [...new Set(data.map(d => d.school))].filter(Boolean).sort(), [data])
  const uniqueSources = useMemo(() => [...new Set(data.map(d => d.sourceCategory))].filter(Boolean).sort(), [data])

  const hasActiveFilters = filters.search || filters.schools.length > 0 || filters.deadlineRange !== 'all' ||
    filters.sourceCategory.length > 0 || filters.onlyOpen

  const activeCount = [filters.schools.length > 0, filters.deadlineRange !== 'all', filters.sourceCategory.length > 0, filters.onlyOpen].filter(Boolean).length

  const clearFilters = () => {
    onFiltersChange({ search: '', schools: [], statuses: [], deadlineRange: 'all', sourceCategory: [], onlyOpen: false })
  }

  return (
    <div className="filter-toolbar sticky top-0 z-30">
      {/* 搜索栏 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)] opacity-40" />
          <input type="text" value={filters.search}
            onChange={e => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="检索学校、标题、单位、标签..."
            className="filter-input w-full pl-11 pr-9 py-2.5 rounded-full text-sm font-semibold outline-none transition-all duration-300" />
          {filters.search && (
            <button onClick={() => onFiltersChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--gold)]">
              <X size={14} />
            </button>
          )}
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border
            ${hasActiveFilters
              ? 'border-[var(--crimson)] bg-[rgba(168,28,46,0.15)] text-[var(--gold-bright)] shadow-[0_0_10px_var(--glow-red)]'
              : 'border-[rgba(201,163,90,0.15)] bg-[rgba(18,12,22,0.5)] text-[var(--text-dim)] hover:text-[var(--gold)] hover:border-[rgba(201,163,90,0.35)]'
            }`}>
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline tracking-wide">筛选</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--crimson)] text-white text-[10px] flex items-center justify-center font-bold shadow-[0_0_6px_var(--glow-red)]">
              {activeCount}
            </span>
          )}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        {hasActiveFilters && (
          <button onClick={clearFilters}
            className="p-2 rounded-full text-[var(--text-dim)] hover:text-[var(--crimson)] border border-transparent hover:border-[rgba(168,28,46,0.25)] transition-all"
            title="清空筛选">
            <RotateCcw size={15} />
          </button>
        )}
      </div>

      {/* 展开面板 */}
      {expanded && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 space-y-4 border-t border-[rgba(168,28,46,0.1)] pt-4">
          {/* 开关 + 排序 */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input type="checkbox" checked={filters.onlyOpen}
                  onChange={e => onFiltersChange({ ...filters, onlyOpen: e.target.checked })}
                  className="peer sr-only" />
                <div className="w-9 h-5 rounded-full bg-[rgba(100,80,60,0.2)] peer-checked:bg-[var(--crimson)] transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--gold-bright)] shadow-sm peer-checked:translate-x-4 transition-transform" />
              </div>
              <span className="text-sm text-[var(--text-dim)]">仅看可报名</span>
            </label>
            <div className="h-4 w-px bg-[rgba(168,28,46,0.15)]" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-[var(--text-dim)] tracking-wider uppercase">排序</span>
              {[
                { field: 'deadline', direction: 'asc', label: '截止日↑' },
                { field: 'deadline', direction: 'desc', label: '截止日↓' },
                { field: 'createdAt', direction: 'desc', label: '最近更新' },
                { field: 'school', direction: 'asc', label: '按学校' },
              ].map(opt => (
                <button key={`${opt.field}-${opt.direction}`}
                  onClick={() => onSortChange({ field: opt.field as SortConfig['field'], direction: opt.direction as SortConfig['direction'] })}
                  className={`filter-btn ${sort.field === opt.field && sort.direction === opt.direction ? 'active' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 截止日期 */}
          <div>
            <label className="text-[10px] font-bold text-[var(--text-dim)] mb-2 block tracking-[3px] uppercase">截止日期</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: '全部' },
                { value: 'week', label: '7天内' },
                { value: 'month', label: '30天内' },
                { value: 'expired', label: '已截止' },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => onFiltersChange({ ...filters, deadlineRange: opt.value as Filters['deadlineRange'] })}
                  className={`filter-btn ${filters.deadlineRange === opt.value ? 'active' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 学校 */}
          <div>
            <label className="text-[10px] font-bold text-[var(--text-dim)] mb-2 block tracking-[3px] uppercase">学校</label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {uniqueSchools.map(school => (
                <button key={school}
                  onClick={() => {
                    const next = filters.schools.includes(school) ? filters.schools.filter(s => s !== school) : [...filters.schools, school]
                    onFiltersChange({ ...filters, schools: next })
                  }}
                  className={`filter-btn ${filters.schools.includes(school) ? 'active' : ''}`}>
                  {school}
                </button>
              ))}
            </div>
          </div>

          {/* 来源 */}
          <div>
            <label className="text-[10px] font-bold text-[var(--text-dim)] mb-2 block tracking-[3px] uppercase">来源</label>
            <div className="flex flex-wrap gap-2">
              {uniqueSources.map(src => (
                <button key={src}
                  onClick={() => {
                    const next = filters.sourceCategory.includes(src) ? filters.sourceCategory.filter(s => s !== src) : [...filters.sourceCategory, src]
                    onFiltersChange({ ...filters, sourceCategory: next })
                  }}
                  className={`filter-btn ${filters.sourceCategory.includes(src) ? 'active' : ''}`}>
                  {src}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
