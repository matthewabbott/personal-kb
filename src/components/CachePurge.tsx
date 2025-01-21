// src/components/CachePurge.tsx
import { useState } from 'react'
import { RotateCcw, X, Check } from 'lucide-react'

export function CachePurge() {
  const [showConfirm, setShowConfirm] = useState(false)

  const purgeCache = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="flex justify-end gap-2 mt-16 mb-8">
      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                     bg-skin-bg-secondary dark:bg-skin-bg-secondary-dark 
                     text-skin-text-secondary dark:text-skin-text-secondary-dark
                     border border-skin-border dark:border-skin-border-dark 
                     rounded-md 
                     hover:text-skin-accent dark:hover:text-skin-accent-dark
                     transition-colors shadow-skin"
          title="Refresh cached repository data"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh Data
        </button>
      ) : (
        <>
          <button
            onClick={() => setShowConfirm(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                       bg-skin-bg-secondary dark:bg-skin-bg-secondary-dark
                       text-skin-text-primary dark:text-skin-text-primary-dark
                       border border-skin-border dark:border-skin-border-dark 
                       rounded-md 
                       transition-colors shadow-skin"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={purgeCache}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                       bg-skin-accent dark:bg-skin-accent-dark 
                       hover:bg-skin-accent-hover dark:hover:bg-skin-accent-dark-hover
                       text-white rounded-md 
                       transition-colors shadow-skin"
          >
            <Check className="w-4 h-4" />
            Purge Cache
          </button>
        </>
      )}
    </div>
  )
}