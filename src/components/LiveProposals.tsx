'use client';

import { useEffect, useState } from 'react';
import { getSnapshotProposals } from '@/utils/getSnapshotProposals';

export default function LiveProposals({ space = 'ens.eth' }: { space?: string }) {
  const [proposals, setProposals] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getSnapshotProposals(space);
      setProposals(result);
    }
    fetchData();
  }, [space]);

  return (
    <section className="bg-white p-8 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Live Proposals from Snapshot</h2>
      {proposals.length === 0 ? (
        <p className="text-gray-500">Loading proposals...</p>
      ) : (
        <ul className="space-y-6">
          {proposals.map((proposal) => (
            <li key={proposal.id} className="border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-lg mb-1">{proposal.title}</h3>
              <p className="text-sm text-gray-500 mb-1">
                Status: <strong>{proposal.state}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-2">Snapshot block: {proposal.snapshot}</p>
              <div className="space-y-1 text-sm">
                {proposal.choices.map((choice: string, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{choice}</span>
                    <span className="font-medium">{proposal.scores[i]}</span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
