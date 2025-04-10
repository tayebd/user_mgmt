import { useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';

export function MiscEquipmentStep({ form, pvProject, setPVProject }: StepProps) {
  const { register, setValue, watch, formState: { errors } } = form;
  const protectionDevices = watch('protectionDevices') || [];

  const addProtectionDevice = () => {
    const newDevices = [
      ...protectionDevices,
      { id: protectionDevices.length, type: '', maker: '', refType: '', circuitType: '', ratedCurrent: 0 } // Removed quantity
    ];
    setValue('protectionDevices', newDevices);
    setPVProject?.(prev => ({
      ...prev,
      protectionDevices: newDevices
    }));
  };

  const removeProtectionDevice = (index: number) => {
    const newDevices = protectionDevices.filter((_, i) => i !== index);
    setValue('protectionDevices', newDevices);
    setPVProject?.(prev => ({
      ...prev,
      protectionDevices: newDevices
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Protection Devices</h3>
          <Button onClick={addProtectionDevice} type="button" variant="outline">
            Add Device
          </Button>
        </div>

        {protectionDevices.map((device, index) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label>Device Type</Label>
                  <Select
                    onValueChange={(value) => {
                      const updatedDevices = [...protectionDevices];
                      updatedDevices[index] = { ...updatedDevices[index], type: value };
                      setValue('protectionDevices', updatedDevices);
                    }}
                    defaultValue={device.type}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circuit-breaker">Circuit Breaker</SelectItem>
                      <SelectItem value="fuse">Fuse</SelectItem>
                      <SelectItem value="disconnect-switch">Disconnect Switch</SelectItem>
                      <SelectItem value="surge-protector">Surge Protector</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors?.protectionDevices?.[index]?.type && (
                    <p className="text-sm text-red-500">{String(errors?.protectionDevices?.[index]?.type)}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rating (A)</Label>
                    <Input
                      type="number"
                      min="0"
                      {...register(`protectionDevices.${index}.ratedCurrent`, { 
                        valueAsNumber: true,
                        required: 'Rating is required'
                      })}
                    />
                    {errors?.protectionDevices?.[index]?.ratedCurrent && ( 
                      <p className="text-sm text-red-500">{String(errors?.protectionDevices?.[index]?.ratedCurrent?.message)}</p> // Access message property
                    )}
                  </div>
                  {/* Removed Quantity Input Section */}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => removeProtectionDevice(index)}
                className="ml-4"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
