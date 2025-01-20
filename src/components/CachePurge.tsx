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
                     bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]
                     border border-[var(--color-border)] rounded-md 
                     hover:text-[var(--color-accent)] 
                     transition-colors shadow-lg"
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
                       bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]
                       border border-[var(--color-border)] rounded-md 
                       transition-colors shadow-lg"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={purgeCache}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                       bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] 
                       text-white rounded-md 
                       transition-colors shadow-lg"
          >
            <Check className="w-4 h-4" />
            Purge Cache
          </button>
        </>
      )}
    </div>
  )
}