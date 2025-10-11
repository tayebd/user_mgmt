import { useEffect, useState } from 'react';
import type { PVProject, PVPanel, Inverter } from '@/shared/types';
import type { ArrayConfig, ProtectionCalc, CableSizing } from '../calculations/reportTypes';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'


import { pvProject_mockData } from '../calculations/mockData';
// import { arrayConfigurationTemplate, cableSizingTemplate, 
//          calculationsTemplate, equipmentTemplate, 
//          protectionTemplate } from '../calculations/testTemplate';
import { arrayConfigurationTemplate, cableSizingTemplate, 
           equipmentTemplate, 
           protectionTemplate } from '../calculations/templates';

import { calculateArrayConfiguration, calculateProtectionDevices, 
    calculateDCCableSizing, calculateACCableSizing, PVCONSTANTS as constants } from '../calculations/ArrayCalculatorUtils';

// Helper function to interpolate values in our templates
function interpolateTemplate<T extends Record<string, unknown>>(template: string, context: T): string {
  if (typeof template !== 'string') return '';
  
  // Replace {{variable}} with actual values from the context
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split('.');
    let value: unknown = context;
    
    for (const key of keys) {
      if (value === undefined || value === null) return '';
      if (typeof value !== 'object' && typeof value !== 'function') return '';
      
      // Check if the key exists in the value
      if (value && typeof value === 'object' && key in value) {
        const nextValue = (value as Record<string, unknown>)[key];
        if (nextValue === undefined || nextValue === null) return '';
        value = nextValue;
      } else {
        return '';
      }
    }
    
    if (value === undefined || value === null) return '';
    try {
      if (typeof value === 'object' && value !== null && 'toString' in value && typeof value.toString === 'function') {
        return value.toString();
      }
      return String(value);
    } catch {
      return '';
    }
  });
}
  
// Component for rendering individual sections
interface SectionProps {
  template: string;
  context: PVProject;
}
  
const Section: React.FC<SectionProps> = ({ template, context }) => {
  const markdownContent = interpolateTemplate(template, context);
  
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeMathjax]}
    >
      {markdownContent}
    </ReactMarkdown>
  );
};
  
import { StepProps } from './types';

export function ReportStep1({ form, pvProject, setPVProject }: StepProps) {

  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // In a real application, you would fetch data from your API or use passed data
    if (pvProject) {
      setLoading(false);
    } else {
      // Mock data for demonstration purposes
      // In a real application, this would come from your database
      setPVProject?.(pvProject_mockData);
      setLoading(false);
    }
  }, [pvProject, setPVProject]);
  
  if (loading) {
    return <div>Loading report data...</div>;
  }
  
  if (!pvProject) {
    return <div>Error loading report data</div>;
  }
  
  // Get first panel and inverter
  const panel = pvProject.panels[0];
  if (!panel) {
    return <div>Error: No panel data found</div>;
  }

  const inverter = pvProject.inverters[0];
  if (!inverter) {
    return <div>Error: No inverter data found</div>;
  }

  // Calculate total number of panels from arrays
  const numPanels = pvProject.arrays.reduce((total, arr) => total + (arr.quantity || 0), 0);

  // Calculate array configuration
  const array = calculateArrayConfiguration(panel, inverter, numPanels);
  
  // Calculate protection devices
  const protection = calculateProtectionDevices(panel, array);
  
  // Calculate cable sizing
  const defaultWire = {
    Iz: 43,
    section: 4,
    length: 10,
    maker: 'Default',
    type: 'DC',
    description: 'Default cable',
    price: 0,
    acFlag: false
  };

  const dc_cable_sizing = calculateDCCableSizing(
    pvProject.wires?.find(w => w.type === 'DC') || defaultWire,
    panel
  );
  const ac1_cable_sizing = calculateACCableSizing(
    pvProject.wires?.find(w => w.type === 'AC') || {...defaultWire, type: 'AC', acFlag: true},
    inverter
  );
  const ac2_cable_sizing = {
    delta_u: 0,
    delta_u_perc: 0
  };

  // Generate the complete report by concatenating all sections
  const fullReport = `---
math: true
mathjax: true
layout: post
---

${interpolateTemplate(equipmentTemplate, {
  panel,
  inverter
} as const)}

${interpolateTemplate(arrayConfigurationTemplate, { array } as const)}

${interpolateTemplate(protectionTemplate, { protection } as const)}

${interpolateTemplate(cableSizingTemplate, {
  dc_cable_sizing,
  ac1_cable_sizing,
  ac2_cable_sizing,
  constants
} as const)}

`;
  
  return (
    <div className="report-container space-y-6">
      <h1 className="text-3xl font-bold border-b pb-2 mb-4">PV System Design Report</h1>
      
      {/* Option 1: Render all at once */}
      <div className="prose max-w-none">
        <ReactMarkdown
          // remarkPlugins={[remarkMath]}
          // rehypePlugins={[rehypeMathjax]}
          rehypePlugins={[rehypeRaw, remarkMath]}
          remarkPlugins={[remarkGfm, rehypeMathjax]}
          remarkRehypeOptions={{ passThrough: ['link'] }}
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 border-b pb-2" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-5 mb-3 border-b pb-1" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-4 mb-2" {...props} />,
            p: ({node, ...props}) => <p className="my-3" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 my-3" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-3" {...props} />,
            li: ({node, ...props}) => <li className="my-1" {...props} />,
            table: ({node, ...props}) => (
              <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 my-4">
                <table className="w-full border-collapse" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="border border-gray-200 p-3 text-left bg-gray-50 font-semibold" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-200 p-3" {...props} />,
            tr: ({node, ...props}) => <tr className="hover:bg-gray-50" {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-100 rounded px-1 py-0.5 text-sm" {...props} />,
            pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto text-sm my-3" {...props} />,
          }}
        >
          {fullReport}
        </ReactMarkdown>
      </div>
      
      {/* Option 2: Render section by section */}
      {/* 
      <div className="section">
        <Section template={equipmentTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={arrayConfigurationTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={protectionTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={cableSizingTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={groundingTemplate} context={reportData} />
      </div>
      <div className="section">
        <Section template={calculationsTemplate} context={reportData} />
      </div>
      */}
      
      {/* Export functionality */}
      <div className="export-buttons">
        <button onClick={() => {
          // Create a Blob with the markdown content
          const blob = new Blob([fullReport], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          
          // Create a download link and trigger it
          const a = document.createElement('a');
          a.href = url;
          a.download = 'pv_system_report.md';
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}>
          Export Markdown
        </button>
      </div>
    </div>
  );
};
