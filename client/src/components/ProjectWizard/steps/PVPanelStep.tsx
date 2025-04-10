import { useEffect, useState } from 'react';
import { StepProps } from './types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPVPanels } from '@/types/initialData'

import type { PVPanel } from '@/shared/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line no-unused-vars
export function PVPanelStep({ form, pvProject, setPVProject }: StepProps) {
  const [panels, setPanels] = useState<PVPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, setValue, watch, formState: { errors } } = form;
  const panelId = watch('arrays.0.panelId') as number | undefined;

  useEffect(() => {
    if (panelId) {
      const selectedPanel = panels.find(p => p.id === panelId);
      if (selectedPanel) {
        setPVProject?.(prev => ({
          ...prev,
          arrays: [
            ...prev.arrays,
            { panelId, quantity: 1, tilt: 0, azimuth: 0, losses: 14, racking: 'roof' }
          ],
          panels: [...prev.panels, selectedPanel]
        }));
      }
    }
  }, [panelId, panels, setPVProject]);

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

  const selectedPanel = panels.find(p => p.id === panelId);

  if (loading) {
    return <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-12" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select PV Panel Model</Label>
          <Select
            onValueChange={(value) => setValue('arrays.0.panelId', Number(value), { shouldValidate: true })}
            defaultValue={panelId?.toString()}
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
          {errors.arrays?.[0]?.panelId?.message && (
            <p className="text-sm text-red-500">{String(errors.arrays[0].panelId.message)}</p>
          )}
        </div>

        {selectedPanel && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Panel Specifications</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Power Output:</span>
                <span className="ml-2">{selectedPanel.power}W</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="ml-2">
                  {selectedPanel.length} × {selectedPanel.width} × {selectedPanel.height}mm
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Weight:</span>
                <span className="ml-2">{selectedPanel.weight}kg</span>
              </div>
              <div>
                <span className="text-muted-foreground">Warranty:</span>
                <span className="ml-2">{selectedPanel.productWarranty} years</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2">${selectedPanel.price}</span>
              </div>
            </div>
          </Card>
        )}
      </div>


    </div>
  );
}
