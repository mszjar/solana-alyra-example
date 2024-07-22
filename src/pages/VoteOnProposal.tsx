import React, { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { fetchAllProposals, voteOnProposal, Proposal } from '../helpers/solana.helper';
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

import './VoteOnProposal.css';

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
      if (fetchedProposals.length > 0) {
        const randomProposal = fetchedProposals[Math.floor(Math.random() * fetchedProposals.length)];
        setSelectedProposal(randomProposal);
      }
    };
    loadProposals();
  }, []);

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
    <div className="vote-on-proposal">
      <h2>Proposition de vote</h2>
      {selectedProposal && (
        <div className="proposal-container">
          <h3>Titre : {selectedProposal.account.title}</h3>
          <p>{selectedProposal.account.description}</p>
          <h4>Vos options de vote :</h4>
          <div className="choices-container">
            {selectedProposal.account.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => setSelectedChoice(index)}
                className={`choice-button ${selectedChoice === index ? 'selected' : ''}`}
              >
                {choice.label} (Votes: {choice.count})
              </button>
            ))}
          </div>
          <button className="submit-vote-button" onClick={handleVote} disabled={!wallet || isVoting || selectedChoice === null}>
            {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </div>
      )}
      {voteError && <p className="error-message">{voteError}</p>}
      {transactionSignature && 
        <div className="success-message">
          <h4>
            A Voté! 
          </h4>
          <div className="transaction-container">
            <p className="transaction">Transaction signature: <small>{transactionSignature}</small></p>
            <a href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer">
              <FaArrowUpRightFromSquare title='External link' />
            </a>
          </div>
        </div>
      }
    </div>
  );
};

export default VoteOnProposal;


