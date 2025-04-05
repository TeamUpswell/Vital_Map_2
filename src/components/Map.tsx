'use client';

import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindow,
} from '@react-google-maps/api';
import { healthcareCenters } from './healthcareCenters';
import { useState, useCallback, useEffect } from 'react';

// Extend the Window interface to include the gtag method
declare global {
  interface Window {
    gtag: (event: string, action: string, params: Record<string, any>) => void;
  }
}

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = { lat: 9.0579, lng: 7.4951 }; // Default to Abuja

export default function Map() {
  const [selectedCenter, setSelectedCenter] = useState<null | {
    id: string;
    name: string;
    lga: string;
    address: string;
    days_of_immunization: string;
    hours_of_work: string;
    latitude: number;
    longitude: number;
  }>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(defaultCenter);

  const handleOnLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Fetch user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error fetching user location:', error);
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <LoadScript googleMapsApiKey={apiKey} onLoad={handleOnLoad}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={9}
        >
          {healthcareCenters.map((center) => (
            <MarkerF
              key={center.id}
              position={{ lat: center.latitude, lng: center.longitude }}
              icon={{
                url: '/purp.png',
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => {
                setSelectedCenter(center);
                // Track map marker clicks
                window.gtag('event', 'map_marker_click', {
                  center_id: center.id,
                  center_name: center.name,
                });
              }}
            />
          ))}

          {selectedCenter && (
            <InfoWindow
              position={{
                lat: selectedCenter.latitude,
                lng: selectedCenter.longitude,
              }}
              onCloseClick={() => setSelectedCenter(null)}
            >
              <div style={{ maxWidth: '200px', color: '#000' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedCenter.name}
                </h3>
                <p style={{ marginBottom: '4px' }}>
                  <strong>Address:</strong> {selectedCenter.address}
                </p>
                <p style={{ marginBottom: '4px' }}>
                  <strong>LGA:</strong> {selectedCenter.lga}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedCenter.latitude},${selectedCenter.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007BFF', textDecoration: 'underline' }}
                >
                  View on Google Maps
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </LoadScript>
  );
}
