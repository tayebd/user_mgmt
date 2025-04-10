import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { StepProps } from './types';

type MountingType = 'roof' | 'ground' | 'carport' | 'floating';

import { Input } from '@/components/ui/input';
import { getMountingHardware } from '@/types/initialData'
import type { MountingHardware } from '@/shared/types';
import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line no-unused-vars
export function MountingStep({ form, pvProject, setPVProject }: StepProps) {
  const [mountingHardware, setMountingHardware] = useState<MountingHardware[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, setValue, watch, formState: { errors } } = form;
  const formValues = watch();
  const selectedMountingHardwareModel = formValues.mountingHardware?.[0]?.model;
  const numberMountingHardware = 1;


  useEffect(() => {
    const loadMountingHardware = async () => {
      try {
        const data = await getMountingHardware();
        setMountingHardware(data);
      } catch (error) {
        console.error('Failed to load mountingHardware:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMountingHardware();
  }, []);

  const [rackingType, setRackingType] = useState<MountingType>('roof');


  const selectedMountingHardware = mountingHardware.find(i => i.model === selectedMountingHardwareModel);

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
          <Label>Select Mounting Hardware </Label>
          <Select
            onValueChange={(value) => {
              const mntHw = mountingHardware.find(i => i.id === Number(value));
              if (mntHw) {
                setPVProject?.(prev => ({
                  ...prev,
                  mountingHardware: [mntHw]
                }));
                setValue('mountingHardware.0', {
                  ...mntHw,
                }, { shouldValidate: true });
              }
            }}
            defaultValue={selectedMountingHardware?.id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an inverter model" />
            </SelectTrigger>
            <SelectContent>
              {mountingHardware.map(mntHw => (
                <SelectItem key={mntHw.id} value={String(mntHw.id)}>
                  {mntHw.maker} - {mntHw.model} 
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* {errors.mountingHardware?.[0]?.id?.message && (
            <p className="text-sm text-red-500">{String(errors.mountingHardware[0].id.message)}</p> */}
          {/* )} */}
        </div>

        {selectedMountingHardware && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Mounting Hardware Specifications</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Power Output:</span>
                <span className="ml-2">{selectedMountingHardware?.description}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency:</span>
                <span className="ml-2">{selectedMountingHardware.material}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Load:</span>
                <span className="ml-2">
                  {selectedMountingHardware.maxLoad}V DC
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {selectedMountingHardware && (
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="text"
                value={`$${(numberMountingHardware || 0) * (selectedMountingHardware.price || 0)}`}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
