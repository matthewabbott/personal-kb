// src/components/MarkdownRenderer/index.tsx
import { useEffect, useRef, useState, useCallback } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nightOwl, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import mermaid from 'mermaid'

// Custom Mermaid component
const MermaidRenderer = ({ content }: { content: string }) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  )

  const renderDiagram = useCallback(async () => {
    if (!elementRef.current) return

    try {
      // Get computed CSS variables from our theme
      const style = getComputedStyle(document.documentElement)
      const bgPrimary = style.getPropertyValue('--color-bg-primary').trim()
      const bgSecondary = style.getPropertyValue('--color-bg-secondary').trim()
      const textPrimary = style.getPropertyValue('--color-text-primary').trim()
      const textSecondary = style.getPropertyValue('--color-text-secondary').trim()
      const borderColor = style.getPropertyValue('--color-border').trim()

      // Initialize mermaid with our theme colors
      mermaid.initialize({
        startOnLoad: false,
        theme: isDarkMode ? 'dark' : 'default',
        darkMode: isDarkMode,
        themeVariables: {
          primaryColor: bgSecondary,
          primaryTextColor: textPrimary,
          primaryBorderColor: borderColor,
          secondaryColor: bgPrimary,
          secondaryTextColor: textSecondary,
          secondaryBorderColor: borderColor,
          tertiaryColor: bgSecondary,
          tertiaryTextColor: textPrimary,
          tertiaryBorderColor: borderColor,
          noteTextColor: textPrimary,
          noteBkgColor: bgSecondary,
          noteBorderColor: borderColor,
          lineColor: textSecondary,
          textColor: textPrimary,
          mainBkg: bgPrimary,
          nodeBorder: borderColor,
          clusterBkg: bgSecondary,
          titleColor: textPrimary,
          edgeLabelBackground: bgSecondary
        }
      })

      // Clear the element
      elementRef.current.innerHTML = ''

      // Generate unique ID for this render
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

      // Create temporary container
      const container = document.createElement('div')
      container.id = id
      container.textContent = content
      elementRef.current.appendChild(container)

      // Render the diagram to SVG
      const { svg } = await mermaid.render(id, content)

      // Update the DOM if component is still mounted
      if (elementRef.current) {
        elementRef.current.innerHTML = svg
      }
    } catch (error) {
      console.error('Mermaid rendering failed:', error)
      if (elementRef.current) {
        elementRef.current.innerHTML = 'Failed to render diagram'
      }
    }
  }, [content, isDarkMode])

  // Watch for theme changes
  useEffect(() => {
    let isMounted = true

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme' && isMounted) {
          const newTheme = document.documentElement.getAttribute('data-theme')
          setIsDarkMode(newTheme === 'dark')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => {
      isMounted = false
      observer.disconnect()
    }
  }, [])

  // Handle diagram rendering
  useEffect(() => {
    let isMounted = true

    const render = async () => {
      if (isMounted) {
        await renderDiagram()
      }
    }

    render()

    return () => {
      isMounted = false
    }
  }, [renderDiagram])

  return <div ref={elementRef} className="markdown-diagram" />
}

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  )

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    return () => observer.disconnect()
  }, [])

  const syntaxTheme = isDarkMode ? nightOwl : oneLight

  const components: Components = {
    // Couldn't get react-markdown and Prism to play nicely, so for now, JavaScript-ify
    code: (props: any) => {
      const { inline, className, children } = props
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''

      if (language === 'mermaid') {
        const mermaidContent = Array.isArray(children)
          ? children.join('')
          : String(children)
        return <MermaidRenderer content={mermaidContent.trim()} />
      }

      // If it's a code block (not inline), use the syntax highlighter
      if (!inline) {
        return (
          <SyntaxHighlighter
            style={syntaxTheme}
            language={language}
            PreTag="div"
            className="markdown-code"
            customStyle={{
              backgroundColor: 'var(--color-bg-secondary)',
              margin: '1.5em 0',
              borderRadius: '0.375rem',
            }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        )
      }

      // Otherwise, render inline code
      return (
        <code className={`${className} bg-[var(--color-bg-secondary)] rounded px-1`}>
          {children}
        </code>
      )
    },
    h1: ({ children }) => <h1 className="markdown-heading-1">{children}</h1>,
    h2: ({ children }) => <h2 className="markdown-heading-2">{children}</h2>,
  }

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  )
}
