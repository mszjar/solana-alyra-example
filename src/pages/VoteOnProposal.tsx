import React, { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { fetchAllProposals, voteOnProposal, Proposal } from '../helpers/solana.helper';

const VoteOnProposal: React.FC = () => {
  const wallet = useAnchorWallet();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  useEffect(() => {
    const loadProposals = async () => {
      const fetchedProposals = await fetchAllProposals();
      setProposals(fetchedProposals);
    };
    loadProposals();
  }, []);

  const handleProposalSelect = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setSelectedChoice(null);
    setVoteError(null);
    setTransactionSignature(null);
  };

  const handleVote = async () => {
    if (!wallet || !selectedProposal || selectedChoice === null) {
      setVoteError("Please connect wallet, select a proposal, and choose an option");
      return;
    }

    setIsVoting(true);
    setVoteError(null);
    setTransactionSignature(null);

    try {
      const proposalPubkey = new PublicKey(selectedProposal.publicKey);
      const signature = await voteOnProposal(wallet, proposalPubkey, selectedChoice);

      if (signature) {
        setTransactionSignature(signature);
        // Refresh proposals after successful vote
        const updatedProposals = await fetchAllProposals();
        setProposals(updatedProposals);
      } else {
        setVoteError("Failed to submit vote. Check console for details.");
      }
    } catch (error) {
      setVoteError(`Error submitting vote: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div>
      <h2>Vote on Proposals</h2>
      <div>
        <h3>Select a Proposal:</h3>
        {proposals.map((proposal) => (
          <button
            key={proposal.publicKey}
            onClick={() => handleProposalSelect(proposal)}
            style={{ backgroundColor: selectedProposal?.publicKey === proposal.publicKey ? 'lightblue' : 'white' }}
          >
            {proposal.account.title}
          </button>
        ))}
      </div>
      {selectedProposal && (
        <div>
          <h3>{selectedProposal.account.title}</h3>
          <p>{selectedProposal.account.description}</p>
          <h4>Choose an option:</h4>
          {selectedProposal.account.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => setSelectedChoice(index)}
              style={{ backgroundColor: selectedChoice === index ? 'lightgreen' : 'white' }}
            >
              {choice.label} (Votes: {choice.count})
            </button>
          ))}
          <button onClick={handleVote} disabled={!wallet || isVoting || selectedChoice === null}>
            {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </div>
      )}
      {voteError && <p style={{ color: 'red' }}>{voteError}</p>}
      {transactionSignature && <p>Vote submitted! Transaction signature: {transactionSignature}</p>}
    </div>
  );
};

export default VoteOnProposal;
