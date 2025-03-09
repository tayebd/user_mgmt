import { useEffect, useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPVPanels } from '@/services/equipment';
import { PVPanel } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line no-unused-vars
export function PVPanelStep({ form, projectData, setSolarProject }: StepProps) {
  const [panels, setPanels] = useState<PVPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedPanelId = watch('selectedPanelId');

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

  const selectedPanel = panels.find(p => p.id === selectedPanelId);

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
            onValueChange={(value) => setValue('selectedPanelId', Number(value), { shouldValidate: true })}
            defaultValue={selectedPanelId.toString()} 
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a panel model" />
            </SelectTrigger>
            <SelectContent>
              {panels.map(panel => (
                <SelectItem key={panel.id} value={panel.id.toString()}>
                  {panel.manufacturer} - {panel.modelNumber} ({panel.power}W)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.selectedPanelId?.message && (
            <p className="text-sm text-red-500">{String(errors.selectedPanelId.message)}</p>
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

      {selectedPanel && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Panels</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register('pvPanelQuantity', { valueAsNumber: true })}
              className={errors.pvPanelQuantity ? 'border-red-500' : ''}
            />
            {errors.pvPanelQuantity?.message && (
              <p className="text-sm text-red-500">{String(errors.pvPanelQuantity.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Power</Label>
              <Input
                type="text"
                value={`${(watch('pvPanelQuantity') || 0) * selectedPanel.power}W`}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="text"
                value={`$${(watch('pvPanelQuantity') || 0) * selectedPanel.price}`}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 