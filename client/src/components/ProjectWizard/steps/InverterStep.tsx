import { useEffect, useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInverters } from '@/types/initialData'
import type { Inverter } from '@/shared/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// eslint-disable-next-line no-unused-vars
export function InverterStep({ form, pvProject, setPVProject }: StepProps) {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [loading, setLoading] = useState(true);
  const { register, setValue, watch, formState: { errors } } = form;
  const formValues = watch();
  const selectedInverterModel = formValues.inverters?.[0]?.model;
  const numberInverters = formValues.numberInverters || 1;


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

  const selectedInverter = inverters.find(i => i.model === selectedInverterModel);

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
            onValueChange={(value) => {
              const inverter = inverters.find(i => i.id === Number(value));
              if (inverter) {
                setPVProject?.(prev => ({
                  ...prev,
                  inverters: [inverter]
                }));
                setValue('inverters.0', {
                  ...inverter,
                }, { shouldValidate: true });
              }
            }}
            defaultValue={selectedInverter?.id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an inverter model" />
            </SelectTrigger>
            <SelectContent>
              {inverters.map(inverter => (
                <SelectItem key={inverter.id} value={String(inverter.id)}>
                  {inverter.maker} - {inverter.model} ({(inverter.maxOutputPower || 0)/1000}kW)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* {errors.inverters?.[0]?.id?.message && (
            <p className="text-sm text-red-500">{String(errors.inverters[0].id.message)}</p>
          )} */}
        </div>

        {selectedInverter && (
          <Card className="p-4">
            <h3 className="font-medium mb-2">Inverter Specifications</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Power Output:</span>
                <span className="ml-2">{selectedInverter.maxOutputPower/1000}kW</span>
              </div>
              <div>
                <span className="text-muted-foreground">Efficiency:</span>
                <span className="ml-2">{selectedInverter.efficiency}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Input Voltage:</span>
                <span className="ml-2">
                  {selectedInverter.minInputVoltage}-{selectedInverter.maxInputVoltage}V DC
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Output Voltage:</span>
                <span className="ml-2">{selectedInverter.outputVoltage}V AC</span>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2">${selectedInverter.price || 'N/A'}</span>
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
              {...register('numberInverters', { valueAsNumber: true })}
              className={errors.numberInverters ? 'border-red-500' : ''}
              value={pvProject.numberInverters || ''}
              onChange={(e) => setPVProject?.(prev => ({
                ...prev,
                numberInverters: Number(e.target.value)
              }))}
            />
            {errors.numberInverters?.message && (
              <p className="text-sm text-red-500">{String(errors.numberInverters.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Power</Label>
              <Input
                type="text"
                value={`${((numberInverters || 0) * (selectedInverter.maxOutputPower || 0)/1000).toFixed(1)}kW`}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <Input
                type="text"
                value={`$${(numberInverters || 0) * (selectedInverter.price || 0)}`}
                readOnly
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
