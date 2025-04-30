'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import CustomSurvey from '@/app/CustomSurvey'; // ✅ Import from app folder
import GoogleMapComponent from '@/components/GoogleMapComponent';

export default function MapPage() {
  const [mapIsInteractive, setMapIsInteractive] = useState(false);
  const [showSurvey, setShowSurvey] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  // Communication between CustomSurvey and parent component
  const handleSurveyComplete = (userData) => {
    setShowSurvey(false);
    if (userData && userData.latitude && userData.longitude) {
      setUserLocation({
        lat: userData.latitude,
        lng: userData.longitude,
      });
    }
    setMapIsInteractive(true);
  };

  return (
    <div className="relative min-h-screen">
      {!mapIsInteractive ? (
        <div className="relative h-screen w-full">
          <div className="absolute inset-0">
            <Image
              src="/abuja-map-desktop.jpg"
              alt="Map of Nigeria centered on Abuja"
              fill
              sizes="100vw"
              quality={80}
              priority
              className="object-cover"
            />
          </div>

          <div className="absolute inset-0 bg-black bg-opacity-20">
            <CustomSurvey
              onComplete={handleSurveyComplete}
              setShowSurvey={setShowSurvey}
              showSurvey={showSurvey}
            />

            {!showSurvey && !mapIsInteractive && (
              <div className="flex items-center justify-center h-full">
                <div className="max-w-md w-full bg-white bg-opacity-90 rounded-lg shadow-lg p-6 text-center mx-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                    Find HPV Vaccines in Nigeria
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 mb-6">
                    View locations offering free HPV vaccines throughout
                    Nigeria.
                  </p>
                  <button
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:bg-blue-700 w-full md:w-auto"
                    onClick={() => setMapIsInteractive(true)}
                  >
                    Load Interactive Map
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <GoogleMapComponent locations={locations} userLocation={userLocation} />
      )}
    </div>
  );
}
