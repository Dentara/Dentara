import StakingDashboard from '@/components/StakingDashboard';

export const metadata = {
  title: 'Staking & Reputation – DENTARA',
  description: 'Manage your DENTARA staking and reputation points easily.',
};

export default function StakingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1
  className="text-3xl font-bold mb-8 text-center"
  style={{ color: '#007B5E' }}
>
  Staking & Reputation
</h1>
      <StakingDashboard />
    </div>
  );
}
