import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import MathJax from 'react-mathjax';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { ArrayCalculator } from '../calculations/ArrayCalculator';
import { StepProps } from './types';


type MarkdownComponents = Components & {
  math: React.ComponentType<{ value: string }>
  inlineMath: React.ComponentType<{ value: string }>
};

export function ReportStep({ form, pvProject, setPVProject }: StepProps) {
  const [reportContent, setReportContent] = useState<string>('');

  // useEffect(() => {
  //   // Use the PVProject data passed as a prop
  //   if (pvProject) {
  //     setProjectData(pvProject);
  //   }
  // }, [pvProject]);

  const markdownComponents: MarkdownComponents = {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-300 dark:border-gray-700">{children}</tr>,
    th: ({ children }) => <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-medium">{children}</th>,
    td: ({ children }) => <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{children}</td>,
    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">{children}</code>,
    pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic mb-4">{children}</blockquote>,
    math: ({ value }: { value: string }) => <MathJax.Node formula={value} />,
    inlineMath: ({ value }: { value: string }) => <MathJax.Node inline formula={value} />
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Project Report</h2>
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          {pvProject?.panels && pvProject?.inverters && pvProject?.arrays && (
            <div className="mb-6">
              <ArrayCalculator
                panel={pvProject.panels[0]}
                inverter={pvProject.inverters[0]}
                array={pvProject.arrays[0]}
                project={pvProject}
              />
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MathJax.Provider input="tex">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                components={markdownComponents}
              >
                {reportContent}
              </ReactMarkdown>
            </MathJax.Provider>
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
