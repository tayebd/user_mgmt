import { useState, useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StepProps } from './types';
import { getPVPanels } from '@/types/initialData'
import type { PVPanel } from '@/shared/types';

interface ArrayFormData {
  panelId: number;
  quantity: number;
  tilt: number;
  azimuth: number;
  losses: number;
  racking: string;
  bifacial: boolean;
}

export function ArrayStep({ form, pvProject, setPVProject }: StepProps) {
  const [panels, setPanels] = useState<PVPanel[]>([]);
  const [loading, setLoading] = useState(true);

  const [array, setArray] = useState<ArrayFormData>({
    panelId: pvProject?.arrays[0]?.panelId || 0,
    quantity: pvProject?.arrays[0]?.quantity || 0,
    tilt: pvProject?.arrays[0]?.tilt || 30,
    azimuth: pvProject?.arrays[0]?.azimuth || 180,
    losses: pvProject?.arrays[0]?.losses || 14,
    racking: pvProject?.arrays[0]?.racking || 'roof-top',
    bifacial: pvProject?.arrays[0]?.bifacial || true
  });

  const handleInputChange = (field: keyof ArrayFormData, value: string | number | boolean) => {
    setArray(prev => ({
      ...prev,
      [field]: value
    }));
    setPVProject?.(prev => ({
      ...prev,
      arrays: prev.arrays.map((arr, index) => index === 0 ? { ...arr, [field]: value } : arr)
    }));
  };

    const handleAddPanel = (field: keyof ArrayFormData, panelId: number ) => {
      setArray(prev => ({
        ...prev,
        [field]: panelId
      }));
      const selectedPanel = panels.find(p => p.id === panelId);
      if (selectedPanel) {
        console.log('PV panels:', panelId);
        setPVProject?.(prev => ({
          ...prev,
          panels: [...prev.panels, selectedPanel],
          arrays: prev.arrays.length === 0 
            ? [{
                panelId,
                quantity: array.quantity,
                tilt: array.tilt,
                azimuth: array.azimuth,
                losses: array.azimuth,
                racking: array.racking,
                bifacial: array.bifacial
              }]
            : prev.arrays.map((arr, index) => index === 0 ? { ...arr, [field]: panelId } : arr)
        }));
      }
    }


  useEffect(() => {
    const loadPanels = async () => {
      try {
        const data = await getPVPanels();
        setPanels(data);
      } catch (error) {
        console.error('Failed to load PV panels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPanels();
  }, []);

  const selectedPanel = panels.find(p => p.id === array.panelId);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
      <div className="space-y-2">
          <Label>Select PV Panel Model</Label>
          <Select
            onValueChange={(value) =>  handleAddPanel('panelId', Number(value))}
            defaultValue={array.panelId?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a panel model" />
            </SelectTrigger>
            <SelectContent>
              {panels.map(panel => (
                <SelectItem key={panel.id || 0} value={String(panel.id || 0)}>
                  {panel.maker} - {panel.model} ({panel.power}W)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* {errors.arrays?.[0]?.panelId?.message && (
            <p className="text-sm text-red-500">{String(errors.arrays[0].panelId.message)}</p>
          )} */}
        </div>

        <Label htmlFor="quantity">Number of Panels</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          step="1"
              value={array.quantity}
              onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              placeholder="Enter Number of Panels"
              required
        />
      </div>

      <div className="space-y-2">
  
        <Label htmlFor="racking">Racking Type</Label>
        <Select
          onValueChange={(value) =>  handleInputChange('racking', value)}
          value={array.racking }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select racking type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ground">Ground Mount</SelectItem>
            <SelectItem value="roof">Roof Mount</SelectItem>
            <SelectItem value="tracking">Solar Tracking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tilt">Tilt (degrees)</Label>
          <Input
            id="tilt"
            type="number"
            min="0"
            max="90"
              value={array.tilt}
              onChange={(e) => handleInputChange('tilt', Number(e.target.value))}
              placeholder="Enter Tilt"
              required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="azimuth">Azimuth (degrees)</Label>
          <Input
            id="azimuth"
            type="number"
            min="0"
            max="360"
            value={array.azimuth}
            onChange={(e) => handleInputChange('azimuth', Number(e.target.value))}
            placeholder="Enter Azimuth"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="losses" className="flex justify-between">
          <span>System Losses (%)</span>
          <span className="text-sm text-muted-foreground">
            Includes soiling, temperature, wiring, and conversion losses
          </span>
        </Label>
        <Input
          id="losses"
          type="number"
          min="0"
          max="100"
          value={array.losses}
          onChange={(e) => handleInputChange('losses', Number(e.target.value))}
          placeholder="Enter Losses"
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={array.bifacial}
          id="bifacial"
          onCheckedChange={(checked) => handleInputChange('bifacial', checked)}
        />
        <Label>Bifacial Modules</Label>
      </div>
    </div>
  );
}
