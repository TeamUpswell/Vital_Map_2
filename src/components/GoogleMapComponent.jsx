'use client';

import { useState, useEffect, useRef } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import pharmacies from './pharmacies';
import healthcareCenters from './healthcareCenters';

// Combine locations
const allLocations = [...pharmacies, ...healthcareCenters];

export default function GoogleMapComponent({ userLocation }) {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.0579, lng: 7.4951 }); // Default to Abuja

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    // If user location is provided, center the map there
    if (userLocation && userLocation.lat && userLocation.lng) {
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation]);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={12}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
{userLocation && (
  <Marker
    position={userLocation}
    icon={{
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: '#4285F4', 
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 8,
    }}
  />
)}

        {/* All healthcare locations */}
        {allLocations.map((location, index) => (
          <Marker
            key={index}
            position={{ lat: location.latitude, lng: location.longitude }}
            title={location.name}
          />
        ))}
      </GoogleMap>
    </div>
  );
}