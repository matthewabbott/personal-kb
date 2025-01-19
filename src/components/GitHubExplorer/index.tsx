import { useState, useEffect } from 'react'
import { Search, Folder, Star, GitFork, HardDrive } from 'lucide-react'
import { LanguageStats } from './LanguageStats'

// Define our types
interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  languages_url: string
  updated_at: string
  pushed_at: string
  created_at: string
  stargazers_count: number
  forks_count: number
  size: number
  languages_data?: Record<string, number>  // Will store language stats
  latest_commit?: {
    commit: {
      author: {
        date: string
      }
    }
  }
}

export function GitHubExplorer() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        setLoading(true)
        // Use GitHub API when in dev mode
        const response = await fetch('https://api.github.com/users/matthewabbott/repos?per_page=100')
        if (!response.ok) throw new Error('Failed to fetch repositories')
        
        const data = await response.json()
        
        // Fetch language data for each repository
        const reposWithLanguages = await Promise.all(
          data.map(async (repo) => {
            if (!repo.language) return repo
            
            try {
              const langResponse = await fetch(repo.languages_url)
              if (langResponse.ok) {
                const langData = await langResponse.json()
                return { ...repo, languages_data: langData }
              }
            } catch (err) {
              console.error(`Failed to fetch languages for ${repo.name}:`, err)
            }
            return repo
          })
        )
        
        // Sort repos by pushed_at date
        const sortedRepos = [...reposWithLanguages].sort((a, b) => {
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        })
        setRepos(sortedRepos)
      } catch (err) {
        setError('Error loading repositories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

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
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Repository list */}
      <div className="grid gap-4">
        {filteredRepos.map(repo => (
          <div
            key={repo.id}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Folder className="w-4 h-4" />
                  {repo.name}
                </h3>
                {repo.description && (
                  <p className="mt-1 text-gray-600">{repo.description}</p>
                )}
                <div className="mt-4 space-y-3">
                  {/* Language Statistics */}
                  {repo.languages_data && (
                    <LanguageStats languages={repo.languages_data} />
                  )}
                  
                  {/* Repository Stats */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {repo.stargazers_count} stars
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-4 h-4" />
                      {repo.forks_count} forks
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      {(repo.size / 1024).toFixed(1)} MB
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Created: {new Date(repo.created_at).toLocaleDateString()}</div>
                    <div>Last pushed: {new Date(repo.pushed_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                View Repo →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}