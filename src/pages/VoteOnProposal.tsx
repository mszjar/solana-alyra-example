import React, { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { castVote } from '../helpers/solana.helper';

interface VoteOnProposalProps {
  proposalPubkey: string;
  choices: string[];
}

const VoteOnProposal: React.FC<VoteOnProposalProps> = ({ proposalPubkey, choices }) => {
  const wallet = useAnchorWallet();
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const handleVote = async () => {
    if (!wallet) {
      setVoteError("Wallet not connected");
      return;
    }

    if (selectedChoice === null) {
      setVoteError("Please select a choice");
      return;
    }

    setIsVoting(true);
    setVoteError(null);
    setTransactionSignature(null);

    try {
      const proposalPubkeyObj = new PublicKey(proposalPubkey);
      const signature = await castVote(wallet, proposalPubkeyObj, selectedChoice);

      if (signature) {
        setTransactionSignature(signature);
      } else {
        setVoteError("Failed to cast vote. Check console for details.");
      }
    } catch (error) {
      setVoteError(`Error casting vote: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div>
      <h2>Vote on Proposal</h2>
      <p>Select a choice and cast your vote:</p>
      <div>
        {choices.map((choice, index) => (
          <div key={index}>
            <input
              type="radio"
              id={`choice-${index}`}
              name="choice"
              value={index}
              checked={selectedChoice === index}
              onChange={() => setSelectedChoice(index)}
            />
            <label htmlFor={`choice-${index}`}>{choice}</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleVote}
        disabled={!wallet || isVoting}
      >
        {isVoting ? 'Casting Vote...' : 'Cast Vote'}
      </button>
      {voteError && <p style={{ color: 'red' }}>{voteError}</p>}
      {transactionSignature && <p>Vote cast! Transaction signature: {transactionSignature}</p>}
    </div>
  );
};

export default VoteOnProposal;
