// src/components/GitHubExplorer/index.tsx
import { useState, useEffect } from 'react'
import { Search, Folder, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { LanguageStats } from './LanguageStats'
import { getCachedData, setCachedData } from '../../utils/cache'
import { fetchJSON, fetchText } from '../../config/api'
import type { Repository, CacheMetadata } from '../../types/github'

interface ExpandedRepo {
  id: number
  readme: string | null
  loading: boolean
}

const truncateMarkdown = (markdown: string, maxLength: number = 150) => {
  const lines = markdown.split('\n')
  let truncated = lines[0]
  truncated = truncated.replace(/^#+\s/, '')
  return truncated.length > maxLength 
    ? truncated.slice(0, maxLength) + '...'
    : truncated + (lines.length > 1 ? '...' : '')
}

export function GitHubExplorer() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [expandedRepo, setExpandedRepo] = useState<ExpandedRepo | null>(null)
  const [readmeCache, setReadmeCache] = useState<Record<string, string>>({})

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
          
          // Load cached READMEs
          cachedRepos.forEach(repo => {
            const cachedReadme = getCachedData<string>(`readme-${repo.name}`)
            if (cachedReadme) {
              setReadmeCache(prev => ({ ...prev, [repo.name]: cachedReadme }))
            }
          })
          
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
              setReadmeCache(prev => ({ ...prev, [repo.name]: readme }))
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

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <div>Loading repositories...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
      </div>

      {/* Repository grid */}
      <div className="grid gap-4">
        {filteredRepos.map(repo => (
          <div key={repo.id} className="card">
            <div className="p-4 cursor-pointer" onClick={() => handleRepoClick(repo)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg flex items-center gap-2 text-skin-text-primary dark:text-skin-text-primary-dark">
                    {expandedRepo?.id === repo.id ? 
                      <ChevronDown className="w-4 h-4 text-skin-accent dark:text-skin-accent-dark" /> : 
                      <ChevronRight className="w-4 h-4 text-skin-accent dark:text-skin-accent-dark" />
                    }
                    <Folder className="w-4 h-4 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
                    {repo.name}
                    {repo.readme_preview && (
                      <FileText className="w-4 h-4 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
                    )}
                  </h3>
  
                  {repo.description && (
                    <p className="mt-1 text-skin-text-secondary dark:text-skin-text-secondary-dark">
                      {repo.description}
                    </p>
                  )}
  
                  <div className="mt-2 text-sm p-2 rounded bg-skin-bg-primary dark:bg-skin-bg-primary-dark text-skin-text-secondary dark:text-skin-text-secondary-dark">
                    {repo.readme_preview ? (
                      <>
                        {repo.readme_preview}
                        <button className="ml-2 font-medium text-skin-accent dark:text-skin-accent-dark hover:text-skin-accent-hover dark:hover:text-skin-accent-dark-hover">
                          Show More
                        </button>
                      </>
                    ) : (
                      <span className="italic">No README available</span>
                    )}
                  </div>
  
                  <div className="mt-2 text-sm text-skin-text-secondary dark:text-skin-text-secondary-dark">
                    {repo.language && <span className="mr-4">Language: {repo.language}</span>}
                    <span>Last updated: {new Date(repo.pushed_at).toLocaleDateString()}</span>
                  </div>

                  {repo.languages && Object.keys(repo.languages).length > 0 && (
                    <LanguageStats languages={repo.languages} />
                  )}
                </div>
  
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-skin-accent dark:text-skin-accent-dark hover:text-skin-accent-hover dark:hover:text-skin-accent-dark-hover"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Repo →
                </a>
              </div>
            </div>
  
            {expandedRepo?.id === repo.id && (
              <div className="border-t border-skin-border dark:border-skin-border-dark px-4 py-3">
                {expandedRepo.loading ? (
                  <div className="text-center py-4 text-skin-text-secondary dark:text-skin-text-secondary-dark">
                    Loading README...
                  </div>
                ) : expandedRepo.readme ? (
                  <div className="markdown-container">
                    <MarkdownRenderer content={expandedRepo.readme} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-skin-text-secondary dark:text-skin-text-secondary-dark text-lg mb-2">
                      No README Available
                    </div>
                    <p className="text-sm text-skin-text-secondary dark:text-skin-text-secondary-dark">
                      This repository doesn't have a README file.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}