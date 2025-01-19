import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism'
import mermaid from 'mermaid'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
})

interface MarkdownRendererProps {
  content: string
}

// Custom Mermaid component
const MermaidRenderer = ({ content }: { content: string }) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const graphDefinition = content.trim()

  useEffect(() => {
    if (elementRef.current) {
      mermaid.render(`mermaid-${Math.random()}`, graphDefinition)
        .then(({ svg }) => {
          if (elementRef.current) {
            elementRef.current.innerHTML = svg
          }
        })
        .catch(error => {
          console.error('Mermaid rendering failed:', error)
          if (elementRef.current) {
            elementRef.current.innerHTML = 'Failed to render diagram'
          }
        })
    }
  }, [graphDefinition])

  return <div ref={elementRef} className="my-4" />
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        // Handle code blocks
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          
          // Handle Mermaid diagrams
          if (language === 'mermaid') {
            return <MermaidRenderer content={String(children)} />
          }

          // Regular code blocks
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
        // Custom styling for other elements if needed
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
        ),
        // Add more custom elements as needed
      }}
    >
      {content}
    </ReactMarkdown>
  )
}