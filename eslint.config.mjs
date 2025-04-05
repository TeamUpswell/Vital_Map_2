'use client';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const center = { lat: 9.0579, lng: 7.4951 }; // Abuja coordinates

export default function Map() {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}
