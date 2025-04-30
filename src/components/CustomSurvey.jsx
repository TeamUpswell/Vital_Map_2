'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

// At the top of your file, add both link types
const WHATSAPP_GROUP_LINK = 'https://chat.whatsapp.com/EQxwtK6FrIZ6fNx9LnH7uh';
const WHATSAPP_SHARE_LINK =
  'https://api.whatsapp.com/send?text=Protect%20your%20daughter%20from%20cervical%20cancer!%20Use%20this%20map%20to%20find%20a%20free%20HPV%20vaccine.%20Or%2C%20if%20you%20have%20questions%2C%20get%20them%20answered%20by%20a%20local%20pharmacist%20over%20WhatsApp.%20Check%20it%20out%3A%20https%3A%2F%2Fvital-map.vercel.app%2F';

export default function CustomSurvey() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showSurvey, setShowSurvey] = useState(true);

  // Add a sessionId state to track this specific session
  const [sessionId, setSessionId] = useState('');

  // Use plain JavaScript for userData without TypeScript annotations
  const [userData, setUserData] = useState({
    latitude: null,
    longitude: null,
    address: 'Dynamic Address',
    whatsapp_joined: null,
  });

  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the survey is already submitted

  // Add before requesting location permission
  const [showLocationExplanation, setShowLocationExplanation] = useState(false);

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          // Also try to get address with reverse geocoding if needed
        },
        (error) => {
          console.log('Geolocation error:', error);
        },
        {
          enableHighAccuracy: false, // Set to false to reduce battery usage
          timeout: 10000, // 10 seconds timeout
          maximumAge: 600000, // Cache position for 10 minutes
        }
      );
    }
  };

  // Use state to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  // Initialize session ID on mount
  useEffect(() => {
    // Create a session ID if we don't have one
    const storedSessionId = localStorage.getItem('surveySessionId');
    if (!storedSessionId) {
      // Generate a random string
      const newId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('surveySessionId', newId);
      setSessionId(newId);
    } else {
      setSessionId(storedSessionId);
    }

    setIsClient(true);
  }, []);

  const handleAnswer = (key, value) => {
    if (isSubmitted) return; // Prevent duplicate submissions

    // Track question clicks - only on client side
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'survey_question_click', {
        question: key,
        answer: value,
      });
    }

    try {
      console.log(`Setting ${key} to ${value}`);
      const updatedAnswers = { ...answers, [key]: value };
      setAnswers(updatedAnswers);

      if (key === 'cares_for_girl' && value === false) {
        console.log("Setting step to 'ineligible'");
        setStep('ineligible');
        // Submit survey data for "No" caregivers
        submitSurvey(updatedAnswers);
      } else if (key === 'received_hpv_dose' && value === true) {
        console.log("Setting step to 'congratulations'");
        setStep('congratulations');
        // Submit survey data for those with prior vaccination
        submitSurvey(updatedAnswers);
      } else if (key === 'ready_for_vaccine') {
        console.log("Setting step to 'complete'");
        setStep('complete');
        submitSurvey(updatedAnswers); // Submit the survey when complete
      } else {
        console.log(`Incrementing step from ${step} to ${step + 1}`);
        setStep(step + 1);
      }
    } catch (error) {
      console.error('Error in handleAnswer:', error);
    }
  };

  async function submitSurvey(finalAnswers) {
    if (isSubmitted) {
      console.log('Preventing duplicate submission - already submitted');
      return; // Prevent duplicate submissions
    }

    try {
      // Set submitted state immediately to prevent double clicks
      setIsSubmitted(true);

      // Create a payload that matches your database columns exactly
      const payload = {
        // id - omitted because it's auto-generated
        // created_at - omitted because it's auto-generated

        // Survey answers
        cares_for_girl: finalAnswers.cares_for_girl || null,
        received_hpv_dose: finalAnswers.received_hpv_dose || null,
        ready_for_vaccine: finalAnswers.ready_for_vaccine || null,
        whatsapp_joined:
          finalAnswers.whatsapp_joined || userData.whatsapp_joined || null,

        // Location data
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
        address: userData.address || null,

        // Session tracking
        session_id: sessionId || null,
      };

      console.log('Data being submitted:', payload);

      const { data, error } = await supabase
        .from('survey_responses')
        .insert([payload]);

      if (error) {
        console.error('Submission error details:', JSON.stringify(error));
        // Re-enable submissions on error
        setIsSubmitted(false);
      } else {
        console.log('Submission successful!', data);
        // Already set isSubmitted to true above
      }
    } catch (e) {
      console.error('Unexpected error during submission:', e);
      // Re-enable submissions on error
      setIsSubmitted(false);
    }
  }

  const handleWhatsAppClick = () => {
    if (isSubmitted) {
      console.log(
        'WhatsApp click - survey already submitted, not submitting again'
      );
      return;
    }

    // Update userData directly to ensure it's included in the submission
    setUserData((prev) => ({ ...prev, whatsapp_joined: true }));

    // Also update answers state for consistency
    const updatedAnswers = { ...answers, whatsapp_joined: true };
    setAnswers(updatedAnswers);

    // Submit the combined data with only the fields that exist in your database
    submitSurvey(updatedAnswers);

    // Track the WhatsApp click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'Clicked WhatsApp Link',
      });
    }

    // Log the action
    console.log('WhatsApp link clicked - whatsapp_joined set to true');
  };

  const buttonClasses =
    'w-full py-3 rounded-full text-lg font-bold text-white transition duration-200 ease-in-out shadow-sm';

  // Debug what step we're on - only on client side
  if (typeof window !== 'undefined') {
    console.log(`Current step value: "${step}", Type: ${typeof step}`);
    console.log(
      `Is step equal to 'congratulations'? ${step === 'congratulations'}`
    );
  }

  return (
    <>
      {isClient && showSurvey && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
          <div className="absolute inset-0 bg-black opacity-25"></div>

          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-6 text-center z-[300]">
            {step === 1 && ( // Show the survey message only on the first question
              <p className="text-lg font-normal text-gray-900 mb-4">
                We can help you find a free HPV vaccine to protect your daughter
                against cervical cancer!
              </p>
            )}

            {step === 1 && (
              <>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  Do you care for a girl who is age 9 or older?
                </p>
                <button
                  onClick={() => handleAnswer('cares_for_girl', true)}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('cares_for_girl', false)}
                  className={`${buttonClasses} mt-3 bg-gray-500 hover:bg-gray-600`}
                >
                  No
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-lg font-normal text-gray-900 mb-4">
                  Good news! She is eligible for the free HPV vaccine.
                </p>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  Has she received an HPV vaccine dose already?
                </p>
                {/* Location prompt - only show in step 2 when no location data exists */}
                {!userData.latitude && !userData.longitude && (
                  <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100 text-left">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      🔍 Help us find vaccines close to you
                    </p>
                    <p className="text-sm text-blue-700">
                      By sharing your location, we can show you the nearest
                      clinics offering free HPV vaccines in your area.
                    </p>
                    <button
                      onClick={() => {
                        requestGeolocation();
                      }}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded"
                    >
                      Share My Location
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleAnswer('received_hpv_dose', true)}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer('received_hpv_dose', false)}
                  className={`${buttonClasses} mt-3 bg-gray-500 hover:bg-gray-600`}
                >
                  No
                </button>
              </>
            )}

            {step === 'congratulations' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                  Congratulations on protecting your girl against HPV - the
                  leading cause of cervical cancer.
                </p>
                <p className="mb-4 font-medium text-gray-800">
                  You can play an important role in protecting another girl in
                  your community. Send this map to one person you know who has a
                  girl who is 9 or older.
                </p>
                <a
                  href={WHATSAPP_SHARE_LINK} // Should be SHARE_LINK since users are sharing with others
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center mt-4`}
                >
                  <Image
                    src="/whatsapp.png"
                    width={24}
                    height={24}
                    alt="WhatsApp"
                    className="mr-2"
                  />
                  Share on WhatsApp
                </a>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  Are you ready to have your daughter vaccinated?
                </p>
                <button
                  onClick={() => handleAnswer('ready_for_vaccine', 'yes')}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  Yes, I'm ready!
                </button>
                <button
                  onClick={() =>
                    handleAnswer('ready_for_vaccine', 'needs_info')
                  }
                  className={`${buttonClasses} mt-3 bg-yellow-500 hover:bg-yellow-600`}
                >
                  Not yet, I need info
                </button>
              </>
            )}

            {step === 'ineligible' && (
              <>
                <p className="text-xl font-extrabold text-gray-900 mb-4">
                  Thank you!
                </p>
                <p className="mb-4 font-semibold text-gray-800">
                  You can still play an important role in protecting girls in
                  your community from cervical cancer. Send this map to one
                  person you know who has a daughter age 9 or older.
                </p>
                <a
                  href={WHATSAPP_SHARE_LINK} // Change to SHARE_LINK since users are sharing with others
                  onClick={handleWhatsAppClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center`}
                >
                  <Image
                    src="/whatsapp.png"
                    width={24}
                    height={24}
                    alt="WhatsApp"
                    className="mr-2"
                  />
                  Share on WhatsApp
                </a>
              </>
            )}

            {step === 'complete' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                  Find a free HPV vaccine near you when you are ready.
                </p>
                {answers.ready_for_vaccine === 'yes' ? (
                  <p className="mb-4 font-medium text-gray-800">
                    Get your questions answered on WhatsApp!
                  </p>
                ) : (
                  <p className="mb-4 font-medium text-gray-800">
                    Join a community of parents and talk to an expert local
                    pharmacist about the HPV vaccine.
                  </p>
                )}
                <div className="space-y-3 mt-4">
                  <button
                    onClick={() => setShowSurvey(false)}
                    className={`${buttonClasses} bg-blue-500 hover:bg-blue-600 inline-block`}
                  >
                    Find HPV Vaccine Near You
                  </button>

                  <a
                    href={WHATSAPP_GROUP_LINK} // Change to GROUP_LINK since users are joining the chat
                    onClick={handleWhatsAppClick} // Add this back to track clicks
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center`}
                  >
                    <Image
                      src="/whatsapp.png"
                      width={24}
                      height={24}
                      alt="WhatsApp"
                      className="mr-2"
                    />
                    Join Chat on WhatsApp
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
