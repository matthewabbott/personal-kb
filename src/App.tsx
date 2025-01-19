import { GitHubExplorer } from './components/GitHubExplorer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Personal Knowledge Base</h1>
        <GitHubExplorer />
      </div>
    </div>
  )
}

export default App