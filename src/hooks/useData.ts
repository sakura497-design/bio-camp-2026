import { useState, useEffect, useCallback } from 'react'
import type { CampEntry } from '../types'
import { fetchAllData, getCachedData, cacheData, getBookmarks, saveBookmarks } from '../lib/fetcher'

export function useData() {
  const [data, setData] = useState<CampEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => getBookmarks())

  const loadData = useCallback(async (force = false) => {
    // 先检查缓存（10分钟内有效）
    if (!force) {
      const cached = getCachedData()
      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        setData(cached.data)
        setLastUpdated(new Date(cached.timestamp))
        setLoading(false)
        // 后台静默刷新
        fetchAllData().then(fresh => {
          setData(fresh)
          setLastUpdated(new Date())
          cacheData(fresh)
        }).catch(() => {})
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      const fresh = await fetchAllData()
      setData(fresh)
      setLastUpdated(new Date())
      cacheData(fresh)
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据加载失败')
      // 尝试使用过期缓存
      const cached = getCachedData()
      if (cached) {
        setData(cached.data)
        setLastUpdated(new Date(cached.timestamp))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveBookmarks(next)
      return next
    })
  }, [])

  return {
    data,
    loading,
    error,
    lastUpdated,
    bookmarks,
    toggleBookmark,
    refresh: () => loadData(true),
  }
}
