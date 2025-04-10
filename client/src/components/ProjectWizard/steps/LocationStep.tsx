import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SiteFormData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
}

export function LocationStep({ form, pvProject, setPVProject }: StepProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [site, setSite] = useState<SiteFormData>({
    name: pvProject?.name || '',
    address: pvProject?.address || '',
    latitude: pvProject?.latitude || 33.893201,
    longitude: pvProject?.longitude || -84.253871,
    timezone: pvProject?.timezone || '',
    elevation: pvProject?.elevation || 320,
  });
  const [projectName, setProjectName] = useState(pvProject?.name || '');

  const handleInputChange = (field: keyof SiteFormData, value: string | number) => {
    setSite(prev => ({
      ...prev,
      [field]: value
    }));
    setPVProject?.(prev => ({
      ...prev,
        [field]: value,
    }));
  };

  const handleAddressSearch = async () => {
    console.log('Geocoding data:', site.address, isSearching);

    if (!site.address.trim() || isSearching) return;

    setIsSearching(true);
    console.log('Geocoding data:', site.address, isSearching);

    try {
      // Using the Geocoding API directly
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(site.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();
      console.log('Geocoding data:', site.address, isSearching, data);

      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        handleInputChange('latitude', lat)
        handleInputChange('longitude', lng)
        // setValue('address', data.results[0].formatted_address, { shouldValidate: true });
        console.log('Geocoding data:', lat, lng);

        // Update PVProject with new latitude and longitude
        if (setPVProject) {
          setPVProject(prev => ({
            ...prev,
              latitude: lat,
              longitude: lng,
              address: site.address.trim()

          }));
        }
    }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={site.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter site name"
              required
            />
          </div>

        <Label htmlFor="address">Project Address</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="Enter project address"
            value={site.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value) }
            onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleAddressSearch()}
            // className={`flex-1 ${errors?.site?.address ? 'border-red-500' : ''}`}
            disabled={isSearching}
          />
          <Button
            onClick={handleAddressSearch}
            type="button"
            variant="secondary"
            disabled={isSearching || !site.address?.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {/* {errors?.site?.address?.message && (
          <p className="text-sm text-red-500">{String(errors.site.address.message)}</p>
        )} */}
      </div>

      {/* {watch('site')?.latitude && ( */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="text"
              value={site?.latitude?.toFixed(6) || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="text"
              value={site?.longitude?.toFixed(6) || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>
      {/* )} */}
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={site.timezone}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="elevation">Elevation (m)</Label>
              <Input
                id="elevation"
                type="number"
                step="0.1"
                value={site.elevation}
                onChange={(e) => handleInputChange('elevation', Number(e.target.value))}
                required
              />
            </div>
            {/* <div>
              <Label htmlFor="albedo">Albedo</Label>
              <Input
                id="albedo"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={site.albedo}
                onChange={(e) => handleInputChange('albedo', Number(e.target.value))}
                required
              />
            </div> */}
          </div>
        </div>
  );
}
