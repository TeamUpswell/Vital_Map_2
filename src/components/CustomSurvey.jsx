'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/Ibni0qFjVOk2Y7PUNnAORC';
const SURVEY_MESSAGE =
  'We can help you find a free HPV vaccine to protect your daughter against cervical cancer!';

export default function CustomSurvey() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showSurvey, setShowSurvey] = useState(true);

  // Use plain JavaScript for userData without TypeScript annotations
  const [userData, setUserData] = useState({
    latitude: null,
    longitude: null,
    address: 'Dynamic Address',
    whatsapp_joined: null,
  });

  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the survey is already submitted

  useEffect(() => {
    if (navigator.geolocation) {
      console.log('Attempting to fetch user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location fetched:', { latitude, longitude });
          setUserData((prev) => ({ ...prev, latitude, longitude })); // Safely update userData
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

  const handleAnswer = (key, value) => {
    if (isSubmitted) return; // Prevent duplicate submissions

    // Track question clicks
    window.gtag('event', 'survey_question_click', {
      question: key,
      answer: value,
    });

    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);

    if (key === 'cares_for_girl' && value === false) {
      submitSurvey({ ...updatedAnswers, ready_for_vaccine: 'no' });
      setStep('ineligible');
      setIsSubmitted(true); // Mark as submitted
    } else if (key === 'ready_for_vaccine') {
      submitSurvey(updatedAnswers);
      setStep('complete');
      setIsSubmitted(true); // Mark as submitted
    } else {
      setStep(step + 1);
    }
  };

  async function submitSurvey(finalAnswers) {
    if (isSubmitted) return; // Prevent duplicate submissions

    const payload = { ...userData, ...finalAnswers }; // Combine user data and survey answers
    const { data, error } = await supabase
      .from('survey_responses') // Use survey_responses table
      .insert([payload]);

    if (error) {
      console.error('Submission error details:', JSON.stringify(error));
      alert('An error occurred while submitting the survey. Please try again.');
    } else {
      console.log('Submission successful!', data);
      setIsSubmitted(true); // Mark as submitted after successful submission
    }
  }

  const handleWhatsAppClick = () => {
    const updatedAnswers = { ...answers, whatsapp_joined: true }; // Update whatsapp_joined to true
    setAnswers(updatedAnswers);
    submitSurvey(updatedAnswers); // Submit updated answers
  };

  const buttonClasses =
    'w-full py-3 rounded-full text-lg font-bold text-white transition duration-200 ease-in-out shadow-sm';

  return (
    <>
      {showSurvey && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-25"></div>

          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-6 text-center z-10">
            {step === 1 && ( // Show the survey message only on the first question
              <p className="text-lg font-normal text-gray-900 mb-4">
                {SURVEY_MESSAGE}
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
                <p className="text-lg font-bold text-gray-900 mb-6">
                  Has she received an HPV vaccine dose already?
                </p>
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
                  Please share this with someone who might benefit.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  onClick={handleWhatsAppClick} // Track WhatsApp button click
                  className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center mt-4`}
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
              </>
            )}

            {step === 'complete' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                  Thanks for completing!
                </p>
                {answers.ready_for_vaccine === 'yes' ? (
                  <p className="mb-4 font-medium text-gray-800">
                    Find your nearest health center on our map below.
                  </p>
                ) : (
                  <p className="mb-4 font-medium text-gray-800">
                    Join our WhatsApp group for more information.
                  </p>
                )}
                <div className="space-y-3 mt-4">
                  <button
                    onClick={() => setShowSurvey(false)}
                    className={`${buttonClasses} bg-blue-500 hover:bg-blue-600 inline-block`}
                  >
                    View Map
                  </button>
                  <a
                    href={WHATSAPP_LINK}
                    onClick={handleWhatsAppClick} // Track WhatsApp button click
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
