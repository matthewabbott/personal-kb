import React from 'react'

// Language colors from GitHub
const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  Go: '#00ADD8',
  Java: '#b07219',
  Shell: '#89e051',
  PHP: '#4F5D95',
  C: '#555555',
  'C++': '#f34b7d',
  Rust: '#dea584',
  Svelte: '#ff3e00',
}

const DEFAULT_LANGUAGE_COLOR = '#8b949e'  // Default gray for unlisted languages

interface LanguageStatsProps {
  languages: Record<string, number>
}

export function LanguageStats({ languages }: LanguageStatsProps) {
  if (!languages || Object.keys(languages).length === 0) return null

  // Calculate total bytes across all languages
  const total = Object.values(languages).reduce((sum, count) => sum + count, 0)
  
  return (
    <div className="mt-3">
      {/* Language bar with standardized width */}
      <div className="h-2 flex gap-0.5 rounded-full overflow-hidden bg-gray-100 w-64">  {/* Added w-64 for fixed width */}
        {Object.entries(languages)
          .sort(([, a], [, b]) => b - a) // Sort by byte count
          .map(([lang, bytes], index) => {
            const percentage = (bytes / total) * 100
            if (percentage < 1) return null // Don't show very small percentages
            
            return (
              <div
                key={lang}
                style={{
                  width: `${percentage}%`,
                  backgroundColor: languageColors[lang] || DEFAULT_LANGUAGE_COLOR,
                }}
                className="first:rounded-l-full last:rounded-r-full"
                title={`${lang}: ${percentage.toFixed(1)}%`}
              />
            )
          })}
      </div>
      
      {/* Language labels */}
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        {Object.entries(languages)
          .sort((a, b) => b[1] - a[1])  // Sort by byte count
          .map(([lang, bytes]) => {
            const percentage = (bytes / total) * 100
            if (percentage < 1) return null
            
            return (
              <div key={lang} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: languageColors[lang] || DEFAULT_LANGUAGE_COLOR }}
                />
                <span>{lang}</span>
                <span className="text-gray-500">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}