import { useState } from 'react'
import { Bookmark, BookmarkCheck, Clock, ArrowUpRight } from 'lucide-react'
import type { CampEntry } from '../types'
import { getSchoolLogo, getSchoolInitial, getSchoolColor } from '../lib/school-logos'

interface CampCardProps {
  entry: CampEntry
  isBookmarked: boolean
  onToggleBookmark: (id: string) => void
}

function getDeadlineInfo(deadline: string): { status: string; label: string; cls: string } {
  if (deadline === '暂无') return { status: 'unknown', label: '待定', cls: 'status-unknown' }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(deadline); d.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return { status: 'expired', label: '已截止', cls: 'status-expired' }
  if (diff === 0) return { status: 'today', label: '今日截止', cls: 'status-urgent' }
  if (diff <= 3) return { status: 'urgent', label: `${Math.ceil(diff)}天后`, cls: 'status-urgent' }
  if (diff <= 7) return { status: 'soon', label: `${Math.ceil(diff)}天后`, cls: 'status-active' }
  return { status: 'normal', label: deadline, cls: 'status-active' }
}

export function CampCard({ entry, isBookmarked, onToggleBookmark }: CampCardProps) {
  const [imgError, setImgError] = useState(false)
  const deadline = getDeadlineInfo(entry.deadline)
  const logoUrl = getSchoolLogo(entry.school)
  const initial = getSchoolInitial(entry.school)
  const colorClass = getSchoolColor(entry.school)

  return (
    <article className="camp-card group p-5 sm:p-6">
      {/* 学校信息 */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center
          border border-[rgba(168,28,46,0.2)] shadow-[0_0_8px_rgba(168,28,46,0.1)]
          ${!logoUrl || imgError ? colorClass : 'bg-[rgba(11,8,16,0.5)]'}`}>
          {logoUrl && !imgError ? (
            <img src={logoUrl} alt={entry.school} className="w-6 h-6 object-contain"
              onError={() => setImgError(true)} loading="lazy" />
          ) : (
            <span className="text-sm font-bold">{initial}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-[var(--gold-bright)] text-sm leading-tight truncate"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            {entry.school}
          </div>
          {entry.unit !== entry.school && (
            <div className="text-[11px] text-[var(--text-dim)] mt-0.5 truncate">{entry.unit}</div>
          )}
        </div>
        <button onClick={(e) => { e.preventDefault(); onToggleBookmark(entry.id) }}
          className={`p-1.5 rounded-lg transition-all duration-200
            ${isBookmarked ? 'text-[var(--gold)] opacity-100' : 'text-[var(--text-dim)] opacity-0 group-hover:opacity-100 hover:text-[var(--gold)]'}`}
          title={isBookmarked ? '取消收藏' : '收藏'}>
          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* 标题 */}
      <h3 className="text-[15px] font-bold leading-relaxed text-[var(--text-main)] mb-3 line-clamp-2
        group-hover:text-[var(--gold-bright)] transition-colors duration-200"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
        {entry.title}
      </h3>

      {/* 标签 */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {entry.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-[10px] text-[var(--text-dim)]">+{entry.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* 底部 */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(168,28,46,0.12)]">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-[var(--text-dim)]" />
          <span className={`text-xs font-bold ${deadline.status === 'expired' ? 'text-[#6a5a4a] line-through' : 'text-[var(--gold-bright)]'}`}>
            {entry.deadline === '暂无' ? '截止待定' : entry.deadline}
          </span>
          <span className={`status-badge ${deadline.cls}`}>{deadline.label}</span>
        </div>
        {entry.link && entry.link !== 'nan' && (
          <a href={entry.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-dim)]
              hover:text-[var(--gold)] transition-colors duration-200">
            原文
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        )}
      </div>
    </article>
  )
}
