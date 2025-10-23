import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calculator, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
// Import calculation templates
import {
  equipmentTemplate,
  arrayConfigurationTemplate,
  protectionTemplate,
  cableSizingTemplate,
  groundingTemplate
} from '@/components/ProjectWizard/calculations/templates';

interface AIDesignResult {
  id: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  designResult: {
    panels: {
      selected: {
        id: number;
        maker: string;
        model: string;
        maxPower: number;
        efficiency: number;
      };
      quantity: number;
      totalPowerDC: number;
    };
    inverter: {
      selected: {
        id: number;
        maker: string;
        model: string;
        maxOutputPower: number;
        efficiency: number;
      };
      quantity: number;
      totalPowerAC: number;
    };
    cost: {
      total: number;
      equipment: number;
      installation: number;
      costPerWatt: number;
    };
    roi: number;
  };
  systemConfiguration: {
    arrayConfiguration: string;
    orientation: string;
    tilt: number;
    estimatedProduction: number;
    specificYield: number;
    performanceRatio: number;
    systemEfficiency: number;
  };
  performanceEstimates: {
    annualProduction: number;
    specificYield: number;
    performanceRatio: number;
    systemEfficiency: number;
    financialMetrics: {
      npv: number;
      irr: number;
      paybackPeriod: number;
      lcoe: number;
    };
    environmentalBenefits: {
      co2Offset: number;
      equivalentTrees: number;
      coalDisplacement: number;
    };
  };
  complianceResults: {
    electricalCodeCompliant: boolean;
    buildingCodeCompliant: boolean;
    utilityCompliant: boolean;
    complianceScore: number;
    issues: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
  };
  confidenceScore: number;
}

interface AIReportGeneratorProps {
  aiDesign: AIDesignResult;
  onClose: () => void;
}

const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to interpolate values in templates
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

export function AIReportGenerator({ aiDesign, onClose }: AIReportGeneratorProps) {
  const [activeSection, setActiveSection] = useState('Executive Summary');

  const sections = [
    {
      title: 'Executive Summary',
      icon: <FileText className="h-4 w-4" />,
      content: generateExecutiveSummary(aiDesign),
    },
    {
      title: 'Equipment',
      icon: <Calculator className="h-4 w-4" />,
      content: generateEquipmentSection(aiDesign),
    },
    {
      title: 'Array Configuration',
      icon: <Calculator className="h-4 w-4" />,
      content: generateArrayConfigurationSection(aiDesign),
    },
    {
      title: 'Protection System',
      icon: <Shield className="h-4 w-4" />,
      content: generateProtectionSection(aiDesign),
    },
    {
      title: 'Performance',
      icon: <TrendingUp className="h-4 w-4" />,
      content: generatePerformanceSection(aiDesign),
    },
    {
      title: 'Compliance',
      icon: <Shield className="h-4 w-4" />,
      content: generateComplianceSection(aiDesign),
    },
  ];

  const downloadReport = () => {
    const reportContent = sections.map(section =>
      `# ${section.title}\n\n${section.content}\n\n---\n`
    ).join('\n');

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-ai-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Report downloaded successfully');
  };

  const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    h1: ({ children }) => <h1 className="text-3xl font-bold mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-bold mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold mb-2">{children}</h3>,
    p: ({ children }) => <p className="mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5">{children}</code>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-gray-200">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-gray-300 px-4 py-2">
        {children}
      </td>
    ),
    // Handle center tags by wrapping in a div with text-center
    div: ({ children, className }) => {
      if (className?.includes('center')) {
        return <div className="text-center">{children}</div>;
      }
      return <div className={className}>{children}</div>;
    },
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                AI-Generated Solar Report
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  AI Optimized
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {aiDesign.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            {/* Section Navigation */}
            <div className="col-span-1">
              <h3 className="font-semibold mb-4">Report Sections</h3>
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.title}
                    onClick={() => setActiveSection(section.title)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeSection === section.title
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Content */}
            <div className="col-span-3">
              <ScrollArea className="h-[600px] w-full rounded-md border p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown components={markdownComponents}>
                    {sections.find(s => s.title === activeSection)?.content || ''}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateExecutiveSummary(aiDesign: AIDesignResult): string {
  const system = aiDesign.designResult || {};
  const performance = aiDesign.performanceEstimates || {};

  return `
# AI-Generated Solar PV System Report

## Executive Summary

**Project Overview**
- **System Size**: ${system.panels?.totalPowerDC || 0}W DC / ${system.inverter?.totalPowerAC || 0}W AC
- **Total Investment**: €${safeNumber(system.cost?.total || 0).toFixed(0)}
- **AI Confidence Score**: ${safeNumber(aiDesign.confidenceScore || 0).toFixed(0)}%

## Key Performance Metrics
- **Annual Production**: ${safeNumber(performance.annualProduction || 0).toFixed(0)} kWh/year
- **Specific Yield**: ${safeNumber(performance.specificYield || 0).toFixed(0)} kWh/kWp/year
- **Performance Ratio**: ${safeNumber(performance.performanceRatio || 0).toFixed(1)}%

## Financial Highlights
- **25-Year ROI**: ${safeNumber(system.roi || 0).toFixed(1)}%
- **Payback Period**: ${safeNumber(performance.financialMetrics?.paybackPeriod || 0).toFixed(1)} years

*This report was generated by AI using advanced algorithms for optimal system design.*
`;
}

