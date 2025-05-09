'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const WHATSAPP_LINK =
  'https://api.whatsapp.com/send?text=Protect%20your%20daughter%20from%20cervical%20cancer!%20Use%20this%20map%20to%20find%20a%20free%20HPV%20vaccine.%20Or%2C%20if%20you%20have%20questions%2C%20get%20them%20answered%20by%20a%20local%20pharmacist%20over%20WhatsApp.%20Check%20it%20out%3A%20https%3A%2F%2Fvital-map.vercel.app%2F';

export default function CustomSurvey() {
  const { t } = useTranslation(); // Initialize useTranslation
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [showSurvey, setShowSurvey] = useState(true);

  const handleAnswer = (key, value) => {
    const updatedAnswers = { ...answers, [key]: value };
    setAnswers(updatedAnswers);

    if (key === 'cares_for_girl' && value === false) {
      setStep('ineligible');
    } else if (key === 'received_hpv_dose' && value === true) {
      setStep('congratulations'); // Show the congratulations card
    } else if (key === 'ready_for_vaccine') {
      setStep('complete');
    } else {
      setStep(step + 1);
    }
  };

  const buttonClasses =
    'w-full py-3 rounded-full text-lg font-bold text-white transition duration-200 ease-in-out shadow-sm';

  return (
    <>
      {showSurvey && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-25"></div>

          <div className="bg-white rounded-2xl shadow-lg w-11/12 max-w-sm p-6 text-center z-10">
            {step === 1 && (
              <>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  {t('survey.question1')}
                </p>
                <button
                  onClick={() => handleAnswer('cares_for_girl', true)}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  {t('yes')}
                </button>
                <button
                  onClick={() => handleAnswer('cares_for_girl', false)}
                  className={`${buttonClasses} mt-3 bg-gray-500 hover:bg-gray-600`}
                >
                  {t('no')}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  {t('survey.question2')}
                </p>
                <button
                  onClick={() => handleAnswer('received_hpv_dose', true)}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  {t('yes')}
                </button>
                <button
                  onClick={() => handleAnswer('received_hpv_dose', false)}
                  className={`${buttonClasses} mt-3 bg-gray-500 hover:bg-gray-600`}
                >
                  {t('no')}
                </button>
              </>
            )}

            {step === 'congratulations' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                  {t('survey.congratulations')}
                </p>
                <p className="mb-4 font-medium text-gray-800">
                  {t('survey.share')}
                </p>
                <a
                  href={WHATSAPP_LINK}
                  className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center mt-4`}
                >
                  {t('survey.join_whatsapp')}
                </a>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-lg font-bold text-gray-900 mb-6">
                  {t('survey.question3')}
                </p>
                <button
                  onClick={() => handleAnswer('ready_for_vaccine', 'yes')}
                  className={`${buttonClasses} bg-green-700 hover:bg-green-800`}
                >
                  {t('survey.ready')}
                </button>
                <button
                  onClick={() =>
                    handleAnswer('ready_for_vaccine', 'needs_info')
                  }
                  className={`${buttonClasses} mt-3 bg-yellow-500 hover:bg-yellow-600`}
                >
                  {t('survey.not_ready')}
                </button>
              </>
            )}

            {step === 'ineligible' && (
              <>
                <p className="text-xl font-bold mb-4">
                  {t('survey.thank_you')}
                </p>
                <p className="mb-4 font-medium">{t('survey.share')}</p>
                <a
                  href={WHATSAPP_LINK}
                  className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center mt-4`}
                >
                  {t('survey.join_whatsapp')}
                </a>
              </>
            )}

            {step === 'complete' && (
              <>
                <p className="text-xl font-bold mb-4 text-gray-900">
                  {t('survey.complete')}
                </p>
                {answers.ready_for_vaccine === 'yes' ? (
                  <p className="mb-4 font-medium text-gray-800">
                    {t('survey.find_health_center')}
                  </p>
                ) : (
                  <p className="mb-4 font-medium text-gray-800">
                    {t('survey.more_info')}
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
                    href={WHATSAPP_LINK}
                    className={`${buttonClasses} bg-green-500 hover:bg-green-600 inline-flex items-center justify-center`}
                  >
                    <Image
                      src="/whatsapp.png"
                      width={24}
                      height={24}
                      alt="WhatsApp"
                      className="mr-2"
                    />
                    {t('survey.join_whatsapp')}
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
