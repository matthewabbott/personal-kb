import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism'
import mermaid from 'mermaid'

// Initialize mermaid with specific config
mermaid.initialize({
  startOnLoad: false,  // Changed to false to handle rendering manually
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
})

interface MarkdownRendererProps {
  content: string
}

// Custom Mermaid component
const MermaidRenderer = ({ content }: { content: string }) => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderDiagram = async () => {
      if (elementRef.current) {
        try {
          // Clear the element
          elementRef.current.innerHTML = ''
          
          // Generate unique ID
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
          
          // Create temporary container
          const container = document.createElement('div')
          container.id = id
          container.textContent = content
          elementRef.current.appendChild(container)

          // Render the diagram
          const { svg } = await mermaid.render(id, content)
          elementRef.current.innerHTML = svg
        } catch (error) {
          console.error('Mermaid rendering failed:', error)
          elementRef.current.innerHTML = 'Failed to render diagram'
        }
      }
    }

    renderDiagram()
  }, [content])

  return (
    <div 
      ref={elementRef} 
      className="my-4 flex justify-center"
    />
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          
          if (language === 'mermaid') {
            // Ensure children is treated as string
            const mermaidContent = Array.isArray(children) 
              ? children.join('') 
              : String(children)
            console.log('Attempting to render Mermaid diagram:', mermaidContent)
            return <MermaidRenderer content={mermaidContent.trim()} />
          }

          return !inline ? (
            <SyntaxHighlighter
              {...props}
              style={nightOwl}
              language={language}
              PreTag="div"
              className="rounded-md"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code {...props} className={className}>
              {children}
            </code>
          )
        },
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}