function generateEquipmentSection(aiDesign: AIDesignResult): string {
  const system = aiDesign.designResult || {};
  const panel = system.panels?.selected || {};
  const inverter = system.inverter?.selected || {};

  // Create context data for template interpolation
  const templateContext = {
    project: {
      customer: 'AI-Generated Design',
      reference: `AI-${aiDesign.id}`,
      arrayPowerkW: safeNumber(system.panels?.totalPowerDC || 0) / 1000,
      numberPanels: system.panels?.quantity || 0,
      numberInverters: system.inverter?.quantity || 0
    },
    panel: {
      maker: panel.maker || 'Unknown',
      model: panel.model || 'Unknown',
      maxPower: safeNumber(panel.maxPower || 0),
      efficiency: safeNumber(panel.efficiency || 0),
      voltageAtPmax: 0, // Default values for missing fields
      currentAtPmax: 0,
      openCircuitVoltage: 0,
      shortCircuitCurrent: 0,
      tempCoeffVoc: -0.3,
      tempCoeffIsc: 0.05
    },
    inverter: {
      maker: inverter.maker || 'Unknown',
      model: inverter.model || 'Unknown',
      maxOutputPower: safeNumber(inverter.maxOutputPower || 0),
      efficiency: safeNumber(inverter.efficiency || 0),
      nominalOutputPower: safeNumber(inverter.maxOutputPower || 0),
      maxDcVoltage: 600,
      maxInputCurrentPerMppt: 10,
      maxShortCircuitCurrent: 15,
      numberOfMpptTrackers: 1,
      mpptRange: '100-500',
      mpptVoltageRangeMin: 100,
      mpptVoltageRangeMax: 500,
      maxApparentPower: safeNumber(inverter.maxOutputPower || 0) / 1000,
      outputVoltage: 230,
      maxOutputCurrent: safeNumber(inverter.maxOutputPower || 0) / 230
    }
  };

  // Use the equipment template with interpolated values
  return interpolateTemplate(equipmentTemplate, templateContext);
}

function generatePerformanceSection(aiDesign: AIDesignResult): string {
  const performance = aiDesign.performanceEstimates || {};

  return `
# Performance Analysis

## Production Metrics
- **Annual Production**: ${safeNumber(performance.annualProduction || 0).toFixed(0)} kWh/year
- **Specific Yield**: ${safeNumber(performance.specificYield || 0).toFixed(0)} kWh/kWp/year
- **Performance Ratio**: ${safeNumber(performance.performanceRatio || 0).toFixed(1)}%
- **System Efficiency**: ${safeNumber(performance.systemEfficiency || 0).toFixed(1)}%

## Financial Performance
- **25-Year NPV**: €${safeNumber(performance.financialMetrics?.npv || 0).toFixed(0)}
- **Internal Rate of Return**: ${safeNumber(performance.financialMetrics?.irr || 0).toFixed(1)}%
- **Levelized Cost of Energy**: €${safeNumber(performance.financialMetrics?.lcoe || 0).toFixed(3)}/kWh

## System Performance
This AI-optimized design achieves a ${safeNumber(performance.performanceRatio || 0).toFixed(1)}% performance ratio, which is ${safeNumber(performance.performanceRatio || 0) > 80 ? 'excellent' : 'good'} for optimal energy production.
`;
}

