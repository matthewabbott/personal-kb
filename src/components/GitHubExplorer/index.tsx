import { useState, useEffect } from 'react'
import { Search, Code, Folder } from 'lucide-react'

interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  updated_at: string
}

export function GitHubExplorer() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: cache data so it doesn't have to get fetched every time
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/matthewabbott/repos')
        if (!response.ok) throw new Error('Failed to fetch repositories')
        
        const data = await response.json()
        setRepos(data)
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
                <div className="mt-2 text-sm text-gray-500">
                  {repo.language && <span className="mr-4">Language: {repo.language}</span>}
                  <span>Updated: {new Date(repo.updated_at).toLocaleDateString()}</span>
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