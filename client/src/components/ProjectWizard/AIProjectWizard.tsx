'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Zap, Calculator, TrendingUp, Shield, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { LocationStep } from './steps/LocationStep';
import { useApiStore } from '@/state/api';
import { getAuthToken } from '@/utils/auth';
import { toast } from 'sonner';
import { AIReportGenerator } from './AIReportGenerator';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Utility function to safely convert database values to numbers
const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

interface AIRequirements {
  location: string;
  latitude: number;
  longitude: number;
  climateZone: string;
  powerTarget: number; // Watts
  budget: number;
  roofType: 'tilted' | 'flat' | 'other';
  orientation: 'south' | 'south-east' | 'south-west' | 'east' | 'west' | 'other';
  tilt: number;
  priority: 'efficiency' | 'cost' | 'space' | 'reliability';
  constraints: string[];
}

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
  performanceEstimates: {
    annualProduction: number;
    specificYield: number;
    performanceRatio: number;
    systemEfficiency: number;
    lifetimeProduction: number[];
    financialMetrics: {
      npv: number;
      irr: number;
      paybackPeriod: number;
      lcoe: number;
    };
    environmentalBenefits: {
      co2Offset: number;
      equivalentTrees: number;
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
    recommendations: string[];
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
  confidenceScore: number;
  processingTimeMs: number;
  errorMessage?: string;
}

export function AIProjectWizard() {
  const { createAIDesign } = useApiStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [designResult, setDesignResult] = useState<AIDesignResult | null>(null);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Form state
  const [requirements, setRequirements] = useState<AIRequirements>({
    location: '',
    latitude: 48.8566, // Default to Paris
    longitude: 2.3522,
    climateZone: 'Cfb',
    powerTarget: 6000,
    budget: 8000,
    roofType: 'tilted',
    orientation: 'south',
    tilt: 30,
    priority: 'efficiency',
    constraints: []
  });

  const [pvProject, setPVProject] = useState({
    name: '',
    address: '',
    latitude: 48.8566,
    longitude: 2.3522,
    timezone: 'Europe/Paris',
    elevation: 35
  });

  const steps = [
    { title: 'Project Location', description: 'Tell us where your solar project will be located' },
    { title: 'System Requirements', description: 'Specify your power needs and preferences' },
    { title: 'AI Processing', description: 'Our AI designs your optimal solar system' },
    { title: 'Results', description: 'Review your personalized solar design' }
  ];

  const validateLocationStep = () => {
    if (!pvProject.name.trim()) {
      toast.error('Please enter a project name');
      return false;
    }
    if (!pvProject.address.trim()) {
      toast.error('Please enter a project address');
      return false;
    }
    return true;
  };

  const validateRequirementsStep = () => {
    if (requirements.powerTarget < 1000 || requirements.powerTarget > 100000) {
      toast.error('Power target must be between 1kW and 100kW');
      return false;
    }
    if (requirements.budget < 1000 || requirements.budget > 100000) {
      toast.error('Budget must be between €1,000 and €100,000');
      return false;
    }
    return true;
  };

  const startAIDesign = async () => {
    setIsProcessing(true);
    setCurrentDesignId(null);
    setDesignResult(null);

    const designData = {
      requirements: {
        location: requirements.location || pvProject.address,
        powerTarget: requirements.powerTarget,
        budget: requirements.budget,
        roofType: requirements.roofType,
        orientation: requirements.orientation,
        tilt: requirements.tilt,
        priority: requirements.priority,
        constraints: requirements.constraints
      },
      locationContext: {
        latitude: requirements.latitude,
        longitude: requirements.longitude,
        climateZone: requirements.climateZone,
        solarIrradiance: 1230, // Default for France
        electricityPrice: 0.25,
        feedInTariff: 0.10
      }
    };

    try {
      const result = await createAIDesign(designData);
      if (result && result.id) {
        setCurrentDesignId(result.id);
        toast.success('AI design started! This typically takes 2-5 seconds.');

        // Start polling for results
        startPolling(result.id);
      }
    } catch (error) {
      console.error('Error starting AI design:', error);
      toast.error('Failed to start AI design. Please try again.');
      setIsProcessing(false);
    }
  };

  const startPolling = (designId: string) => {
    const interval = setInterval(async () => {
      try {
        // Get auth token using the same method as the API store
        const token = await getAuthToken();

        // Fetch the latest design status
        const response = await fetch(`${API_BASE_URL}/ai/designs/${designId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result: AIDesignResult = await response.json();

          if (result.status === 'COMPLETED') {
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            setDesignResult(result);
            setCurrentStep(3); // Move to results step
            toast.success('AI design completed successfully!');
          } else if (result.status === 'FAILED') {
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            setDesignResult({
              ...result,
              errorMessage: ((result.designResult as Record<string, unknown>)?.error as string) || 'Unknown error'
            });
            setCurrentStep(3);
            toast.error('AI design failed. Please try different requirements.');
          }
        } else {
          // HTTP error occurred - could be 404, 500, etc.
          // Continue polling as the server might be processing
        }
      } catch (error) {
        // Network error occurred
        // If there's an authentication error, stop polling
        if (error instanceof Error && error.message.includes('No active session found')) {
          clearInterval(interval);
          setPollingInterval(null);
          setIsProcessing(false);
          toast.error('Authentication error. Please refresh the page and try again.');
        }
        // For other network errors, continue polling
      }
    }, 2000); // Poll every 2 seconds instead of 1 second

    setPollingInterval(interval);
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateLocationStep()) return;
    if (currentStep === 1 && !validateRequirementsStep()) return;

    if (currentStep === 1) {
      startAIDesign();
      setCurrentStep(2);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsProcessing(false);
    setDesignResult(null);
    setCurrentDesignId(null);
    setShowReport(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleGenerateReport = () => {
    if (designResult) {
      setShowReport(true);
    }
  };

  const renderStepContent = () => {
    if (showReport && designResult) {
      return <AIReportGenerator aiDesign={designResult as any} onClose={() => setShowReport(false)} />; // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    switch (currentStep) {
      case 0:
        return <LocationStep form={{} as any} pvProject={pvProject as any} setPVProject={setPVProject as any} />; // eslint-disable-line @typescript-eslint/no-explicit-any
      case 1:
        return <RequirementsStep requirements={requirements} setRequirements={setRequirements} />;
      case 2:
        return <ProcessingStep />;
      case 3:
        return <ResultsStep result={designResult} onReset={handleReset} onGenerateReport={handleGenerateReport} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Solar Design Wizard
              </CardTitle>
              <CardDescription>
                Get a complete solar system design optimized for your specific needs
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              AI-Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className={`flex items-center ${
                    index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index < currentStep ? 'bg-purple-600 text-white' :
                      index === currentStep ? 'border-2 border-purple-600 bg-white text-purple-600' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="ml-3">
                      <p className={`font-medium ${
                        index <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <Progress
              value={(currentStep / (steps.length - 1)) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <Card>
        <CardContent>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isProcessing}
            >
              Back
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length - 1 && (
                <Button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {currentStep === 1 ? 'Start AI Design' : 'Next'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Requirements Step Component
function RequirementsStep({
  requirements,
  setRequirements
}: {
  requirements: AIRequirements;
  setRequirements: React.Dispatch<React.SetStateAction<AIRequirements>>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Requirements</CardTitle>
        <CardDescription>
          Tell us about your energy needs and preferences. Our AI will optimize the design based on these requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Power Target */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Power Target (Watts)</label>
            <select
              value={requirements.powerTarget}
              onChange={(e) => setRequirements(prev => ({ ...prev, powerTarget: Number(e.target.value) }))}
              className="w-full p-2 border rounded-md"
            >
              <option value={3000}>3 kW - Small Residential</option>
              <option value={5000}>5 kW - Medium Residential</option>
              <option value={6000}>6 kW - Large Residential</option>
              <option value={10000}>10 kW - Commercial</option>
              <option value={15000}>15 kW - Large Commercial</option>
            </select>
            <p className="text-xs text-gray-500">
              Average daily consumption: {Math.round(requirements.powerTarget * 4.5 / 365)} kWh
            </p>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Budget (Euros)</label>
            <select
              value={requirements.budget}
              onChange={(e) => setRequirements(prev => ({ ...prev, budget: Number(e.target.value) }))}
              className="w-full p-2 border rounded-md"
            >
              <option value={3000}>€3,000 - Budget</option>
              <option value={5000}>€5,000 - Standard</option>
              <option value={8000}>€8,000 - Quality</option>
              <option value={12000}>€12,000 - Premium</option>
              <option value={20000}>€20,000 - High-End</option>
            </select>
            <p className="text-xs text-gray-500">
              Cost per watt: €{(requirements.budget / requirements.powerTarget).toFixed(2)}/W
            </p>
          </div>

          {/* Roof Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Roof Type</label>
            <select
              value={requirements.roofType}
              onChange={(e) => setRequirements(prev => ({ ...prev, roofType: e.target.value as AIRequirements['roofType'] }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="tilted">Tiled Roof</option>
              <option value="flat">Flat Roof</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Design Priority</label>
            <select
              value={requirements.priority}
              onChange={(e) => setRequirements(prev => ({ ...prev, priority: e.target.value as AIRequirements['priority'] }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="efficiency">Maximum Efficiency</option>
              <option value="cost">Lowest Cost</option>
              <option value="space">Space Optimization</option>
              <option value="reliability">Highest Reliability</option>
            </select>
            <p className="text-xs text-gray-500">
              {requirements.priority === 'efficiency' && 'Maximum energy production per area'}
              {requirements.priority === 'cost' && 'Best value for money'}
              {requirements.priority === 'space' && 'Optimal for limited roof space'}
              {requirements.priority === 'reliability' && 'Most durable components'}
            </p>
          </div>

          {/* Orientation */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Roof Orientation</label>
            <select
              value={requirements.orientation}
              onChange={(e) => setRequirements(prev => ({ ...prev, orientation: e.target.value as AIRequirements['orientation'] }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="south">South</option>
              <option value="south-east">South-East</option>
              <option value="south-west">South-West</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tilt Angle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tilt Angle (degrees)</label>
            <input
              type="range"
              min="5"
              max="45"
              value={requirements.tilt}
              onChange={(e) => setRequirements(prev => ({ ...prev, tilt: Number(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5° (Flat)</span>
              <span>{requirements.tilt}°</span>
              <span>45° (Steep)</span>
            </div>
          </div>

          {/* Constraints */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Special Constraints</label>
            <div className="grid grid-cols-2 gap-2">
              {['shading', 'space_limitation', 'building_restrictions', 'historic_property'].map(constraint => (
                <label key={constraint} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={requirements.constraints.includes(constraint)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRequirements(prev => ({
                          ...prev,
                          constraints: [...prev.constraints, constraint]
                        }));
                      } else {
                        setRequirements(prev => ({
                          ...prev,
                          constraints: prev.constraints.filter(c => c !== constraint)
                        }));
                      }
                    }}
                    />
                  <span className="text-sm">{constraint.replace('_', ' ').split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Processing Step Component
function ProcessingStep() {
  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Brain className="h-16 w-16 text-purple-600 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI is Designing Your Solar System
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our intelligent algorithms are analyzing your requirements and selecting the optimal equipment
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Analyzing requirements...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Zap className="h-4 w-4 animate-pulse" />
              <span>Selecting optimal equipment...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Calculator className="h-4 w-4 animate-pulse" />
              <span>Calculating configuration...</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4 animate-pulse" />
              <span>Validating compliance...</span>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              This typically takes 2-5 seconds. Our AI is working to find the perfect balance of performance, cost, and reliability for your project.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Results Step Component
function ResultsStep({
  result,
  onReset,
  onGenerateReport
}: {
  result: AIDesignResult | null;
  onReset: () => void;
  onGenerateReport: () => void;
}) {
  if (!result || result.status === 'FAILED') {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Design Failed
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {result?.errorMessage || 'An unexpected error occurred while processing your design.'}
              </p>
            </div>
            <Button onClick={onReset} className="mt-4">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safety check - destructuring with default values using optional chaining
  const designResult = result?.designResult || {
    panels: {
      selected: {
        id: 0,
        maker: 'Unknown',
        model: 'Unknown',
        maxPower: 0,
        efficiency: 0
      },
      quantity: 0,
      totalPowerDC: 0
    },
    inverter: {
      selected: {
        id: 0,
        maker: 'Unknown',
        model: 'Unknown',
        maxOutputPower: 0,
        efficiency: 0
      },
      quantity: 0,
      totalPowerAC: 0
    },
    cost: {
      total: 0,
      equipment: 0,
      installation: 0,
      costPerWatt: 0
    },
    roi: 0
  };

  const performanceEstimates = result?.performanceEstimates || {
    annualProduction: 0,
    specificYield: 0,
    performanceRatio: 0,
    systemEfficiency: 0,
    lifetimeProduction: [],
    financialMetrics: {
      npv: 0,
      irr: 0,
      paybackPeriod: 0,
      lcoe: 0
    },
    environmentalBenefits: {
      co2Offset: 0,
      equivalentTrees: 0
    }
  };

  const complianceResults = result?.complianceResults || {
    electricalCodeCompliant: false,
    buildingCodeCompliant: false,
    utilityCompliant: false,
    complianceScore: 0,
    issues: [],
    recommendations: []
  };

  const confidenceScore = result?.confidenceScore || 0;

  const systemConfiguration = result?.systemConfiguration || {
    arrayConfiguration: 'N/A',
    orientation: 'N/A',
    tilt: 0,
    estimatedProduction: 0,
    specificYield: 0,
    performanceRatio: 0,
    systemEfficiency: 0
  };

  // systemConfiguration is already safe with defaults from the optional chaining above

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Solar Design is Ready!
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI Confidence Score: <span className="font-bold text-purple-600">{safeNumber(confidenceScore).toFixed(0)}%</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Selection</CardTitle>
          <CardDescription>
            Optimal equipment selected by our AI based on your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Panels */}
            <div className="space-y-3">
              <h4 className="font-semibold">Solar Panels</h4>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model:</span>
                    <span className="font-medium">
                      {designResult.panels?.selected?.maker || 'Unknown'} {designResult.panels?.selected?.model || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-medium">{designResult.panels?.quantity || 0} panels</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Power:</span>
                    <span className="font-medium">{designResult.panels?.selected?.maxPower || 0}W each</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="font-medium">{designResult.panels?.selected?.efficiency || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total DC Power:</span>
                    <span className="font-bold text-blue-600">{designResult.panels?.totalPowerDC || 0}W</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inverter */}
            <div className="space-y-3">
              <h4 className="font-semibold">Inverter</h4>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model:</span>
                    <span className="font-medium">
                      {designResult.inverter?.selected?.maker || 'Unknown'} {designResult.inverter?.selected?.model || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Power:</span>
                    <span className="font-medium">{designResult.inverter?.selected?.maxOutputPower || 0}W</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency:</span>
                    <span className="font-medium">{designResult.inverter?.selected?.efficiency || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Configuration:</span>
                    <span className="font-medium">{systemConfiguration.arrayConfiguration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Performance Estimates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Annual Production:</span>
                <span className="font-bold text-blue-600">{safeNumber(performanceEstimates?.annualProduction || 0).toFixed(0)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Specific Yield:</span>
                <span className="font-medium">{safeNumber(performanceEstimates?.specificYield || 0).toFixed(1)} kWh/kWp/year</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Performance Ratio:</span>
                <span className="font-medium">{safeNumber(performanceEstimates?.performanceRatio || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">System Efficiency:</span>
                <span className="font-medium">{safeNumber(performanceEstimates?.systemEfficiency || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">25-Year Production:</span>
                <span className="font-medium">{safeNumber((performanceEstimates?.lifetimeProduction?.[24] || 0) * 25).toFixed(0)} kWh</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Financial Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Cost:</span>
                <span className="font-bold text-green-600">€{safeNumber(designResult.cost?.total || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cost per Watt:</span>
                <span className="font-medium">€{safeNumber(designResult.cost?.costPerWatt || 0).toFixed(2)}/W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ROI:</span>
                <span className="font-bold text-green-600">{safeNumber(designResult.roi || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payback Period:</span>
                <span className="font-medium">{safeNumber(performanceEstimates?.financialMetrics?.paybackPeriod || 0).toFixed(1)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">25-Year NPV:</span>
                <span className="font-medium">€{safeNumber(performanceEstimates?.financialMetrics?.npv || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LCOE:</span>
                <span className="font-medium">€{safeNumber(performanceEstimates?.financialMetrics?.lcoe || 0).toFixed(3)}/kWh</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Compliance & Safety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                complianceResults?.electricalCodeCompliant ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="font-medium">Electrical Code</h4>
              <p className={`text-sm ${complianceResults?.electricalCodeCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {complianceResults?.electricalCodeCompliant ? 'Compliant' : 'Issues Found'}
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                complianceResults?.buildingCodeCompliant ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="font-medium">Building Code</h4>
              <p className={`text-sm ${complianceResults?.buildingCodeCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {complianceResults?.buildingCodeCompliant ? 'Compliant' : 'Issues Found'}
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                complianceResults?.utilityCompliant ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                <Shield className="h-8 w-8" />
              </div>
              <h4 className="font-medium">Utility Standards</h4>
              <p className={`text-sm ${complianceResults?.utilityCompliant ? 'text-green-600' : 'text-red-600'}`}>
                {complianceResults?.utilityCompliant ? 'Compliant' : 'Issues Found'}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Compliance Score: {complianceResults?.complianceScore || 0}/100</h4>
            {complianceResults?.recommendations?.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Key Recommendations:</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside ml-4 space-y-1">
                  {complianceResults?.recommendations?.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Environmental Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safeNumber(performanceEstimates?.environmentalBenefits?.co2Offset || 0).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Tons CO₂ Offset per Year</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safeNumber(performanceEstimates?.environmentalBenefits?.equivalentTrees || 0).toFixed(0)}
              </div>
              <p className="text-sm text-gray-600">Equivalent Trees Planted</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {safeNumber((performanceEstimates?.annualProduction || 0) * 25).toFixed(0)}
              </div>
              <p className="text-sm text-gray-600">kWh Generated in 25 Years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent>
          <div className="flex justify-center gap-4">
            <Button onClick={onReset} variant="outline">
              Design Another System
            </Button>
            <Button onClick={onGenerateReport} className="bg-purple-600 hover:bg-purple-700">
              Generate Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}