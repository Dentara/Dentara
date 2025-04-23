import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Footer from "@/components/Footer/Footer";

export const metadata = {
  title: "DENTARA – Blockchain Meets Dentistry",
  description: "The world's first Web3 ecosystem for dental professionals, patients, and educators.",
};

export default function Page() {
  return (
    <DefaultLayout>
      <section className="text-center px-4 py-24 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-gray-800 dark:text-white leading-tight">
          Blockchain Meets Dentistry
        </h1>
        <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">
          DENTARA is the world’s first blockchain-based platform for dental professionals, patients, and educators.
          Built on Web3, it brings trust, transparency, and innovation to the future of dentistry.
        </p>
        <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
          From NFT certification and encrypted patient records to staking, rewards, and decentralized governance — DENTARA unifies the entire dental ecosystem.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <a
            href="/whitepaper"
            className="px-6 py-3 bg-primary text-white font-medium rounded hover:bg-primary/90 transition"
          >
            Download Whitepaper
          </a>
          <a
            href="/join"
            className="px-6 py-3 border border-primary text-primary font-medium rounded hover:bg-primary/10 transition"
          >
            Join Dentara
          </a>
        </div>
      </section>
      <section className="px-4 py-20 bg-gray-50 dark:bg-[#111827] text-center">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      Verified Dental Credentials on Blockchain
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      Every dentist on DENTARA is verified through tamper-proof NFT certificates that prove their qualifications, training, and experience.
      Patients and clinics can instantly verify any dental professional's credentials.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Immutable NFT diplomas and licenses</li>
        <li>Transparent and verifiable professional history</li>
        <li>Accessible across clinics and borders</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-20 text-center bg-white dark:bg-gray-900">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      Secure & Portable Patient Histories
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      Dentara securely stores patient treatment histories on the blockchain using encrypted, permission-based access.
      Patients stay in full control, while dentists access records with proper consent — eliminating loss, fragmentation, and privacy concerns.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Encrypted and tamper-proof patient data</li>
        <li>Controlled access via smart permissions</li>
        <li>Data follows the patient — across dentists, clinics, and borders</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-20 bg-gray-50 dark:bg-[#111827] text-center">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      Learn & Earn: Dental Education Reinvented
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      DENTARA offers a Web3-powered education platform for dental professionals — from orthodontics to implantology and more.
      Complete certified courses, earn NFT credentials, and access global expert knowledge.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Specialized dental courses with NFT certification</li>
        <li>Earn tokens by teaching or learning</li>
        <li>Global, permissionless access to dental education</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-20 text-center bg-white dark:bg-gray-900">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      DENTA Token – Powering Rewards and Loyalty
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      DENTARA's native cryptocurrency, the DENTA token, fuels reputation staking, learning incentives, DAO voting,
      and even discounts for loyal patients — uniting the ecosystem through a decentralized value loop.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Stake tokens to gain reputation and rewards</li>
        <li>Pay for courses, treatments, or platform services</li>
        <li>Participate in community votes and loyalty programs</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-20 bg-gray-50 dark:bg-[#111827] text-center">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      Community Governance: Powered by Dentists
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      DENTARA is governed by its community — dentists, patients, educators, and contributors — through a transparent DAO system.
      Token holders vote on proposals that shape the future of dental innovation.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Submit and vote on platform proposals</li>
        <li>Decide on funding, features, and partnerships</li>
        <li>Reputation and staking influence your vote power</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-20 text-center bg-white dark:bg-gray-900">
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
      A Unified Dental Blockchain Ecosystem
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
      Dentara combines every layer of modern dentistry — from NFT credentials and encrypted patient histories to token rewards and decentralized decision-making.
      It’s the first platform of its kind to unify dental professionals, clinics, labs, and patients in one secure, transparent network.
    </p>
    <div className="text-left max-w-xl mx-auto">
      <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
        <li>Dentists build verified NFT profiles</li>
        <li>Patients manage and share encrypted treatment data</li>
        <li>Courses and certifications live on-chain</li>
        <li>All stakeholders collaborate through DENTA token and DAO</li>
      </ul>
    </div>
  </div>
</section>
<section className="px-4 py-24 bg-primary text-white text-center">
  <div className="max-w-2xl mx-auto">
    <h2 className="text-3xl font-bold mb-4">Join the Dentara Revolution</h2>
    <p className="text-lg mb-6">
      Be part of the first global Web3 dental ecosystem. Whether you’re a dentist, a patient, or an innovator — DENTARA welcomes you.
    </p>
    <a
      href="/join"
      className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded hover:bg-gray-100 transition"
    >
      Get Started
    </a>
  </div>
</section>
    <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-20 text-center text-sm text-gray-600 dark:text-gray-300 border-t">
      <div className="mb-2">© {new Date().getFullYear()} DENTARA – All rights reserved.</div>
      <div className="flex justify-center gap-4 text-blue-600 dark:text-blue-400 mt-2">
        <a href="https://t.me/dentara" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Telegram
        </a>
        <a href="https://twitter.com/dentara_io" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Twitter
        </a>
        <a href="https://discord.gg/dentara" target="_blank" rel="noopener noreferrer" className="hover:underline">
          Discord
        </a>
        <a href="mailto:feedback@dentara.io" className="hover:underline">
          Email
        </a>
      </div>
      <div className="mt-3">
        <a href="/privacy-policy" className="hover:underline">Privacy Policy</a> | 
        <a href="/terms-of-service" className="hover:underline ml-2">Terms of Service</a>
      </div>
    </footer>

    </DefaultLayout>
  );
}
