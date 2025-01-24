// src/components/GitHubExplorer/RepositoryCard.tsx
import { ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react'
import { LanguageStats } from './LanguageStats'
import { MarkdownRenderer } from '../MarkdownRenderer'
import type { Repository, ExpandedRepo } from '../../types/github'

interface RepositoryCardProps {
  repo: Repository
  expandedRepo: ExpandedRepo | null
  onRepoClick: (repo: Repository) => void
}

export function RepositoryCard({ repo, expandedRepo, onRepoClick }: RepositoryCardProps) {
  const isExpanded = expandedRepo?.id === repo.id

  return (
    <div className="card">
      <div className="p-4 cursor-pointer" onClick={() => onRepoClick(repo)}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <h3 className="font-medium text-lg flex items-center gap-2 text-skin-text-primary dark:text-skin-text-primary-dark">
              {isExpanded ? 
                <ChevronDown className="w-4 h-4 text-skin-accent dark:text-skin-accent-dark" /> : 
                <ChevronRight className="w-4 h-4 text-skin-accent dark:text-skin-accent-dark" />
              }
              <Folder className="w-4 h-4 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
              {repo.name}
              {repo.readme_preview && (
                <FileText className="w-4 h-4 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
              )}
            </h3>

            {/* Description */}
            {repo.description && (
              <p className="mt-1 text-skin-text-secondary dark:text-skin-text-secondary-dark">
                {repo.description}
              </p>
            )}

            {/* README Preview */}
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

            {/* Metadata */}
            <div className="mt-2 text-sm text-skin-text-secondary dark:text-skin-text-secondary-dark">
              {repo.language && <span className="mr-4">Language: {repo.language}</span>}
              <span>Last updated: {new Date(repo.pushed_at).toLocaleDateString()}</span>
            </div>

            {/* Language Statistics */}
            {repo.languages && Object.keys(repo.languages).length > 0 && (
              <LanguageStats languages={repo.languages} />
            )}
          </div>

          {/* External Link */}
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

      {/* Expanded README Content */}
      {isExpanded && (
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
  )
}