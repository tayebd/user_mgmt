'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GoogleMapsContextType {
  geocoder: google.maps.Geocoder | null;
  setGeocoder: (geocoder: google.maps.Geocoder) => void;
  isLoaded: boolean;
  setIsLoaded: (loaded: boolean) => void;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

// Keep track of script loading globally
let isScriptLoading = false;
let scriptElement: HTMLScriptElement | null = null;

export function GoogleMapsProvider({ children }: { children: ReactNode }) {
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  useEffect(() => {
    const initGoogleMaps = async () => {
      if (isInitializing || isLoaded || window.google?.maps) {
        return;
      }

      try {
        setIsInitializing(true);
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) throw new Error('Google Maps API key is missing');

        // If script is already loading, wait for it
        if (isScriptLoading && scriptElement) {
          await new Promise<void>((resolve, reject) => {
            scriptElement!.addEventListener('load', () => resolve());
            scriptElement!.addEventListener('error', () => reject());
          });
        } 
        // If script needs to be loaded
        else if (!window.google?.maps) {
          isScriptLoading = true;
          scriptElement = document.createElement('script');
          scriptElement.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
          scriptElement.async = true;
          scriptElement.defer = true;

          await new Promise<void>((resolve, reject) => {
            scriptElement!.onload = () => resolve();
            scriptElement!.onerror = () => reject();
            document.head.appendChild(scriptElement!);
          });
        }

        // Initialize services once script is loaded
        if (window.google?.maps) {
          setGeocoder(new google.maps.Geocoder());
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
      } finally {
        setIsInitializing(false);
        isScriptLoading = false;
      }
    };

    initGoogleMaps();

    return () => {
      // Cleanup if component unmounts during loading
      if (isScriptLoading && scriptElement) {
        scriptElement.remove();
        scriptElement = null;
        isScriptLoading = false;
      }
    };
  }, [isInitializing, isLoaded]);

  return (
    <GoogleMapsContext.Provider value={{ geocoder, setGeocoder, isLoaded, setIsLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
} 