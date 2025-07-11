'use client';

import { useState } from 'react';
import { calculateReputation, calculateRenewalStake } from '@/utils/reputationUtils';

export default function StakingDashboard() {
  const [stakeAmount, setStakeAmount] = useState(0);
  const [stakingDays, setStakingDays] = useState(0);
  const [currentReputation, setCurrentReputation] = useState(0);
  const [renewalStake, setRenewalStake] = useState(0);

  function handleStake() {
    const earned = calculateReputation({ stakedAmount: stakeAmount, stakingDays });
    setCurrentReputation((prev) => prev + earned);
  }

  function handleRenewalCalculation() {
    const renewal = calculateRenewalStake(currentReputation);
    setRenewalStake(renewal);
  }

  return (
    <div
  className="p-6 rounded-lg shadow-md space-y-6"
  style={{ backgroundColor: '#F5F5F7' }}
>
      <h2 className="text-2xl font-bold mb-4">Staking & Reputation Dashboard</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold">Stake Amount (DENTA):</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Enter amount to stake"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold">Staking Duration (Days):</label>
          <input
            type="number"
            value={stakingDays}
            onChange={(e) => setStakingDays(Number(e.target.value))}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Enter number of days"
          />
        </div>

        <button
  onClick={handleStake}
  className="text-white px-4 py-2 rounded transition"
  style={{ backgroundColor: '#00C897' }}
>
  Stake and Calculate Reputation
</button>

        <div className="text-gray-800 mt-4">
          <p><strong>Current Reputation:</strong> {currentReputation} points</p>
        </div>

        <hr />

        <button
  onClick={handleRenewalCalculation}
  className="px-4 py-2 rounded transition border border-[#00C897] text-[#00C897] bg-white hover:bg-[#00C897] hover:text-white"
>
  Calculate Renewal Stake
</button>

        <div className="text-gray-800 mt-4">
          <p><strong>Stake Needed for Renewal (1 year):</strong> {renewalStake} DENTA</p>
        </div>
      </div>
    </div>
  );
}
