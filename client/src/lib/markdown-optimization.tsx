/**
 * Markdown Optimization Utilities
 * Optimized markdown rendering with proper performance considerations
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import { Skeleton } from '@/components/ui/skeleton';

// Memoized markdown component to prevent unnecessary re-renders
export const OptimizedMarkdown = React.memo(({
  children,
  className = "",
  loading = false,
  maxHeight
}: {
  children: string;
  className?: string;
  loading?: boolean;
  maxHeight?: number;
}) => {
  if (loading) {
    return <MarkdownSkeleton />;
  }

  return (
    <div
      className={`prose prose-gray max-w-none dark:prose-invert ${className}`}
      style={{ maxHeight: maxHeight ? `${maxHeight}px` : undefined, overflowY: 'auto' }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom components for better performance
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className || !className.includes('language-');
            return isInline ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <pre className={className} {...props}>
                <code>{children}</code>
              </pre>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </table>
            </div>
          )
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
OptimizedMarkdown.displayName = 'OptimizedMarkdown';

// Markdown loading skeleton
export const MarkdownSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// Truncate markdown content for previews
export const truncateMarkdown = (content: string, maxLength: number = 200) => {
  if (content.length <= maxLength) return content;

  // Try to truncate at sentence boundary
  const lastSentence = content.substring(0, maxLength).lastIndexOf('.');
  if (lastSentence > maxLength * 0.7) {
    return content.substring(0, lastSentence + 1) + '...';
  }

  return content.substring(0, maxLength) + '...';
};

// Extract plain text from markdown for previews
export const extractTextFromMarkdown = (content: string): string => {
  return content
    .replace(/#+\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image]') // Replace images
    .replace(/```[\s\S]*?```/g, '[Code]') // Replace code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove remaining inline code
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
};

// Performance monitoring for markdown rendering
export const useMarkdownPerformance = () => {
  const renderStart = React.useRef<number | null>(null);

  React.useEffect(() => {
    renderStart.current = performance.now();

    return () => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current;
        if (renderTime > 200) { // Warn if render takes more than 200ms
          console.warn(`Markdown render took ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  });
};

// Safe markdown renderer with error handling
export const SafeMarkdown = ({
  children,
  fallback = <div className="text-muted-foreground">Content unavailable</div>,
  ...props
}: {
  children: string;
  fallback?: React.ReactNode;
  [key: string]: any;
}) => {
  try {
    return <OptimizedMarkdown {...props}>{children}</OptimizedMarkdown>;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return fallback;
  }
};

// Markdown preview component (truncated version)
export const MarkdownPreview = ({
  content,
  maxLength = 200,
  showMore = false,
  onExpand
}: {
  content: string;
  maxLength?: number;
  showMore?: boolean;
  onExpand?: () => void;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const displayContent = isExpanded || !showMore ? content : truncateMarkdown(content, maxLength);
  const shouldShowMore = showMore && content.length > maxLength;

  return (
    <div>
      <OptimizedMarkdown>{displayContent}</OptimizedMarkdown>
      {shouldShowMore && (
        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            onExpand?.();
          }}
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

// Markdown content type checker
export const getMarkdownType = (content: string): 'simple' | 'complex' | 'heavy' => {
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  const linkCount = (content.match(/\[.*?\]/g) || []).length;
  const imageCount = (content.match(/!\[.*?\]/g) || []).length;
  const headerCount = (content.match(/^#+/gm) || []).length;
  const mathCount = (content.match(/\$[^$]*\$/g) || []).length;

  if (codeBlockCount > 3 || mathCount > 5) return 'heavy';
  if (linkCount > 10 || imageCount > 5 || headerCount > 10) return 'complex';
  return 'simple';
};

export default OptimizedMarkdown;