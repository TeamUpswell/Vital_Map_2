'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const WHATSAPP_LINK = 'https://chat.whatsapp.com/Ibni0qFjVOk2Y7PUNnAORC';

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

  // Use useEffect for geolocation to ensure it only runs in the browser
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      console.log('Attempting to fetch user location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location fetched:', { latitude, longitude });
          setUserData((prev) => ({ ...prev, latitude, longitude }));
        },
        (error) => {
          console.error('Error fetching user location:', error.message);
        }
      );
    } else if (typeof window !== 'undefined') {
      console.warn('Geolocation is not supported by this browser.');
    }
  }, []);

  // Use state to track if we're on the client side
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
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
      } else if (key === 'received_hpv_dose' && value === true) {
        console.log("Setting step to 'congratulations'");
        setStep('congratulations');
      } else if (key === 'ready_for_vaccine') {
        console.log("Setting step to 'complete'");
        setStep('complete');
        submitSurvey(updatedAnswers); // Submit the survey when complete
      } else {
        console.log(`Incrementing step from ${step} to ${step + 1}`);
        setStep(step + 1);
      }
    } catch (error) {
      console.error("Error in handleAnswer:", error);
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
    // Update userData directly to ensure it's included in the submission
    setUserData(prev => ({ ...prev, whatsapp_joined: true }));
    
    // Also update answers state for consistency
    const updatedAnswers = { ...answers, whatsapp_joined: true };
    setAnswers(updatedAnswers);
    
    // Combine userData and answers for submission
    const combinedData = { 
      ...userData, 
      ...updatedAnswers, 
      whatsapp_joined: true // Ensure this flag is set even if state updates haven't processed yet
    };
    
    // Submit the combined data to Supabase
    submitSurvey(combinedData);
    
    // Track the WhatsApp click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'whatsapp_click', {
        event_category: 'engagement',
        event_label: 'Clicked WhatsApp Link'
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
    console.log(`Is step equal to 'congratulations'? ${step === 'congratulations'}`);
  }

  return (
    <>
      {isClient && showSurvey && (
        <div className="fixed inset-0 flex items-center justify-center z-[200]">
          <div className="absolute inset-0 bg-black opacity-25"></div>

          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-6 text-center z-[300]">
            {step === 1 && ( // Show the survey message only on the first question
              <p className="text-lg font-normal text-gray-900 mb-4">
                We can help you find a free HPV vaccine to protect your daughter against cervical cancer!
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
                Congratulations on protecting your girl against HPV - the leading cause of cervical cancer.
                </p>
                <p className="mb-4 font-medium text-gray-800">
                You can play an important role in protecting another girl in your community. Send this map to one person you know who has a girl who is 9 or older.
                </p>
                <a
                  href={WHATSAPP_LINK}
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
                  Join Chat on WhatsApp
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
                You can still play an important role in protecting girls in your community from cervical cancer. Send this map to one person you know who has a daughter age 9 or older.
                </p>
                <a
                  href={WHATSAPP_LINK}
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
                  Join Chat on WhatsApp
                </a>
              </>
            )}

            {step === 'complete' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                Get your questions answered on WhatsApp! 
                </p>
                {answers.ready_for_vaccine === 'yes' ? (
                  <p className="mb-4 font-medium text-gray-800">
                    Find your nearest health center on our map below.
                  </p>
                ) : (
                  <p className="mb-4 font-medium text-gray-800">
                    Join a community of parents and talk to an expert local pharmacist about the HPV vaccine.
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