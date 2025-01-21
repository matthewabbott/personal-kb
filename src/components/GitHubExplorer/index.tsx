// src/components/GitHubExplorer/index.tsx
import { useState, useEffect } from 'react'
import { Search, Folder, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { LanguageStats } from './LanguageStats'
import { getCachedData, setCachedData } from '../../utils/cache'

interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  languages_url: string
  languages: Record<string, number> | null
  pushed_at: string
  default_branch: string
  readme_preview: string | null
}

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
        // Try to get repos from cache first
        const cachedRepos = getCachedData<Repository[]>('github-repos')
        if (cachedRepos) {
          console.log('Loading cached repository data')
          
          cachedRepos.forEach(repo => {
            const cachedReadme = getCachedData<string>(`readme-${repo.name}`)
            if (cachedReadme) {
              setReadmeCache(prev => ({ ...prev, [repo.name]: cachedReadme }))
            }
          })
          
          setRepos(cachedRepos)
          setLoading(false)
          return
        }

        console.log('Fetching repository data from GitHub...')
        const response = await fetch('https://api.github.com/users/matthewabbott/repos?per_page=100')
        if (!response.ok) throw new Error('Failed to fetch repositories')
        
        const data = await response.json()
        const sortedRepos = [...data].sort((a, b) => 
          new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        )

        // Fetch READMEs and language stats for each repo
        const reposWithDetails = await Promise.all(
          sortedRepos.map(async (repo) => {
            const repoDetails: Partial<Repository> = { ...repo, languages: null }

            // First check if we have cached language data
            const cachedLanguages = getCachedData<Record<string, number>>(`languages-${repo.name}`)
            if (cachedLanguages) {
              console.log(`Using cached language data for ${repo.name}`)
              repoDetails.languages = cachedLanguages
            } else {
              // Fetch language stats if not cached
              try {
                const languagesResponse = await fetch(repo.languages_url)
                if (languagesResponse.ok) {
                  const languageData = await languagesResponse.json()
                  repoDetails.languages = languageData
                  // Cache language data separately
                  setCachedData(`languages-${repo.name}`, languageData)
                }
              } catch (err) {
                console.log(`Failed to fetch languages for ${repo.name}`)
              }
            }

            // Check for cached README status first
            const cachedReadmeStatus = getCachedData<{ exists: boolean; content?: string }>(`readme-status-${repo.name}`)
            
            if (cachedReadmeStatus !== null) {
              console.log(`Using cached README status for ${repo.name}`)
              if (cachedReadmeStatus.exists && cachedReadmeStatus.content) {
                repoDetails.readme_preview = truncateMarkdown(cachedReadmeStatus.content)
                // Also update the separate readme cache for expanded view
                setCachedData(`readme-${repo.name}`, cachedReadmeStatus.content)
              }
            } else {
              // Fetch README if status not cached
              try {
                const readmeResponse = await fetch(
                  `https://api.github.com/repos/matthewabbott/${repo.name}/readme`,
                  { headers: { 'Accept': 'application/vnd.github.raw' } }
                )
                
                if (readmeResponse.ok) {
                  const readme = await readmeResponse.text()
                  // Cache both the status and the content
                  setCachedData(`readme-status-${repo.name}`, { exists: true, content: readme })
                  repoDetails.readme_preview = truncateMarkdown(readme)
                } else if (readmeResponse.status === 404) {
                  // Cache the fact that README doesn't exist
                  console.log(`Caching 404 status for ${repo.name} README`)
                  setCachedData(`readme-status-${repo.name}`, { exists: false })
                }
              } catch (err) {
                console.log(`Error fetching README for ${repo.name}:`, err)
                // Cache the error state too
                setCachedData(`readme-status-${repo.name}`, { exists: false })
              }
            }

            return repoDetails as Repository
          })
        )

        setCachedData('github-repos', reposWithDetails)
        setRepos(reposWithDetails)
      } catch (err) {
        setError('Error loading repositories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const fetchReadme = async (repo: Repository) => {
    // Check memory cache first
    if (readmeCache[repo.name]) {
      console.log(`Using cached README for ${repo.name}`);
      setExpandedRepo({ 
        id: repo.id, 
        readme: readmeCache[repo.name], 
        loading: false 
      });
      return;
    }

    setExpandedRepo({ id: repo.id, readme: null, loading: true });
    
    // Check localStorage cache
    const cachedReadme = getCachedData<string>(`readme-${repo.name}`);
    if (cachedReadme) {
      console.log(`Loading README from cache for ${repo.name}`);
      setReadmeCache(prev => ({ ...prev, [repo.name]: cachedReadme }));
      setExpandedRepo({ 
        id: repo.id, 
        readme: cachedReadme, 
        loading: false 
      });
      return;
    }

    // If not cached, fetch from GitHub
    try {
      console.log(`Fetching full README for ${repo.name}`);
      const response = await fetch(
        `https://api.github.com/repos/matthewabbott/${repo.name}/readme`,
        { headers: { 'Accept': 'application/vnd.github.raw' } }
      );
      
      if (response.ok) {
        const readme = await response.text();
        // Cache the full README
        setCachedData(`readme-${repo.name}`, readme);
        setReadmeCache(prev => ({ ...prev, [repo.name]: readme }));
        setExpandedRepo({ id: repo.id, readme, loading: false });
      } else {
        setExpandedRepo(null);
      }
    } catch (err) {
      setExpandedRepo(null);
    }
  };

  const handleRepoClick = (repo: Repository) => {
    if (expandedRepo?.id === repo.id) {
      setExpandedRepo(null);
    } else {
      fetchReadme(repo);
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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