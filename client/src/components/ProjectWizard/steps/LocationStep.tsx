import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StepProps } from './types';

export function LocationStep({ form }: StepProps) {
  const { setValue, watch, formState: { errors } } = form;
  const address = watch('address');
  const [isSearching, setIsSearching] = useState(false);

  const handleAddressSearch = async () => {
    if (!address.trim() || isSearching) return;

    setIsSearching(true);
    try {
      // Using the Geocoding API directly
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      console.error('Geocoding error:', response);

      const data = await response.json();
      
      if (data.results?.[0]?.geometry?.location) {
        const { lat, lng } = data.results[0].geometry.location;
        setValue('coordinates', { lat, lng }, { shouldValidate: true });
        setValue('address', data.results[0].formatted_address, { shouldValidate: true });
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
        <Label htmlFor="address">Project Address</Label>
        <div className="flex gap-2">
          <Input
            id="address"
            placeholder="Enter project address"
            value={address || ''}
            onChange={(e) => setValue('address', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleAddressSearch()}
            className={`flex-1 ${errors.address ? 'border-red-500' : ''}`}
            disabled={isSearching}
          />
          <Button
            onClick={handleAddressSearch}
            type="button"
            variant="secondary"
            disabled={isSearching || !address?.trim()}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        {errors.address?.message && (
          <p className="text-sm text-red-500">{String(errors.address.message)}</p>
        )}
      </div>

      {watch('coordinates') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Latitude</Label>
            <Input
              type="text"
              value={watch('coordinates.lat')?.toFixed(6) || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label>Longitude</Label>
            <Input
              type="text"
              value={watch('coordinates.lng')?.toFixed(6) || ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}