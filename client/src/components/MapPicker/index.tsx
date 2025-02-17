'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
  address: string;
  onAddressChange: (address: string) => void;
}

interface LatLngLike {
  lat: number | (() => number);
  lng: number | (() => number);
}

function getLatLngValues(location: LatLngLike): { lat: number; lng: number } {
  const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
  const lng = typeof location.lng === 'function' ? location.lng() : location.lng;
  return { lat, lng };
}

export function MapPicker({ 
  latitude, 
  longitude, 
  onChange,
  address,
  onAddressChange 
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState(address);
  const { geocoder, isLoaded } = useGoogleMaps();
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Update search query when address prop changes
  useEffect(() => {
    if (address !== searchQuery) {
      setSearchQuery(address);
    }
  }, [address]);

  const updateAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
    if (!geocoder) return;

    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      });

      if (response.results?.[0]) {
        onAddressChange(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  }, [geocoder, onAddressChange]);

  const updateMarkerPosition = useCallback((lat: number, lng: number) => {
    if (markerRef.current && mapInstanceRef.current) {
      const position = { lat, lng };
      markerRef.current.setPosition(position);
      mapInstanceRef.current.panTo(position);
      onChange(lat, lng);
      updateAddressFromCoordinates(lat, lng);
    }
  }, [onChange, updateAddressFromCoordinates]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !geocoder || isSearching) return;

    try {
      setIsSearching(true);
      console.log('Starting geocoding search for:', searchQuery);
      
      const response = await geocoder.geocode({ address: searchQuery });
      console.log('Geocoding response:', response);
      
      if (response.results && response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        console.log('Found location:', { lat, lng });
        updateMarkerPosition(lat, lng);
        mapInstanceRef.current?.setZoom(15);
      } else {
        console.log('No results found for address:', searchQuery);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, geocoder, isSearching, updateMarkerPosition]);

  // Map initialization effect
  useEffect(() => {
    let isMounted = true;
    let listeners: google.maps.MapsEventListener[] = [];

    const initMap = async () => {
      if (!mapRef.current || !isMounted || !isLoaded || !window.google?.maps) return;

      try {
        // Create the map instance
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: latitude || 0, lng: longitude || 0 },
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });

        // Create standard marker
        const markerInstance = new google.maps.Marker({
          position: { lat: latitude || 0, lng: longitude || 0 },
          map: mapInstance,
          draggable: true,
          title: 'Drag me!'
        });

        mapInstanceRef.current = mapInstance;
        markerRef.current = markerInstance;
        setIsLoading(false);

        // Add event listeners
        listeners = [
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition();
            if (position) {
              onChange(position.lat(), position.lng());
              updateAddressFromCoordinates(position.lat(), position.lng());
            }
          }),
          mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
            const position = e.latLng;
            if (position) {
              markerInstance.setPosition(position);
              onChange(position.lat(), position.lng());
              updateAddressFromCoordinates(position.lat(), position.lng());
            }
          })
        ];

      } catch (error) {
        console.error('Map initialization error:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      // Clean up listeners
      listeners.forEach(listener => listener.remove());
      // Clean up map and marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, onChange, isLoaded, updateAddressFromCoordinates]);

  if (loadError) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter project address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            disabled
          />
          <Button
            type="button"
            variant="secondary"
            disabled
          >
            Search
          </Button>
        </div>
        <div className="w-full h-[400px] rounded-md border bg-red-50 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Failed to load Google Maps</p>
            <p className="text-sm text-red-500">{loadError}</p>
            <p className="text-xs text-gray-500 mt-2">
              Please check your API key and ensure it's properly configured
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter project address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch()}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={handleSearch}
          type="button"
          variant="secondary"
          disabled={isLoading || isSearching || !searchQuery.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>
      <div 
        ref={mapRef} 
        className="w-full h-[400px] rounded-md border"
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      />
      {isLoading && (
        <div className="w-full h-[400px] bg-gray-100 rounded-md animate-pulse flex items-center justify-center">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
    </div>
  );
} 