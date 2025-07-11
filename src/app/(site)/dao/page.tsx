"use client";

import React, { useEffect, useState } from "react";
import { getSnapshotProposals } from "@/utils/getSnapshotProposals";

export default function DAOPage() {
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getSnapshotProposals();
      setProposals(result);
    }
    fetchData();
  }, []);

  function calculatePercentages(scores: number[]) {
    const total = scores.reduce((a, b) => a + b, 0);
    return scores.map((score) =>
      total === 0 ? 0 : Math.round((score / total) * 100)
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-gray-800 dark:text-gray-200">
      {/* DAO Governance Overview */}
      <section className="bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-extrabold mb-4 text-center text-blue-900">
          DAO Governance
        </h1>
        <p className="leading-relaxed">
          DENTARA uses the DAO model to hand governance entirely over to community members.
          A DAO—Decentralized Autonomous Organization—is a form of governance encoded in
          smart contracts on the blockchain without a centralized board. Decisions are made
          by votes from participating members rather than by single individuals, ensuring
          every voice is heard and that the platform’s development follows community consensus.
          Dentistry decisions traditionally happen behind closed doors; DENTARA democratizes
          this with Web3 technology. We adopt the DAO model because transparency, democracy,
          and community-driven governance are core DENTARA values. In this way, dentists,
          clinics, patients, and other stakeholders take a direct role in governance, building
          trust by ensuring important decisions are made collectively, after open discussion,
          with no hidden agendas.
        </p>
      </section>

      {/* Community-Based Decision Making */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Community-Based Decision Making
        </h2>
        <p className="leading-relaxed mb-4">
          DENTARA’s DAO governance relies on community discussion and voting rather than
          centralized edicts. Who can participate? Anyone holding DENTA tokens—dentists,
          clinics, educators, even patients who support the platform—can join the decision
          process. The platform’s future direction is therefore defined by those who benefit
          from it.
        </p>
        <p className="leading-relaxed">
          Any community member can propose changes—from adding new features to updating
          rules. Proposals undergo discussion, questions, and feedback. After the debate
          phase, the proposal is put to a vote. This process demonstrates DENTARA’s faith
          in collective intelligence: decisions reflect a broad expert and user perspective,
          making the platform more useful and fair for everyone.
        </p>
      </section>

      {/* Token-Based Voting Model */}
      <section className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Token-Based Voting Model
        </h2>
        <p className="leading-relaxed mb-4">
          Governance power comes from DENTA tokens. By default, DAO voting follows a
          “one token = one vote” principle: influence corresponds directly to the number
          of tokens a participant holds or stakes. This rewards larger investors and
          long-term supporters with proportionate say, while still allowing smaller holders
          to speak and vote freely.
        </p>
        <p className="leading-relaxed mb-4">
          To participate, users connect their Web3 wallets to DENTARA’s DAO interface.
          At vote start, the system takes a “snapshot” of balances at a specific block
          height, preventing manipulation by last-minute token purchases. Participants
          then vote “for” or “against” proposals (or choose among multiple options).
          Results are automatically tallied by token weight, with required majorities
          or quorum rules encoded in the smart contracts to ensure fairness.
        </p>
        <p className="leading-relaxed">
          To further balance influence, DENTARA is exploring Quadratic Voting—where each
          additional vote becomes progressively “more costly”—and reputation bonuses for
          active contributors, both of which help amplify broader community voices.
        </p>
      </section>

      {/* Decision Examples */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Examples of Decisions
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>New Modules & Features:</strong> Adding orthodontics training courses or a patient appointment tool.</li>
          <li><strong>Payment & Monetization Models:</strong> Setting DENTA token fees, commissions, discounts, and reward structures.</li>
          <li><strong>Reputation System Rules:</strong> Tweaking how NFT-based reputation points are earned, displayed, and verified.</li>
          <li><strong>Treasury & Budget Management:</strong> Allocating community funds to development, scholarships, grants, or marketing initiatives.</li>
          <li><strong>Partner Onboarding:</strong> Approving new clinics, labs, or strategic alliances to join the ecosystem.</li>
        </ul>
        <p className="mt-4 leading-relaxed">
          These examples illustrate the DAO’s broad scope: from major strategic directions
          to fine-grained feature details, every decision is transparent and community-approved,
          keeping DENTARA aligned with real user needs.
        </p>
      </section>

      {/* Technical Foundations */}
      <section className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Technical Foundations
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Blockchain & Smart Contracts:</strong> All governance rules, proposal creation, vote mechanics, and execution are coded on-chain for immutability and trust.</li>
          <li><strong>Multisig Governance:</strong> Major fund releases and critical updates require multiple authorized signatures, enhancing security and collective control.</li>
          <li><strong>Snapshot (Off-Chain Voting):</strong> Off-chain voting via snapshot eliminates gas fees, enabling everyone to vote without cost barriers. Results are transparently announced before any on-chain execution.</li>
          <li><strong>On-Chain Execution:</strong> High-impact decisions—like fund transfers or contract upgrades—are executed directly by smart contracts once votes pass, ensuring seamless automation.</li>
        </ul>
      </section>

      {/* Future Expansion & Community Value */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Future Expansion & Community Value
        </h2>
        <p className="leading-relaxed mb-4">
          As DENTARA grows, we plan to introduce regional sub-DAOs and specialized working
          groups to address local and thematic needs. Advanced governance models such as
          Quadratic Voting and reputation-weighted voting will deepen decentralization and
          empower every active contributor with true ownership.
        </p>
        <p className="leading-relaxed">
          DAO governance delivers unmatched benefits: transparency builds trust, democratic
          participation drives innovation, and collective stewardship ensures sustainable
          growth across dentistry.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">
          Key Benefits
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Transparency:</strong> All decisions and discussions are public and verifiable.</li>
          <li><strong>Democratic Participation:</strong> Every member, large or small, has a voice.</li>
          <li><strong>Community Ownership:</strong> Token holders share responsibility for platform success.</li>
          <li><strong>Innovation & Agility:</strong> Rapid iteration driven by direct community feedback.</li>
          <li><strong>Fair & Trustworthy Ecosystem:</strong> Collective decision-making prevents undue influence.</li>
        </ul>
      </section>

      {/* Conclusion */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <p className="leading-relaxed text-center">
          Ultimately, DENTARA’s DAO model ensures that no single group controls the platform’s fate. By democratizing governance—combining smart contracts, multisig security, off-chain voting, and advanced models—we empower our community not just with a voice but with the power to co-create the future of dentistry.
        </p>
      </section>

      {/* DAO Live Proposals Bölməsi */}
      <section className="bg-white p-8 rounded-lg space-y-6">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#007B5E' }}>
          Live DAO Proposals
        </h2>

        {proposals.length === 0 ? (
          <p className="text-center text-gray-500">Loading proposals...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proposals.map((proposal) => {
              const percentages = calculatePercentages(proposal.scores);

              return (
                <div
                  key={proposal.id}
                  className="rounded-xl border border-gray-200 shadow-md p-6 bg-white hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#007B5E' }}>
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Status: <span className="font-semibold">{proposal.state}</span>
                  </p>
                  <div className="space-y-2">
                    {proposal.choices.map((choice: string, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{choice}</span>
                        <span className="font-bold">{percentages[index]}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}
