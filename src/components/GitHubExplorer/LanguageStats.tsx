// src/components/LanguageStats.tsx
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
  // Return null if no languages data is provided
  if (!languages || Object.keys(languages).length === 0) return null

  // Calculate total bytes across all languages
  const total = Object.values(languages).reduce((sum, count) => sum + count, 0)
  
  return (
    <div className="mt-3">
      {/* Language bar with standardized width */}
      <div className="language-bar">
        {Object.entries(languages)
          .sort(([, a], [, b]) => b - a) // Sort by byte count
          .map(([lang, bytes]) => {
            const percentage = (bytes / total) * 100
            if (percentage < 1) return null // Don't show very small percentages
            
            return (
              <div
                key={lang}
                className="language-segment"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: languageColors[lang] || DEFAULT_LANGUAGE_COLOR,
                }}
                title={`${lang}: ${percentage.toFixed(1)}%`}
              />
            )
          })}
      </div>
      
      {/* Language labels with percentages */}
      <div className="language-labels">
        {Object.entries(languages)
          .sort((a, b) => b[1] - a[1])  // Sort by byte count
          .map(([lang, bytes]) => {
            const percentage = (bytes / total) * 100
            if (percentage < 1) return null // Skip small percentages in labels
            
            return (
              <div key={lang} className="language-label">
                <span
                  className="language-dot"
                  style={{
                    backgroundColor: languageColors[lang] || DEFAULT_LANGUAGE_COLOR
                  }}
                />
                <span>{lang}</span>
                <span className="language-percentage">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}