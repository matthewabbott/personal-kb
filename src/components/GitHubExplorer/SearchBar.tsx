// src/components/GitHubExplorer/SearchBar.tsx
import { Search } from 'lucide-react'

interface SearchBarProps {
  searchTerm: string
  onChange: (value: string) => void
}

export function SearchBar({ searchTerm, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-skin-text-secondary dark:text-skin-text-secondary-dark" />
      <input
        type="text"
        placeholder="Search repositories..."
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        className="input-search"
      />
    </div>
  )
}