import CustomSurvey from '@/components/CustomSurvey';
import Image from 'next/image';
import ClientMapWrapper from '@/components/ClientMapWrapper';

// Ensure Supabase environment variables are defined
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error('Supabase environment variables are missing.');
}

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
