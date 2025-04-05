'use client';

import dynamic from 'next/dynamic';

const CustomSurvey = dynamic(() => import('@/components/CustomSurvey'), {
  ssr: false,
});

export default function CustomSurveyWrapper() {
  return <CustomSurvey />;
}
