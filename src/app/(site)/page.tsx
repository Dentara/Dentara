// app/(site)/page.tsx  — REPLACE ALL
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import HomeHero from "@/components/home/HomeHero";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as "clinic" | "doctor" | "patient" | undefined;

  return (
    <DefaultLayout>
      <HomeHero role={role} isAuthenticated={!!session} />

      {/* Value cards (public info) */}
      <section className="text-center px-4 py-20 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Verified Dental Credentials on Blockchain
        </h2>
        <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
          Every doctor on Tagiza is verified via tamper-proof NFT certificates. Patients and clinics can instantly verify credentials.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-left max-w-xl mx-auto text-gray-600 dark:text-gray-400">
          <li>Immutable NFT diplomas and licenses</li>
          <li>Transparent, verifiable professional history</li>
          <li>Accessible across clinics and borders</li>
        </ul>
      </section>

      <section className="px-4 py-20 bg-gray-50 dark:bg-[#111827] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Secure & Portable Patient Histories
          </h2>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
            Tagiza keeps encrypted, permission-based treatment histories so data follows the patient — safely and privately.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-left max-w-xl mx-auto text-gray-600 dark:text-gray-400">
            <li>Encrypted, tamper-proof records</li>
            <li>Smart permissions, consent-first access</li>
            <li>Cross-clinic portability</li>
          </ul>
        </div>
      </section>
    </DefaultLayout>
  );
}
