let isInitializing = false;
let scriptLoaded = false;

export async function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (scriptLoaded || isInitializing) return;
  
  try {
    isInitializing = true;
    console.log('Loading Google Maps script...');

    const { Loader } = await import('@googlemaps/js-api-loader');
    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    await loader.load();
    scriptLoaded = true;
    console.log('Google Maps loaded successfully');
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Add type definition for the global initMap function
declare global {
  interface Window {
    initMap: () => void;
  }
} 