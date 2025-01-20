// src/App.tsx
import { GitHubExplorer } from './components/GitHubExplorer'
import { ThemeToggle } from './components/ThemeToggle'
import { CachePurge } from './components/CachePurge'

function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8">
      <ThemeToggle />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-text-primary)]">
          Personal Knowledge Base
        </h1>
        <GitHubExplorer />
        <CachePurge />
      </div>
    </div>
  )
}

export default App