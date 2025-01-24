// src/components/GitHubExplorer/index.tsx
import { useState } from 'react'
import { SearchBar } from './SearchBar'
import { RepositoryCard } from './RepositoryCard'
import { useGitHubData } from './useGitHubData'
import { useReadmeExpansion } from './useReadmeExpansion'

export function GitHubExplorer() {
  const [searchTerm, setSearchTerm] = useState('')
  const { repos, loading, error } = useGitHubData()
  const { expandedRepo, handleRepoClick } = useReadmeExpansion()

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) return <div>Loading repositories...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <SearchBar 
        searchTerm={searchTerm}
        onChange={setSearchTerm}
      />

      <div className="grid gap-4">
        {filteredRepos.map(repo => (
          <RepositoryCard
            key={repo.id}
            repo={repo}
            expandedRepo={expandedRepo}
            onRepoClick={handleRepoClick}
          />
        ))}
      </div>
    </div>
  )
}