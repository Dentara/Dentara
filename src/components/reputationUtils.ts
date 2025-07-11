// DENTA token ilə reputasiya və staking hesablaması

export function calculateReputation({
    stakedAmount,
    stakingDays,
  }: {
    stakedAmount: number;
    stakingDays: number;
  }) {
    const minStake = 14000;
    const requiredDays = 30;
    
    if (stakingDays < requiredDays || stakedAmount < minStake) {
      return 0;
    }
  
    const fullBatches = Math.floor(stakedAmount / minStake);
    return fullBatches; // Hər 14000 üçün 1 bal
  }
  
  export function calculateRenewalStake(currentReputation: number) {
    const requiredStake = Math.ceil(currentReputation * 0.25 * 14000);
    return requiredStake;
  }
  