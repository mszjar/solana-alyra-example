import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { rewardContentCreator } from '../helpers/solana.helper';

const RewardContentCreator: React.FC = () => {
  const wallet = useAnchorWallet();
  const [contentCreatorAddress, setContentCreatorAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isRewarding, setIsRewarding] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const handleRewardContentCreator = async () => {
    if (!wallet) {
      setRewardError("Wallet not connected");
      return;
    }

    if (!contentCreatorAddress || !amount) {
      setRewardError("Please fill in all fields");
      return;
    }

    setIsRewarding(true);
    setRewardError(null);
    setTransactionSignature(null);

    try {
      console.log("Starting reward process in component...");
      const contentCreatorPubkey = new PublicKey(contentCreatorAddress);
      const amountNumber = parseFloat(amount);

      console.log("Content Creator:", contentCreatorAddress);
      console.log("Amount:", amountNumber);

      console.log("Calling rewardContentCreator function...");
      const signature = await rewardContentCreator(
        wallet,
        contentCreatorPubkey,
        amountNumber
      );

      console.log("rewardContentCreator function returned:", signature);

      if (signature) {
        setTransactionSignature(signature);
        console.log("Content creator rewarded successfully:", signature);
      } else {
        console.error("rewardContentCreator returned null");
        setRewardError("Failed to reward content creator. Check console for details.");
      }
    } catch (error) {
      console.error("Error in handleRewardContentCreator:", error);
      setRewardError(`Error rewarding content creator: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRewarding(false);
    }
  };

  return (
    <div>
      <h2>Reward Content Creator</h2>
      <p>To reward a content creator, specify the creator's address and the amount to send.</p>
      <div>
        <input
          type="text"
          placeholder="Content Creator Address"
          value={contentCreatorAddress}
          onChange={(e) => setContentCreatorAddress(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <button
        onClick={handleRewardContentCreator}
        disabled={!wallet || isRewarding}
      >
        {isRewarding ? 'Rewarding...' : 'Reward Content Creator'}
      </button>
      {rewardError && (
        <p style={{ color: 'red' }}>{rewardError}</p>
      )}
      {transactionSignature && (
        <p>Reward successful! Transaction signature: {transactionSignature}</p>
      )}
    </div>
  );
};

export default RewardContentCreator;
