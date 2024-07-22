import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { createProposal } from '../helpers/solana.helper';

const CreateProposal: React.FC = () => {
  const wallet = useAnchorWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [choices, setChoices] = useState<string[]>(['', '']);
  const [deadline, setDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalAddress, setProposalAddress] = useState<string | null>(null);

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) {
      setError("Wallet not connected");
      return;
    }

    setIsCreating(true);
    setError(null);
    setProposalAddress(null);

    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      const validChoices = choices.filter(choice => choice.trim() !== '');

      if (validChoices.length < 2) {
        throw new Error("At least two valid choices are required");
      }

      const result = await createProposal(
        wallet,
        title,
        description,
        validChoices,
        deadlineTimestamp
      );

      if (result) {
        setProposalAddress(result);
        // Reset form
        setTitle('');
        setDescription('');
        setChoices(['', '']);
        setDeadline('');
      } else {
        throw new Error("Failed to create proposal. Check console for details.");
      }
    } catch (error) {
      console.error("Error in createProposal:", error);
      setError(`Error creating proposal: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <h2>Create New Proposal</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Choices:</label>
          {choices.map((choice, index) => (
            <div key={index}>
              <input
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                required
              />
            </div>
          ))}
          <button type="button" onClick={handleAddChoice}>Add Choice</button>
        </div>
        <div>
          <label htmlFor="deadline">Deadline:</label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={!wallet || isCreating}>
          {isCreating ? 'Creating Proposal...' : 'Create Proposal'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {proposalAddress && <p>Proposal created! Address: {proposalAddress}</p>}
    </div>
  );
};

export default CreateProposal;
