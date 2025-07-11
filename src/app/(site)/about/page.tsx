import React from "react";

export const metadata = {
  title: "About – DENTARA",
  description:
    "DENTARA is a Web3-based global dental platform that unites dentists, patients, and academic communities through trust, transparency, and innovation.",
};

export default function AboutPage() {
  return (
    <main className="space-y-16">

      {/* Header */}
      <header className="bg-blue-50 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-4 text-blue-900">
            DENTARA – A Global Web3-Based Dental Platform
          </h1>
          <p className="text-lg text-gray-700 leading-relaxed">
            DENTARA is a Web3-powered global platform that brings together all participants
            in dentistry—dentists, patients, and academic communities—under one roof.
            By prioritizing trust, transparency, and innovation, this platform elevates
            the dental service and information ecosystem to a new level. With DENTARA,
            dentists and patients can securely connect worldwide, while academic communities
            gain broad opportunities to share knowledge and expertise.
          </p>
        </div>
      </header>

      {/* Mission */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-blue-800 text-center">Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            DENTARA’s mission is to create value across the dental sector by delivering
            innovative solutions to dentists, patients, and academic communities. The platform
            enables dental professionals to safeguard their reputations and reach a global audience,
            gives patients control over their personal health data with secure access to quality care,
            and offers academic and educational networks a digital space for knowledge exchange and
            professional development. By bridging these three groups, DENTARA fosters stronger
            collaboration and sustainable growth in dentistry.
          </p>
        </div>
      </section>

      {/* Origin */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-blue-800 text-center">
            Origin & Reason for Creation
          </h2>
          <p className="text-gray-700 leading-relaxed">
            DENTARA was founded to tackle the core challenges in dentistry: lack of trust and transparency,
            data security issues, and fragmented global coordination. Patients often struggle to verify
            a dentist’s credentials across different clinics, and medical records can be lost or privacy
            compromised during transfers. Dentists lacked a digital platform to certify and promote their
            professional reputations globally, while poor integration among clinics, labs, suppliers, and
            educational institutions slowed down workflows.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            To address these gaps, DENTARA applies blockchain’s immutability and transparency along with
            Web3’s community-driven governance to strengthen trust and foster global collaboration.
            The result is a next-generation ecosystem that unites dentists, patients, and academic communities
            on a single platform—driving the digital transformation of dentistry.
          </p>
        </div>
      </section>

      {/* Key Technologies */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-blue-800 text-center">
            Key Technological Features
          </h2>
          <ul className="list-disc pl-6 space-y-4 text-gray-700">
            <li>
              <strong>Web3 & Blockchain Infrastructure:</strong> All critical data and operations
              are recorded on a decentralized network, ensuring transparency and immutability.
              Users authenticate via wallet-based login (e.g., MetaMask), reducing intermediaries
              and boosting trust.
            </li>
            <li>
              <strong>NFT-Based Reputation & Certification:</strong> Dentists’ degrees and professional
              licenses are minted as NFTs, preserving their qualifications in an unchangeable form.
              Reputation points earned on the platform are managed transparently via smart contracts,
              creating a reliable system for clinics and patients.
            </li>
            <li>
              <strong>Encrypted Patient Records:</strong> Patients’ treatment histories are protected
              with cryptographic methods and stored on a permissioned blockchain. They control access,
              allowing secure sharing between authorized practitioners without risk of data loss
              or privacy breaches.
            </li>
            <li>
              <strong>DAO Governance:</strong> The platform is governed by its community through a
              decentralized autonomous organization. Token holders vote on feature updates, funding
              allocations, and strategic partnerships—ensuring transparent, democratic decision-making.
            </li>
            <li>
              <strong>DENTA Token Economy:</strong> DENTA is the native cryptocurrency for staking,
              payments, and rewards. Dentists stake tokens to earn reputation points and governance
              power; patients use tokens for service payments and loyalty discounts, creating a
              mutually beneficial reward loop.
            </li>
            <li>
              <strong>Web3 Learning & Credentialing:</strong> Dental professionals and academics
              can publish online courses and seminars. Students earn NFT-backed certificates upon
              completion, while instructors are rewarded with DENTA tokens, fostering a global
              ecosystem of education and credentialing.
            </li>
          </ul>
        </div>
      </section>

      {/* Future Vision */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-blue-800 text-center">Future Goals & Vision</h2>
          <p className="text-gray-700 leading-relaxed">
            DENTARA’s long-term vision is to become the global leader in the digital transformation
            of dentistry. Upcoming roadmap items include integrating AI-powered diagnostic assistants,
            launching a decentralized dental equipment marketplace, and fostering partnerships
            with clinics, universities, and professional associations worldwide.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Ultimately, every step in the dental care journey—from initial consultations and lab work
            to continuous education—will be managed seamlessly through DENTARA’s unified ecosystem.
            As the first platform to combine Web3 technology, blockchain reputation systems, clinical
            services, and education, DENTARA is setting new standards for trust, transparency,
            and innovation in oral healthcare globally.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-blue-800 text-center">The Team</h2>
          <p className="text-gray-700 leading-relaxed">
            The DENTARA team brings together experts in dentistry, health technology, and blockchain.
            With decades of clinical and technical experience, we share a unified vision:
            to advance dentistry through cutting-edge innovation and create sustainable value
            for the global dental community. By combining academic expertise with real-world practice,
            our team ensures DENTARA remains reliable, functional, and user-centric at every step.
          </p>
        </div>
      </section>

    </main>
  );
}
