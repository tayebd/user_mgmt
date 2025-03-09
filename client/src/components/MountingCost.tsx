'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Inputs {
  numberOfPanels: number;
  panelWidth: number;
  panelLength: number;
  groundScrewSpacing: number;
  tiltAngle: number;
  pipeSpan: number;
}

interface Results {
  rails: {
    quantity: number;
    length: number;
    unit: string;
  };
  pipes: {
    shortPipes: number;
    tallPipes: number;
    braceAPipes: number;
    diagonalBraces: number;
    beamSize: number;
  };
  groundScrews: {
    quantity: number;
    spacing: number;
    unit: string;
  };
  midClamps: {
    quantity: number;
  };
  endClamps: {
    quantity: number;
  };
  lFeet: {
    quantity: number;
  };
  railSplices: {
    quantity: number;
  };
}

const MountingCost: React.FC = () => {
  const [inputs, setInputs] = useState<Inputs>({
    numberOfPanels: 4,
    panelWidth: 0,
    panelLength: 0,
    groundScrewSpacing: 96,
    tiltAngle: 30,
    pipeSpan: 0,
  });

  const [results, setResults] = useState<Results | null>(null);

  const calculateBOM = () => {
    const RAIL_LENGTH = 172;
    const MIN_GROUND_SCREWS = 3;
    const PANELS_PER_STRUCTURE = 4;
    // const RAILS_PER_PANEL = 2;
    const BEAM_SIZE = 1.5;

    const totalPanelWidth = inputs.numberOfPanels * inputs.panelWidth;
    const numberOfRails = Math.ceil(totalPanelWidth / RAIL_LENGTH) * 2;
    
    const numberOfStructures = Math.ceil(inputs.numberOfPanels / PANELS_PER_STRUCTURE);
    
    const pipesPerStructure = {
      shortPipe: 1,
      tallPipe: 1,
      braceA: 1,
      braceDiagonal: 2,
    };

    const totalPipes = {
      shortPipes: numberOfStructures * pipesPerStructure.shortPipe,
      tallPipes: numberOfStructures * pipesPerStructure.tallPipe,
      braceAPipes: numberOfStructures * pipesPerStructure.braceA,
      diagonalBraces: numberOfStructures * pipesPerStructure.braceDiagonal,
    };

    const screwsPerRail = Math.max(
      MIN_GROUND_SCREWS,
      Math.ceil(RAIL_LENGTH / inputs.groundScrewSpacing) + 1
    );
    const totalGroundScrews = screwsPerRail * numberOfRails;

    const midClamps = (inputs.numberOfPanels - 1) * 2;
    const endClamps = 4;
    const lFeet = totalGroundScrews;
    const railSplices = Math.max(0, (numberOfRails - 2));

    setResults({
      rails: {
        quantity: numberOfRails,
        length: RAIL_LENGTH,
        unit: 'inches'
      },
      pipes: {
        shortPipes: totalPipes.shortPipes,
        tallPipes: totalPipes.tallPipes,
        braceAPipes: totalPipes.braceAPipes,
        diagonalBraces: totalPipes.diagonalBraces,
        beamSize: BEAM_SIZE
      },
      groundScrews: {
        quantity: totalGroundScrews,
        spacing: inputs.groundScrewSpacing,
        unit: 'inches'
      },
      midClamps: {
        quantity: midClamps
      },
      endClamps: {
        quantity: endClamps
      },
      lFeet: {
        quantity: lFeet
      },
      railSplices: {
        quantity: railSplices
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Solar PV Ground Mount BOM Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Panels
              </label>
              <Input
                type="number"
                name="numberOfPanels"
                value={inputs.numberOfPanels}
                onChange={handleInputChange}
                placeholder="Enter number of panels"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Panel Width (inches)
              </label>
              <Input
                type="number"
                name="panelWidth"
                value={inputs.panelWidth}
                onChange={handleInputChange}
                placeholder="Enter panel width"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Panel Length (inches)
              </label>
              <Input
                type="number"
                name="panelLength"
                value={inputs.panelLength}
                onChange={handleInputChange}
                placeholder="Enter panel length"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tilt Angle (degrees)
              </label>
              <Input
                type="number"
                name="tiltAngle"
                value={inputs.tiltAngle}
                onChange={handleInputChange}
                placeholder="Enter tilt angle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Pipe Span (inches)
              </label>
              <Input
                type="number"
                name="pipeSpan"
                value={inputs.pipeSpan}
                onChange={handleInputChange}
                placeholder="Enter maximum pipe span"
              />
            </div>
          </div>

          <Button 
            onClick={calculateBOM}
            className="w-full"
          >
            Calculate BOM
          </Button>

          {results && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold">Bill of Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="font-medium">Ground Rails</h4>
                  <p>Quantity: {results.rails.quantity}</p>
                  <p>Length: {results.rails.length} inches</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium">Support Structure ({results.pipes.beamSize}&quot; Beams)</h4>
                  <p>Short Pipes: {results.pipes.shortPipes}</p>
                  <p>Tall Pipes: {results.pipes.tallPipes}</p>
                  <p>Brace A: {results.pipes.braceAPipes}</p>
                  <p>Diagonal Braces: {results.pipes.diagonalBraces}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium">Panel Clamps</h4>
                  <p>Mid Clamps: {results.midClamps.quantity}</p>
                  <p>End Clamps: {results.endClamps.quantity}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="font-medium">Additional Hardware</h4>
                  <p>L-Feet: {results.lFeet.quantity}</p>
                  <p>Rail Splices: {results.railSplices.quantity}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MountingCost;
