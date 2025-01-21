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
    document.documentElement.classList.contains('dark')
  )

  const renderDiagram = useCallback(async () => {
    if (!elementRef.current) return

    try {
      const isDark = document.documentElement.classList.contains('dark')
      
      // Initialize mermaid with theme colors
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        darkMode: isDark,
        themeVariables: {
          primaryColor: isDark ? '#252220' : '#ffffff',           // bg-secondary
          primaryTextColor: isDark ? '#e6ddd6' : '#2c1810',      // text-primary
          primaryBorderColor: isDark ? '#3d332d' : '#d4c5b9',    // border
          secondaryColor: isDark ? '#1a1614' : '#f8f3e9',        // bg-primary
          secondaryTextColor: isDark ? '#b5a396' : '#6b4d3c',    // text-secondary
          secondaryBorderColor: isDark ? '#3d332d' : '#d4c5b9',  // border
          tertiaryColor: isDark ? '#252220' : '#ffffff',         // bg-secondary
          tertiaryTextColor: isDark ? '#e6ddd6' : '#2c1810',     // text-primary
          tertiaryBorderColor: isDark ? '#3d332d' : '#d4c5b9',   // border
          noteTextColor: isDark ? '#e6ddd6' : '#2c1810',         // text-primary
          noteBkgColor: isDark ? '#252220' : '#ffffff',          // bg-secondary
          noteBorderColor: isDark ? '#3d332d' : '#d4c5b9',       // border
          lineColor: isDark ? '#b5a396' : '#6b4d3c',             // text-secondary
          textColor: isDark ? '#e6ddd6' : '#2c1810',             // text-primary
          mainBkg: isDark ? '#1a1614' : '#f8f3e9',              // bg-primary
          nodeBorder: isDark ? '#3d332d' : '#d4c5b9',           // border
          clusterBkg: isDark ? '#252220' : '#ffffff',           // bg-secondary
          titleColor: isDark ? '#e6ddd6' : '#2c1810',           // text-primary
          edgeLabelBackground: isDark ? '#252220' : '#ffffff'    // bg-secondary
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
        if (mutation.attributeName === 'class' && isMounted) {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
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
    document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const syntaxTheme = isDarkMode ? nightOwl : oneLight

  const components: Components = {
    // Couldn't get react-markdown and Prism to play nicely with TypeScript, so for now, use any
    code: ({ inline, className, children, ...props }: any) => {
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
            style={syntaxTheme as { [key: string]: React.CSSProperties }}
            language={language}
            PreTag="div"
            className="markdown-code"
            customStyle={{
              backgroundColor: isDarkMode ? '#252220' : '#ffffff', // bg-secondary
              margin: '1.5em 0',
              borderRadius: '0.375rem',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        )
      }

      // Otherwise, render inline code
      return (
        <code className={`${className} bg-skin-bg-secondary dark:bg-skin-bg-secondary-dark rounded px-1`} {...props}>
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