// src/components/GitHubExplorer/index.tsx
import { useState, useEffect } from 'react'
import { Search, Folder, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { MarkdownRenderer } from '../MarkdownRenderer'
import { getCachedData, setCachedData } from '../../utils/cache'

interface Repository {
  id: number
  name: string
  description: string | null
  html_url: string
  language: string | null
  pushed_at: string
  default_branch: string
  readme_preview: string | null  // Store preview directly with repo
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
  const [readmeCache, setReadmeCache] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        // Try to get repos from cache first
        const cachedRepos = getCachedData<Repository[]>('github-repos');
        if (cachedRepos) {
          console.log('Loading cached repository data');
          
          // Load any cached full READMEs into memory
          cachedRepos.forEach(repo => {
            const cachedReadme = getCachedData<string>(`readme-${repo.name}`);
            if (cachedReadme) {
              console.log(`Loading cached full README for ${repo.name}`);
              setReadmeCache(prev => ({ ...prev, [repo.name]: cachedReadme }));
            }
          });
          
          setRepos(cachedRepos);
          setLoading(false);
          return;
        }

        console.log('Fetching repository data from GitHub...');
        const response = await fetch('https://api.github.com/users/matthewabbott/repos?per_page=100')
        if (!response.ok) throw new Error('Failed to fetch repositories')
        
        const data = await response.json()
        const sortedRepos = [...data].sort((a, b) => {
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
        })

        // Fetch and add README previews
        const reposWithPreviews = await Promise.all(
          sortedRepos.map(async (repo) => {
            try {
              const readmeResponse = await fetch(
                `https://api.github.com/repos/matthewabbott/${repo.name}/readme`,
                { headers: { 'Accept': 'application/vnd.github.raw' } }
              );
              
              if (readmeResponse.ok) {
                const readme = await readmeResponse.text();
                console.log(`Fetched README for ${repo.name}`);
                // Cache full README for later use
                setCachedData(`readme-${repo.name}`, readme);
                return {
                  ...repo,
                  readme_preview: truncateMarkdown(readme)
                };
              }
              
              return { ...repo, readme_preview: null };
            } catch (err) {
              console.log(`No README found for ${repo.name}`);
              return { ...repo, readme_preview: null };
            }
          })
        );

        // Cache the repos with their previews
        setCachedData('github-repos', reposWithPreviews);
        setRepos(reposWithPreviews);
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
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--color-text-secondary)]" />
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
            {/* Repository header and preview */}
            <div className="p-4 cursor-pointer" onClick={() => handleRepoClick(repo)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Repository title and icons */}
                  <h3 className="font-medium text-lg flex items-center gap-2 text-[var(--color-text-primary)]">
                    {expandedRepo?.id === repo.id ? 
                      <ChevronDown className="w-4 h-4 text-[var(--color-accent)]" /> : 
                      <ChevronRight className="w-4 h-4 text-[var(--color-accent)]" />
                    }
                    <Folder className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    {repo.name}
                    {repo.readme_preview && (
                      <FileText className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    )}
                  </h3>
  
                  {/* Repository description */}
                  {repo.description && (
                    <p className="mt-1 text-[var(--color-text-secondary)]">
                      {repo.description}
                    </p>
                  )}
  
                  {/* README preview */}
                  {repo.readme_preview && expandedRepo?.id !== repo.id && (
                    <div className="mt-2 text-sm p-2 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)]">
                      {repo.readme_preview}
                      <button className="ml-2 font-medium text-[var(--color-accent)]">
                        Show More
                      </button>
                    </div>
                  )}
  
                  {/* Repository metadata */}
                  <div className="mt-2 text-sm text-[var(--color-text-secondary)]">
                    {repo.language && <span className="mr-4">Language: {repo.language}</span>}
                    <span>Last updated: {new Date(repo.pushed_at).toLocaleDateString()}</span>
                  </div>
                </div>
  
                {/* External repository link */}
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[var(--color-accent)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Repo →
                </a>
              </div>
            </div>
  
            {/* Expanded README content */}
            {expandedRepo?.id === repo.id && (
              <div className="border-t border-[var(--color-border)] px-4 py-3">
                {expandedRepo.loading ? (
                  <div className="text-center py-4 text-[var(--color-text-secondary)]">
                    Loading README...
                  </div>
                ) : (
                  <div className="markdown-container">
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