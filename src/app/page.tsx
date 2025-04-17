import dynamic from 'next/dynamic';
import Image from 'next/image';
import ClientMapWrapper from '@/components/ClientMapWrapper';
import CustomSurveyWrapper from '@/components/CustomSurveyWrapper'; // Import the new client component

// Ensure Supabase environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase environment variables are missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <ClientMapWrapper />
      <CustomSurveyWrapper /> {/* Use the new client component */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-md p-3 z-[100]">
        <Image
          src="/logo.png"
          width={200}
          height={70}
          alt="VITAL Campaign Logo"
          priority
        />
      </div>
    </main>
  );
}
