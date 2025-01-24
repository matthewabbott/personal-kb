// src/components/GitHubExplorer/useGitHubData.ts
import { useState, useEffect } from 'react'
import { getCachedData, setCachedData } from '../../utils/cache'
import { fetchJSON, fetchText } from '../../config/api'
import type { Repository, CacheMetadata } from '../../types/github'

const truncateMarkdown = (markdown: string, maxLength: number = 150) => {
  const lines = markdown.split('\n')
  let truncated = lines[0]
  truncated = truncated.replace(/^#+\s/, '')
  return truncated.length > maxLength 
    ? truncated.slice(0, maxLength) + '...'
    : truncated + (lines.length > 1 ? '...' : '')
}

export function useGitHubData() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // Try to get repos from local cache first
        const cachedRepos = getCachedData<Repository[]>('github-repos')
        const cachedMetadata = getCachedData<CacheMetadata>('github-metadata')
        
        // Check if we have fresh cached data
        if (cachedRepos && cachedMetadata) {
          console.log('Loading cached repository data')
          setRepos(cachedRepos)
          setLoading(false)
          
          // Check server metadata in background
          try {
            const serverMetadata = await fetchJSON<CacheMetadata>('/metadata')
            // If server has newer data, update in background
            if (new Date(serverMetadata.last_updated) > new Date(cachedMetadata.last_updated)) {
              console.log('Updating cached data from server')
              await fetchFromServer()
            }
          } catch (err) {
            console.error('Failed to check server metadata:', err)
          }
          
          return
        }

        // If no cache or expired, fetch from server
        await fetchFromServer()
      } catch (err) {
        setError('Error loading repositories. Please try again later.')
        setLoading(false)
      }
    }

    const fetchFromServer = async () => {
      console.log('Fetching repository data from server...')
      
      try {
        const reposData = await fetchJSON<Repository[]>('/repos')
        
        // Fetch language stats and READMEs for each repo
        const reposWithDetails = await Promise.all(
          reposData.map(async (repo: Repository) => {
            const repoDetails: Partial<Repository> = { ...repo, languages: null }

            try {
              // Fetch language stats
              const languageData = await fetchJSON<Record<string, number>>(`/repos/${repo.name}/languages`)
              repoDetails.languages = languageData
              setCachedData(`languages-${repo.name}`, languageData)
            } catch (err) {
              console.log(`Failed to fetch languages for ${repo.name}`)
            }

            try {
              // Fetch README
              const readme = await fetchText(`/repos/${repo.name}/readme`)
              repoDetails.readme_preview = truncateMarkdown(readme)
              setCachedData(`readme-${repo.name}`, readme)
            } catch (err) {
              console.log(`Failed to fetch README for ${repo.name}`)
            }

            return repoDetails as Repository
          })
        )

        // Cache the repository data
        setCachedData('github-repos', reposWithDetails)
        
        // Cache metadata
        const metadata = await fetchJSON<CacheMetadata>('/metadata')
        setCachedData('github-metadata', metadata)

        setRepos(reposWithDetails)
      } catch (err) {
        throw new Error('Failed to fetch repository data')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  return { repos, loading, error }
}