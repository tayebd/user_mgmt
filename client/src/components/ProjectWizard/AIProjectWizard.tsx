'use client';

import { useState, useEffect } from 'react';
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

  const startAIDesign = async (retryCount = 0) => {
    const maxRetries = 3;

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

    const attemptDesign = async (): Promise<boolean> => {
      try {
        // Add timeout to the request
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });

        const result = await Promise.race([
          createAIDesign(designData),
          timeoutPromise
        ]);

        if (result && (result as any).id) {
          const designId = (result as any).id;
          setCurrentDesignId(designId);
          toast.success('AI design started! This typically takes 2-5 seconds.');
          startPolling(designId);
          return true;
        } else {
          throw new Error('Invalid response from AI design service');
        }
      } catch (error) {
        console.error(`AI design attempt ${retryCount + 1} failed:`, error);

        // Check if we should retry
        const shouldRetry = retryCount < maxRetries && (
          error instanceof Error && (
            error.message.includes('fetch') ||
            error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('503') ||
            error.message.includes('502') ||
            error.message.includes('500')
          )
        );

        if (shouldRetry) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          toast.info(`Retrying in ${delay / 1000} seconds... (${retryCount + 1}/${maxRetries})`);

          await new Promise(resolve => setTimeout(resolve, delay));
          return attemptDesign();
        } else {
          // Handle different error types with specific messages
          let errorMessage = 'Failed to start AI design. Please try again.';

          if (error instanceof Error) {
            if (error.message.includes('timeout')) {
              errorMessage = 'Request timed out. The AI service is taking longer than expected. Please try again.';
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
              errorMessage = 'Network connection error. Please check your internet connection and try again.';
            } else if (error.message.includes('401') || error.message.includes('403')) {
              errorMessage = 'Authentication error. Please refresh the page and try again.';
            } else if (error.message.includes('429')) {
              errorMessage = 'Too many requests. Please wait a moment and try again.';
            } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
              errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
            }
          }

          toast.error(errorMessage);
          setIsProcessing(false);
          return false;
        }
      }
    };

    await attemptDesign();
  };

  const startPolling = (designId: string) => {
    let pollCount = 0;
    const maxPolls = 30; // Maximum 60 seconds of polling (30 * 2 seconds)
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    const interval = setInterval(async () => {
      pollCount++;
      consecutiveErrors++;

      try {
        // Get auth token using the same method as the API store
        const token = await getAuthToken();

        // Add timeout to the polling request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // Fetch the latest design status
        const response = await fetch(`${API_BASE_URL}/ai/designs/${designId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        consecutiveErrors = 0; // Reset error count on successful request

        if (response.ok) {
          const result: AIDesignResult = await response.json();

          if (result.status === 'COMPLETED') {
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            setDesignResult(result);
            setCurrentStep(3); // Move to results step
            toast.success('AI design completed successfully!');
            return;
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
            return;
          }
          // If status is PROCESSING, continue polling
        } else if (response.status === 404) {
          // Design not found - might still be processing or was deleted
          if (pollCount > 5) { // After 10 seconds, treat as error
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            toast.error('Design not found. Please try starting a new design.');
          }
        } else if (response.status >= 500) {
          // Server error - continue polling but with backoff
          if (consecutiveErrors >= maxConsecutiveErrors) {
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            toast.error('Server error. Please try again later.');
          }
        } else {
          // Other HTTP errors (auth, forbidden, etc.)
          clearInterval(interval);
          setPollingInterval(null);
          setIsProcessing(false);
          toast.error('Request failed. Please refresh the page and try again.');
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            // Request timed out
            if (consecutiveErrors >= maxConsecutiveErrors) {
              clearInterval(interval);
              setPollingInterval(null);
              setIsProcessing(false);
              toast.error('Request timeout. Please check your connection and try again.');
            }
          } else if (error.message.includes('No active session found')) {
            // Authentication error
            clearInterval(interval);
            setPollingInterval(null);
            setIsProcessing(false);
            toast.error('Authentication error. Please refresh the page and try again.');
          } else if (error.message.includes('fetch')) {
            // Network error
            if (consecutiveErrors >= maxConsecutiveErrors) {
              clearInterval(interval);
              setPollingInterval(null);
              setIsProcessing(false);
              toast.error('Network error. Please check your connection and try again.');
            }
          }
        }
      }

      // Check if we've exceeded maximum polling time
      if (pollCount >= maxPolls) {
        clearInterval(interval);
        setPollingInterval(null);
        setIsProcessing(false);
        toast.error('Design is taking longer than expected. Please try again or contact support.');
      }
    }, 2000); // Poll every 2 seconds

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
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          System Requirements
        </CardTitle>
        <CardDescription>
          Tell us about your energy needs and preferences. Our AI will optimize the design based on these requirements.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Power Target - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              Power Target
            </label>
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={requirements.powerTarget}
                  onChange={(e) => setRequirements(prev => ({ ...prev, powerTarget: Number(e.target.value) }))}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                >
                  <option value={3000}>3 kW - Small Residential</option>
                  <option value={5000}>5 kW - Medium Residential</option>
                  <option value={6000}>6 kW - Large Residential</option>
                  <option value={10000}>10 kW - Commercial</option>
                  <option value={15000}>15 kW - Large Commercial</option>
                </select>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-300">Daily Production:</span>
                  <span className="font-semibold text-purple-900 dark:text-purple-100">
                    {Math.round(requirements.powerTarget * 4.5 / 365)} kWh
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-purple-700 dark:text-purple-300">Monthly Production:</span>
                  <span className="font-semibold text-purple-900 dark:text-purple-100">
                    {Math.round(requirements.powerTarget * 4.5 / 12)} kWh
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              Budget Range
            </label>
            <div className="space-y-3">
              <div className="relative">
                <select
                  value={requirements.budget}
                  onChange={(e) => setRequirements(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                >
                  <option value={3000}>€3,000 - Budget</option>
                  <option value={5000}>€5,000 - Standard</option>
                  <option value={8000}>€8,000 - Quality</option>
                  <option value={12000}>€12,000 - Premium</option>
                  <option value={20000}>€20,000 - High-End</option>
                </select>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700 dark:text-green-300">Cost per Watt:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    €{(requirements.budget / requirements.powerTarget).toFixed(2)}/W
                  </span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((requirements.budget / requirements.powerTarget) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {requirements.budget / requirements.powerTarget < 1 ? 'Excellent Value' :
                     requirements.budget / requirements.powerTarget < 1.5 ? 'Good Value' :
                     requirements.budget / requirements.powerTarget < 2 ? 'Standard Pricing' : 'Premium Range'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roof Type - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Roof Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'tilted', label: 'Tiled', icon: '🏠' },
                { value: 'flat', label: 'Flat', icon: '🏢' },
                { value: 'other', label: 'Other', icon: '⚙️' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setRequirements(prev => ({ ...prev, roofType: type.value as AIRequirements['roofType'] }))}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    requirements.roofType === type.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div>{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              Design Priority
            </label>
            <div className="space-y-2">
              {[
                { value: 'efficiency', label: 'Maximum Efficiency', desc: 'Most energy per area', color: 'red' },
                { value: 'cost', label: 'Lowest Cost', desc: 'Best value for money', color: 'green' },
                { value: 'space', label: 'Space Optimization', desc: 'Compact design', color: 'blue' },
                { value: 'reliability', label: 'Highest Reliability', desc: 'Premium durability', color: 'purple' }
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setRequirements(prev => ({ ...prev, priority: priority.value as AIRequirements['priority'] }))}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    requirements.priority === priority.value
                      ? `border-${priority.color}-500 bg-${priority.color}-50 dark:bg-${priority.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{priority.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{priority.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Orientation - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Roof Orientation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'south', label: 'South', angle: '↙' },
                { value: 'south-east', label: 'SE', angle: '↓' },
                { value: 'south-west', label: 'SW', angle: '↘' },
                { value: 'east', label: 'East', angle: '←' },
                { value: 'west', label: 'West', angle: '→' },
                { value: 'other', label: 'Other', angle: '?' }
              ].map((orientation) => (
                <button
                  key={orientation.value}
                  type="button"
                  onClick={() => setRequirements(prev => ({ ...prev, orientation: orientation.value as AIRequirements['orientation'] }))}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    requirements.orientation === orientation.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{orientation.angle}</div>
                  <div>{orientation.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tilt Angle - Enhanced */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
              Tilt Angle
            </label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={requirements.tilt}
                  onChange={(e) => setRequirements(prev => ({ ...prev, tilt: Number(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((requirements.tilt - 5) / 40) * 100}%, #e5e7eb ${((requirements.tilt - 5) / 40) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5°</span>
                  <span>25°</span>
                  <span>45°</span>
                </div>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">{requirements.tilt}°</div>
                <div className="text-sm text-teal-600 dark:text-teal-400">
                  {requirements.tilt < 15 ? 'Flat Installation' :
                   requirements.tilt < 25 ? 'Low Tilt' :
                   requirements.tilt < 35 ? 'Optimal Tilt' : 'Steep Installation'}
                </div>
              </div>
            </div>
          </div>

          {/* Constraints - Enhanced */}
          <div className="space-y-3 lg:col-span-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
              Special Constraints
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'shading', label: 'Shading Issues', icon: '🌳' },
                { value: 'space_limitation', label: 'Limited Space', icon: '📐' },
                { value: 'building_restrictions', label: 'Building Rules', icon: '🏛️' },
                { value: 'historic_property', label: 'Historic Site', icon: '🏛️' }
              ].map((constraint) => (
                <button
                  key={constraint.value}
                  type="button"
                  onClick={() => {
                    if (requirements.constraints.includes(constraint.value)) {
                      setRequirements(prev => ({
                        ...prev,
                        constraints: prev.constraints.filter(c => c !== constraint.value)
                      }));
                    } else {
                      setRequirements(prev => ({
                        ...prev,
                        constraints: [...prev.constraints, constraint.value]
                      }));
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    requirements.constraints.includes(constraint.value)
                      ? 'border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="text-lg mb-1">{constraint.icon}</div>
                  <div>{constraint.label}</div>
                </button>
              ))}
            </div>
            {requirements.constraints.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Selected constraints may affect system performance and cost. Our AI will optimize accordingly.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Processing Step Component
function ProcessingStep() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');

  const steps = [
    { icon: Clock, text: 'Analyzing requirements...', color: 'blue' },
    { icon: Zap, text: 'Selecting optimal equipment...', color: 'yellow' },
    { icon: Calculator, text: 'Calculating configuration...', color: 'green' },
    { icon: Shield, text: 'Validating compliance...', color: 'purple' },
    { icon: TrendingUp, text: 'Optimizing performance...', color: 'orange' }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 800);

    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <Card>
      <CardContent className="py-12">
        <div className="text-center space-y-8">
          {/* Animated Brain Icon */}
          <div className="flex justify-center relative">
            <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <Brain className="h-20 w-20 text-purple-600 relative z-10 animate-bounce" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI is Designing Your Solar System
              <span className="text-purple-600">{dots}</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our intelligent algorithms are analyzing thousands of equipment combinations to find the perfect design for your specific requirements
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center items-center space-x-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={index} className="flex items-center">
                    <div className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-purple-600 text-white scale-110 shadow-lg'
                        : isCompleted
                        ? 'bg-green-500 text-white scale-95'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 scale-90'
                    }`}>
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-30"></div>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 mx-2 transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Current Step Text */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-center space-x-3">
                {(() => {
                  const CurrentIcon = steps[currentStep].icon;
                  return (
                    <>
                      <CurrentIcon className={`h-6 w-6 text-${steps[currentStep].color}-600 animate-pulse`} />
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {steps[currentStep].text}
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Additional Processing Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1000+</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Equipment Options Analyzed</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">25+</div>
              <div className="text-sm text-green-800 dark:text-green-200">Performance Metrics</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8760</div>
              <div className="text-sm text-purple-800 dark:text-purple-200">Hourly Simulations</div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-purple-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              ></div>
            ))}
          </div>

          {/* Estimated Time */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Time</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">2-5 seconds</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Our AI is optimizing for the perfect balance of performance, cost, and reliability for your specific requirements.
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