import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { rewardContentCreator } from '../helpers/solana.helper';

const RewardContentCreator: React.FC = () => {
  const wallet = useAnchorWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isRewarding, setIsRewarding] = useState(false);
  const [rewardError, setRewardError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const handleRewardContentCreator = async () => {
    if (!wallet) {
      setRewardError("Wallet not connected");
      return;
    }

    if (!recipientAddress) {
      setRewardError("Please enter a recipient address");
      return;
    }

    setIsRewarding(true);
    setRewardError(null);
    setTransactionSignature(null);

    try {
      const recipientPubkey = new PublicKey(recipientAddress);
      const signature = await rewardContentCreator(wallet, recipientPubkey);

      if (signature) {
        setTransactionSignature(signature);
      } else {
        setRewardError("Failed to send reward. Check console for details.");
      }
    } catch (error) {
      setRewardError(`Error sending reward: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRewarding(false);
    }
  };

  return (
    <div>
      <h2>Reward Content Creator</h2>
      <p>Send 0.1 SOL to any address</p>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
      />
      <button
        onClick={handleRewardContentCreator}
        disabled={!wallet || isRewarding}
      >
        {isRewarding ? 'Sending Reward...' : 'Send 0.1 SOL'}
      </button>
      {rewardError && <p style={{ color: 'red' }}>{rewardError}</p>}
      {transactionSignature && <p>Reward sent! Transaction signature: {transactionSignature}</p>}
    </div>
  );
};

export default RewardContentCreator;
