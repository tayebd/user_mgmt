import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProjectData } from '@/types/project';
import { MapPicker } from '@/components/MapPicker';
import { StepProps } from './types';
import { Card } from '@/components/ui/card';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';

export function LocationStep({ form, projectData, setProjectData }: StepProps) {
  console.log('LocationStep rendering');

  const { register, setValue, watch, formState: { errors } } = form;
  const coordinates = watch('coordinates');
  const address = watch('address');
  const { geocoder, isLoaded } = useGoogleMaps();
  const [isSearching, setIsSearching] = useState(false);

  // Add default center coordinates for the map
  const defaultCenter = {
    lat: coordinates?.lat || 40.7128,  // Default to New York City
    lng: coordinates?.lng || -74.0060
  };

  console.log('LocationStep state:', {
    coordinates,
    address,
    isLoaded,
    hasGeocoder: !!geocoder,
    defaultCenter
  });

  // Handle initial coordinates setup
  useEffect(() => {
    if (!coordinates && isLoaded) {
      setValue('coordinates', defaultCenter);
    }
  }, [isLoaded, coordinates, setValue]);

  const handleMapChange = async (lat: number, lng: number) => {
    // Validate coordinates
    if (!isFinite(lat) || !isFinite(lng)) {
      console.error('Invalid coordinates:', { lat, lng });
      return;
    }

    setIsSearching(true);
    
    try {
      setValue('coordinates', { lat, lng }, { shouldValidate: true });
      
      if (geocoder && isLoaded) {
        const response = await geocoder.geocode({
          location: { lat, lng }
        });
        
        if (response.results?.[0]) {
          const result = response.results[0];
          setValue('address', result.formatted_address, { shouldValidate: true });
        } else {
          setValue('address', 'Address not found', { shouldValidate: true });
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setValue('address', 'Error fetching address', { shouldValidate: true });
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address changes and reverse geocoding
  const handleAddressChange = async (newAddress: string) => {
    if (!newAddress || !geocoder || !isLoaded) return;

    setIsSearching(true);
    
    try {
      const response = await geocoder.geocode({ address: newAddress });
      
      if (response.results?.[0]?.geometry?.location) {
        const { lat, lng } = response.results[0].geometry.location;
        setValue('coordinates', { 
          lat: typeof lat === 'function' ? lat() : lat,
          lng: typeof lng === 'function' ? lng() : lng
        }, { shouldValidate: true });
        setValue('address', response.results[0].formatted_address, { shouldValidate: true });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!address.trim() || !geocoder || !isLoaded || isSearching) return;

    setIsSearching(true);
    try {
      const response = await geocoder.geocode({ address });
      if (response.results?.[0]?.geometry?.location) {
        const { lat, lng } = response.results[0].geometry.location;
        setValue('coordinates', { 
          lat: typeof lat === 'function' ? lat() : lat,
          lng: typeof lng === 'function' ? lng() : lng
        }, { shouldValidate: true });
        setValue('address', response.results[0].formatted_address, { shouldValidate: true });
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
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      <div className="relative">
        {isLoaded ? (
          <MapPicker
            latitude={coordinates?.lat ?? defaultCenter.lat}
            longitude={coordinates?.lng ?? defaultCenter.lng}
            onChange={handleMapChange}
            address={address || ''}
            onAddressChange={(newAddress) => setValue('address', newAddress)}
          />
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-md">
            <p className="text-gray-500">Loading Google Maps...</p>
          </div>
        )}
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Location Details</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="text"
                value={coordinates?.lat?.toFixed(6) || defaultCenter.lat.toFixed(6)}
                readOnly
                className={errors.coordinates?.lat ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="text"
                value={coordinates?.lng?.toFixed(6) || defaultCenter.lng.toFixed(6)}
                readOnly
                className={errors.coordinates?.lng ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Formatted Address</Label>
            <Input
              type="text"
              value={address || ''}
              readOnly
              className="bg-gray-50"
            />
            {isSearching && <p className="text-sm text-gray-500">Searching...</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Decimal Degrees</Label>
              <Input
                type="text"
                value={coordinates?.lat ? 
                  `${Math.abs(coordinates.lat)}° ${coordinates.lat >= 0 ? 'N' : 'S'}` : 
                  `${Math.abs(defaultCenter.lat)}° N`}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Decimal Degrees</Label>
              <Input
                type="text"
                value={coordinates?.lng ? 
                  `${Math.abs(coordinates.lng)}° ${coordinates.lng >= 0 ? 'E' : 'W'}` : 
                  `${Math.abs(defaultCenter.lng)}° E`}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>DMS Format</Label>
              <Input
                type="text"
                value={coordinates?.lat ? 
                  convertToDMS(coordinates.lat, 'lat') : 
                  convertToDMS(defaultCenter.lat, 'lat')}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label>DMS Format</Label>
              <Input
                type="text"
                value={coordinates?.lng ? 
                  convertToDMS(coordinates.lng, 'lng') : 
                  convertToDMS(defaultCenter.lng, 'lng')}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function convertToDMS(decimal: number, type: 'lat' | 'lng'): string {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  const direction = type === 'lat'
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W';

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}
