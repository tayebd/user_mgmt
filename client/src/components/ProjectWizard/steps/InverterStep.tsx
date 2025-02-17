import { useEffect, useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInverters } from '@/services/equipment';
import { Inverter } from '@/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function InverterStep({ form, projectData, setProjectData }: StepProps) {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, setValue, watch, formState: { errors } } = form;
  const selectedInverterId = watch('selectedInverterId');

  useEffect(() => {
    const loadInverters = async () => {
      try {
        const data = await getInverters();
        setInverters(data);
      } catch (error) {
        console.error('Failed to load inverters:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInverters();
  }, []);

  const selectedInverter = inverters.find(i => i.id === selectedInverterId);

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
          <Label>Select Inverter Model</Label>
          <Select
            onValueChange={(value) => setValue('selectedInverterId', value, { shouldValidate: true })}
            defaultValue={selectedInverterId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an inverter model" />
            </SelectTrigger>
            <SelectContent>
              {inverters.map(inverter => (
                <SelectItem key={inverter.id} value={inverter.id}>
                  {inverter.manufacturer} - {inverter.modelNumber} ({inverter.power/1000}kW)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.selectedInverterId && (
            <p className="text-sm text-red-500">{errors.selectedInverterId.message}</p>
          )}
        </div>

        {selectedInverter && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Inverter Specifications</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Power Output:</span>
                <span className="ml-2">{selectedInverter.power/1000}kW</span>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency:</span>
                <span className="ml-2">{selectedInverter.efficiency}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Input Voltage:</span>
                <span className="ml-2">
                  {selectedInverter.inputVoltage.min}-{selectedInverter.inputVoltage.max}V DC
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Output Voltage:</span>
                <span className="ml-2">{selectedInverter.outputVoltage}V AC</span>
              </div>
              <div>
                <span className="text-muted-foreground">Phases:</span>
                <span className="ml-2">{selectedInverter.phases}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Warranty:</span>
                <span className="ml-2">{selectedInverter.warranty} years</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2">${selectedInverter.price}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {selectedInverter && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Number of Inverters</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register('inverterQuantity', { valueAsNumber: true })}
              className={errors.inverterQuantity ? 'border-red-500' : ''}
            />
            {errors.inverterQuantity && (
              <p className="text-sm text-red-500">{errors.inverterQuantity.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Power</Label>
              <Input
                type="text"
                value={`${((watch('inverterQuantity') || 0) * selectedInverter.power/1000).toFixed(1)}kW`}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="text"
                value={`$${(watch('inverterQuantity') || 0) * selectedInverter.price}`}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 