function generateArrayConfigurationSection(aiDesign: AIDesignResult): string {
  const system = aiDesign.designResult || {};
  const panel = system.panels?.selected || {};
  const inverter = system.inverter?.selected || {};

  // Create context data for array configuration template
  const templateContext = {
    panel: {
      maker: panel.maker || 'Unknown',
      model: panel.model || 'Unknown',
      voltageAtPmax: 0,
      tempCoeffVoc: -0.3,
      tempCoeffIsc: 0.05,
      shortCircuitCurrent: 0,
      currentAtPmax: 0
    },
    inverter: {
      maker: inverter.maker || 'Unknown',
      model: inverter.model || 'Unknown',
      maxDcVoltage: 600,
      maxInputCurrentPerMppt: 10,
      maxShortCircuitCurrent: 15,
      mpptVoltageRangeMin: 100,
      mpptVoltageRangeMax: 500,
      nominalOutputPower: safeNumber(inverter.maxOutputPower || 0)
    },
    array: {
      Voc_10: 0,
      Nsmax: 0,
      Vmp_10: 0,
      Nsoptimal: 0,
      Vmp_85: 0,
      Nsmin: 0,
      Isc_85: 0,
      Npmax: 0,
      Imp_85: 0,
      Npoptimal: 0,
      array_power: safeNumber(system.panels?.totalPowerDC || 0),
      power_ratio: safeNumber((system.panels?.totalPowerDC || 0) / (system.inverter?.totalPowerAC || 1))
    }
  };

  return interpolateTemplate(arrayConfigurationTemplate, templateContext);
}

function generateProtectionSection(aiDesign: AIDesignResult): string {
  const system = aiDesign.designResult || {};
  const panel = system.panels?.selected || {};
  const inverter = system.inverter?.selected || {};

  // Create context data for protection template
  const templateContext = {
    panel: {
      shortCircuitCurrent: 0,
      maxSeriesFuseRating: 15
    },
    inverter: {
      outputVoltage: 230,
      maxOutputCurrent: safeNumber(inverter.maxOutputPower || 0) / 230
    },
    array: {
      Voc_10: 0
    },
    protection: {
      Ncmax_lmt: 0,
      Npmax_lmt: 0,
      fuse_IscSTC: 0,
      switch_IscSTC: 0,
      Vocmax: 0,
      Iscmax: 0
    },
    dc_protection: {
      fuse: {
        Vn: 1000,
        In: 15,
        maker: 'Standard',
        type: 'DC Fuse'
      },
      switch: {
        Usec: 1000,
        Isec: 20,
        maker: 'Standard',
        ref_type: 'DC Switch'
      },
      lightning: {
        Ucpv: 1000,
        Up: 1.5,
        In: 10,
        InUnit: 'kA',
        Iscpv: 15,
        IscpvUnit: 'kA',
        maker: 'Standard',
        ref_type: 'DC SPD'
      }
    },
    ac_protection: {
      fuse: {
        Vn: 230,
        In: 20,
        sensitivity: '30mA',
        maker: 'Standard',
        ref_type: 'AC Breaker'
      },
      switch: {
        Usec: 230,
        Isec: 25
      },
      lightning: {
        Uc: 275,
        Up: 1.5,
        In: 10,
        InUnit: 'kA',
        Isc: 15,
        IscUnit: 'kA',
        maker: 'Standard',
        ref_type: 'AC SPD'
      }
    }
  };

  return interpolateTemplate(protectionTemplate, templateContext);
}

function generateComplianceSection(aiDesign: AIDesignResult): string {
  const compliance = aiDesign.complianceResults || {};

  return `
# Compliance & Safety Analysis

## Code Compliance Status
${compliance.electricalCodeCompliant ? '✅ **Electrical Code Compliant**' : '⚠️ **Electrical Code Issues Found**'}
${compliance.buildingCodeCompliant ? '✅ **Building Code Compliant**' : '⚠️ **Building Code Issues Found**'}
${compliance.utilityCompliant ? '✅ **Utility Standards Compliant**' : '⚠️ **Utility Issues Found**'}

## Overall Compliance Score: ${safeNumber(compliance.complianceScore || 0).toFixed(0)}/100

${compliance.issues && compliance.issues.length > 0 ? `
## Issues Identified
${compliance.issues.slice(0, 3).map(issue => `
### ${issue.type} (${issue.severity})
**Description**: ${issue.description}
**Recommendation**: ${issue.recommendation}
`).join('\n')}
` : '✅ **No critical compliance issues identified**'}

## Safety Features
- Automatic rapid shutdown capability
- Proper grounding and fault protection
- Fire-rated components where required
- Accessible disconnect switches

*Compliance analysis based on standard electrical codes and safety requirements.*
`;
}