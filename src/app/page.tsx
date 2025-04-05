import CustomSurvey from '@/components/CustomSurvey';
import Image from 'next/image';
import ClientMapWrapper from '@/components/ClientMapWrapper';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <ClientMapWrapper />
      <CustomSurvey />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-md p-3 z-[100]">
        <Image
          src="/logo.png"
          width={200}
          height={70}
          alt="VITAL Campaign Logo"
        />
      </div>
    </main>
  );
}
