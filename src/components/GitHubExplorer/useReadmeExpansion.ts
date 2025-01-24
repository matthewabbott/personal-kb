// src/components/GitHubExplorer/useReadmeExpansion.ts
import { useState } from 'react'
import { getCachedData, setCachedData } from '../../utils/cache'
import { fetchText } from '../../config/api'
import type { Repository, ExpandedRepo } from '../../types/github'

export function useReadmeExpansion() {
  const [expandedRepo, setExpandedRepo] = useState<ExpandedRepo | null>(null)
  const [readmeCache, setReadmeCache] = useState<Record<string, string>>({})

  const fetchReadme = async (repo: Repository) => {
    // Check memory cache first
    if (readmeCache[repo.name]) {
      setExpandedRepo({ 
        id: repo.id, 
        readme: readmeCache[repo.name], 
        loading: false 
      })
      return
    }

    setExpandedRepo({ id: repo.id, readme: null, loading: true })
    
    // Check localStorage cache
    const cachedReadme = getCachedData<string>(`readme-${repo.name}`)
    if (cachedReadme) {
      setReadmeCache(prev => ({ ...prev, [repo.name]: cachedReadme }))
      setExpandedRepo({ 
        id: repo.id, 
        readme: cachedReadme, 
        loading: false 
      })
      return
    }

    // If not cached, fetch from server
    try {
      const readme = await fetchText(`/repos/${repo.name}/readme`)
      setCachedData(`readme-${repo.name}`, readme)
      setReadmeCache(prev => ({ ...prev, [repo.name]: readme }))
      setExpandedRepo({ id: repo.id, readme, loading: false })
    } catch (err) {
      setExpandedRepo(null)
    }
  }

  const handleRepoClick = (repo: Repository) => {
    if (expandedRepo?.id === repo.id) {
      setExpandedRepo(null)
    } else {
      fetchReadme(repo)
    }
  }

  return {
    expandedRepo,
    handleRepoClick,
    readmeCache
  }
}