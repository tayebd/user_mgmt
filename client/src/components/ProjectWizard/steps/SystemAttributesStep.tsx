import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SolarProject } from '@/types';
import { StepProps } from './types';

export function SystemAttributesStep({ form, projectData, setSolarProject }: StepProps) {
  const { register, setValue, watch } = form;
  const bifacial = watch('bifacial');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="dcSystemSize">DC System Size (kW)</Label>
        <Input
          id="dcSystemSize"
          type="number"
          step="0.1"
          {...register('dcSystemSize', { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="arrayType">Array Type</Label>
        <Select
          onValueChange={(value) => setValue('arrayType', value as SolarProject['arrayType'])}
          defaultValue={watch('arrayType')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select array type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ground">Ground</SelectItem>
            <SelectItem value="Roof Mount">Roof Mount</SelectItem>
            <SelectItem value="Tracking">Tracking</SelectItem>
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
            {...register('tilt', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="azimuth">Azimuth (degrees)</Label>
          <Input
            id="azimuth"
            type="number"
            min="0"
            max="360"
            {...register('azimuth', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={bifacial}
          onCheckedChange={(checked) => setValue('bifacial', checked)}
        />
        <Label>Bifacial Modules</Label>
      </div>
    </div>
  );
}