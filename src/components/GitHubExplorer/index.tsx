import { useState, useEffect } from 'react'
import { Search, Folder, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { MarkdownRenderer } from '../MarkdownRenderer'

interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  pushed_at: string
  default_branch: string
  readme_preview?: string | null
}

interface ExpandedRepo {
  id: number
  readme: string | null
  loading: boolean
}

const truncateMarkdown = (markdown: string, maxLength: number = 150) => {
  const lines = markdown.split('\n')
  let truncated = lines[0]  // Get first line
  
  // Remove markdown headers
  truncated = truncated.replace(/^#+\s/, '')
  
  if (truncated.length > maxLength) {
    return truncated.slice(0, maxLength) + '...'
  }
  return truncated + (lines.length > 1 ? '...' : '')
}

export function GitHubExplorer() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [expandedRepo, setExpandedRepo] = useState<ExpandedRepo | null>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/matthewabbott/repos?per_page=100')
        if (!response.ok) throw new Error('Failed to fetch repositories')
        
        const data = await response.json()
        const sortedRepos = [...data].sort((a, b) => {
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        })

        // Fetch README previews for all repos
        const reposWithPreviews = await Promise.all(
          sortedRepos.map(async (repo) => {
            const readmeResponse = await fetch(
              `https://api.github.com/repos/matthewabbott/${repo.name}/readme`,
              { headers: { 'Accept': 'application/vnd.github.raw' } }
            )
            
            if (readmeResponse.ok) {
              const readme = await readmeResponse.text()
              return { ...repo, readme_preview: truncateMarkdown(readme) }
            }
            return { ...repo, readme_preview: null }
          })
        )

        setRepos(reposWithPreviews)
      } catch (err) {
        setError('Error loading repositories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
  }, [])

  const fetchReadme = async (repo: Repository) => {
    setExpandedRepo({ id: repo.id, readme: null, loading: true })
    
    const response = await fetch(
      `https://api.github.com/repos/matthewabbott/${repo.name}/readme`,
      { headers: { 'Accept': 'application/vnd.github.raw' } }
    )
    
    if (response.ok) {
      const readme = await response.text()
      setExpandedRepo({ id: repo.id, readme, loading: false })
    } else {
      // Don't show any message for 404s
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

      <div className="grid gap-4">
        {filteredRepos.map(repo => (
          <div
            key={repo.id}
            className="bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => handleRepoClick(repo)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-lg flex items-center gap-2">
                    {expandedRepo?.id === repo.id ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                    <Folder className="w-4 h-4" />
                    {repo.name}
                    {repo.readme_preview && (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                  </h3>
                  {repo.description && (
                    <p className="mt-1 text-gray-600">{repo.description}</p>
                  )}
                  {repo.readme_preview && expandedRepo?.id !== repo.id && (
                    <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                      {repo.readme_preview}
                      <button className="text-blue-500 hover:text-blue-600 ml-2 font-medium">
                        Show More
                      </button>
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-500">
                    {repo.language && <span className="mr-4">Language: {repo.language}</span>}
                    <span>Last updated: {new Date(repo.pushed_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Repo →
                </a>
              </div>
            </div>

            {expandedRepo?.id === repo.id && (
              <div className="border-t px-4 py-3">
                {expandedRepo.loading ? (
                  <div className="text-center py-4">Loading README...</div>
                ) : (
                  <div className="prose max-w-none dark:prose-invert">
                    <MarkdownRenderer content={expandedRepo.readme || ''} />
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