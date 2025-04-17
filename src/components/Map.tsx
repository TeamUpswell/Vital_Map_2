'use client';

import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindow,
} from '@react-google-maps/api';
import { healthcareCenters } from './healthcareCenters';
import { pharmacies } from './pharmacies'; // Import pharmacies
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Import Supabase client

// Extend the Window interface to include the gtag method
declare global {
  interface Window {
    gtag: (event: string, action: string, params: Record<string, any>) => void;
  }

  // Extend the Navigator interface to include the connection property
  interface Navigator {
    connection?: {
      effectiveType?: string;
    };
    mozConnection?: {
      effectiveType?: string;
    };
    webkitConnection?: {
      effectiveType?: string;
    };
  }
}

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = { lat: 9.0579, lng: 7.4951 }; // Default to Abuja

export default function Map() {
  const [selectedPlace, setSelectedPlace] = useState<null | {
    id: string;
    name: string;
    lga?: string;
    address: string;
    days_of_immunization?: string;
    hours_of_work?: string;
    latitude: number;
    longitude: number;
    type: 'clinic' | 'pharmacy';
  }>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [userData, setUserData] = useState<{
    latitude: number | null;
    longitude: number | null;
    address: string;
    whatsapp_joined: boolean | null;
  }>({
    latitude: null,
    longitude: null,
    address: 'Dynamic Address',
    whatsapp_joined: null,
  });

  const handleOnLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  // Detect low bandwidth using the Network Information API
  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (
      connection &&
      connection.effectiveType &&
      connection.effectiveType.includes('2g')
    ) {
      setIsLowBandwidth(true);
    }

    if (navigator.geolocation) {
      console.log('Attempting to fetch user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location fetched:', { latitude, longitude });
          setUserLocation({ lat: latitude, lng: longitude });
          setUserData((prev) => ({ ...prev, latitude, longitude }));
        },
        (error) => {
          console.error('Error fetching user location:', error.message);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              console.error('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              console.error('The request to get user location timed out.');
              break;
            default:
              console.error('An unknown error occurred.');
          }
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
    }
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (isLowBandwidth) {
    // Static map for low-bandwidth users
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.lat},${userLocation.lng}&zoom=9&size=600x400&maptype=roadmap&markers=color:purple|${userLocation.lat},${userLocation.lng}&key=${apiKey}`;
    return (
      <div
        style={{ width: '100%', height: '100vh', backgroundColor: '#f0f0f0' }}
      >
        <img
          src={staticMapUrl}
          alt="Static map"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} onLoad={handleOnLoad}>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={9}
        >
          {/* Health Clinics */}
          {healthcareCenters.map((center) => (
            <MarkerF
              key={`clinic-${center.id}`}
              position={{ lat: center.latitude, lng: center.longitude }}
              icon={{
                url: '/purp.png',
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => {
                setSelectedPlace({ ...center, type: 'clinic' });
                window.gtag('event', 'map_marker_click', {
                  center_id: center.id,
                  center_name: center.name,
                  type: 'clinic',
                });
              }}
            />
          ))}
          {/* Pharmacies */}
          {pharmacies.map((pharmacy) => (
            <MarkerF
              key={`pharmacy-${pharmacy.id}`}
              position={{ lat: pharmacy.latitude, lng: pharmacy.longitude }}
              icon={{
                url: '/pharma.png',
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => {
                setSelectedPlace({ ...pharmacy, type: 'pharmacy' });
                window.gtag('event', 'map_marker_click', {
                  center_id: pharmacy.id,
                  center_name: pharmacy.name,
                  type: 'pharmacy',
                });
              }}
            />
          ))}

          {/* InfoWindow for both clinics and pharmacies */}
          {selectedPlace && (
            <InfoWindow
              position={{
                lat: selectedPlace.latitude,
                lng: selectedPlace.longitude,
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div style={{ maxWidth: '220px', color: '#000' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {selectedPlace.name}
                </h3>
                <p style={{ marginBottom: '4px' }}>
                  <strong>Address:</strong> {selectedPlace.address}
                </p>
                {selectedPlace.lga && (
                  <p style={{ marginBottom: '4px' }}>
                    <strong>LGA:</strong> {selectedPlace.lga}
                  </p>
                )}
                {/* Show days and hours for clinics */}
                {selectedPlace.type === 'clinic' && selectedPlace.days_of_immunization && (
                  <p style={{ marginBottom: '4px' }}>
                    <strong>Immunization Days:</strong> {selectedPlace.days_of_immunization}
                  </p>
                )}
                {selectedPlace.type === 'clinic' && selectedPlace.hours_of_work && (
                  <p style={{ marginBottom: '4px' }}>
                    <strong>Hours:</strong> {selectedPlace.hours_of_work}
                  </p>
                )}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.latitude},${selectedPlace.longitude}`}
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
