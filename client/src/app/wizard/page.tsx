'use client';

import Link from "next/link";
import { Brain, Calculator, ArrowRight, Zap, Clock, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WizardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Choose Your Solar Design
          <span className="text-orange-600 dark:text-orange-400 block">Journey</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Select the design approach that best fits your needs. Both options provide professional-grade solar system designs with detailed performance analysis.
        </p>
      </div>

      {/* Wizard Options */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* AI Wizard Option */}
        <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 group">
          <div className="absolute top-4 right-4">
            <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-semibold px-3 py-1 rounded-full">
              RECOMMENDED
            </div>
          </div>

          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-purple-700 dark:text-purple-400">
              AI Solar Design
            </CardTitle>
            <CardDescription className="text-lg">
              Get a complete solar system design in seconds with our intelligent assistant
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm">Automatic equipment selection based on your requirements</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm">Complete design in under 30 seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm">AI-optimized for performance and cost</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <span className="text-sm">Built-in compliance checking and validation</span>
              </div>
            </div>

            {/* Perfect For */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Perfect For:</h4>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• Quick estimates and planning</li>
                <li>• Users new to solar design</li>
                <li>• Getting optimized starting points</li>
                <li>• Comparing different design approaches</li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link href="/ai-wizard">
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 group-hover:bg-purple-700 transition-colors">
                Start AI Design
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Manual Wizard Option */}
        <Card className="relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 group">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
              <Calculator className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl text-orange-700 dark:text-orange-400">
              Step-by-Step Design
            </CardTitle>
            <CardDescription className="text-lg">
              Full control over every component and system configuration
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-sm">Complete control over equipment selection</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-sm">Detailed technical specifications</span>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-sm">Real-time performance calculations</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-sm">Advanced configuration options</span>
              </div>
            </div>

            {/* Perfect For */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Perfect For:</h4>
              <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1">
                <li>• Professional installers and designers</li>
                <li>• Custom projects with specific requirements</li>
                <li>• Learning solar system design</li>
                <li>• Maximum flexibility and control</li>
              </ul>
            </div>

            {/* CTA Button */}
            <Link href="/test">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 group-hover:bg-orange-700 transition-colors">
                Start Manual Design
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Compare the capabilities of both design approaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Feature</h4>
              <div className="space-y-3 text-sm">
                <div>Design Speed</div>
                <div>Equipment Selection</div>
                <div>Customization Level</div>
                <div>Technical Detail</div>
                <div>Learning Value</div>
                <div>Optimization</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-purple-700 dark:text-purple-400">AI Design</h4>
              <div className="space-y-3 text-sm">
                <div className="text-purple-600 dark:text-purple-400">⚡ Under 30 seconds</div>
                <div className="text-purple-600 dark:text-purple-400">🤖 Automatic</div>
                <div className="text-purple-600 dark:text-purple-400">📊 Basic adjustments</div>
                <div className="text-purple-600 dark:text-purple-400">📈 Standard reports</div>
                <div className="text-purple-600 dark:text-purple-400">🎯 Medium</div>
                <div className="text-purple-600 dark:text-purple-400">⭐ AI-optimized</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-orange-700 dark:text-orange-400">Manual Design</h4>
              <div className="space-y-3 text-sm">
                <div className="text-orange-600 dark:text-orange-400">⏱️ 10-15 minutes</div>
                <div className="text-orange-600 dark:text-orange-400">👤 Full control</div>
                <div className="text-orange-600 dark:text-orange-400">🔧 Complete customization</div>
                <div className="text-orange-600 dark:text-orange-400">📋 Detailed specifications</div>
                <div className="text-orange-600 dark:text-orange-400">🎓 High</div>
                <div className="text-orange-600 dark:text-orange-400">⚙️ User-defined</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Not sure which to choose?
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Start with the AI Design for a quick, optimized solution. You can always switch to the manual wizard for more detailed customization.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/pvpanels">
            <Button variant="outline">
              Browse Equipment First
            </Button>
          </Link>
          <Link href="/ai-wizard">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Try AI Design (Recommended)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}