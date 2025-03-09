import { StepProps } from './types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SolarProject } from '@/types';

const ROOF_MATERIALS = [
  'Asphalt Shingle',
  'Metal',
  'Tile',
  'Slate',
  'EPDM',
  'TPO',
  'PVC'
];

// eslint-disable-next-line no-unused-vars
export function MountingStep({ form, projectData, setSolarProject }: StepProps) {
  const { setValue, watch } = form;
  const mountingType = watch('mountingType');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Mounting Configuration</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Mounting Type</Label>
            <Select
              onValueChange={(value) => setValue('mountingType', value as SolarProject['mountingType'])}
              defaultValue={mountingType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mounting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flat Roof">Flat Roof</SelectItem>
                <SelectItem value="Pitched Roof">Pitched Roof</SelectItem>
                <SelectItem value="Ground Mount">Ground Mount</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(mountingType === 'Flat Roof' || mountingType === 'Pitched Roof') && (
            <div className="space-y-2">
              <Label>Roof Material</Label>
              <Select
                onValueChange={(value) => setValue('roofMaterial', value)}
                defaultValue={watch('roofMaterial')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select roof material" />
                </SelectTrigger>
                <SelectContent>
                  {ROOF_MATERIALS.map(material => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-medium mb-2">Mounting Requirements</h3>
          <ul className="space-y-1 text-sm">
            <li>• Mounting rails: {Math.ceil(watch('pvPanelQuantity') * 2)} pieces</li>
            <li>• Rail clamps: {Math.ceil(watch('pvPanelQuantity') * 4)} pieces</li>
            <li>• Roof attachments: {Math.ceil(watch('pvPanelQuantity') * 2)} pieces</li>
          </ul>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-medium mb-2">Additional Notes</h3>
          <p className="text-sm text-muted-foreground">
            {mountingType === 'Ground Mount' 
              ? 'Ground mounting requires additional soil analysis and foundation work.'
              : 'Roof mounting requires structural assessment of the roof.'}
          </p>
        </Card>
      </div>
    </div>
  );
} 