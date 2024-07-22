import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { createProposal } from '../helpers/solana.helper';

const CreateProposal: React.FC = () => {
  const wallet = useAnchorWallet();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [choices, setChoices] = useState<string[]>(['']);
  const [deadline, setDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const handleCreateProposal = async () => {
    if (!wallet) {
      setCreateError("Wallet not connected");
      return;
    }

    if (!title || !description || choices.length === 0 || !deadline) {
      setCreateError("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setTransactionSignature(null);

    try {
      const deadlineTimestamp = new Date(deadline).getTime() / 1000; // Convert to UNIX timestamp
      const signature = await createProposal(wallet, title, description, choices, deadlineTimestamp);

      if (signature) {
        setTransactionSignature(signature);
      } else {
        setCreateError("Failed to create proposal. Check console for details.");
      }
    } catch (error) {
      setCreateError(`Error creating proposal: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
  };

  const addChoice = () => setChoices([...choices, '']);
  const removeChoice = (index: number) => {
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
  };

  return (
    <div>
      <h2>Create Proposal</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div>
        <h3>Choices</h3>
        {choices.map((choice, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Choice ${index + 1}`}
              value={choice}
              onChange={(e) => handleChoiceChange(index, e.target.value)}
            />
            <button onClick={() => removeChoice(index)}>Remove</button>
          </div>
        ))}
        <button onClick={addChoice}>Add Choice</button>
      </div>
      <input
        type="datetime-local"
        placeholder="Deadline"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />
      <button
        onClick={handleCreateProposal}
        disabled={!wallet || isCreating}
      >
        {isCreating ? 'Creating Proposal...' : 'Create Proposal'}
      </button>
      {createError && <p style={{ color: 'red' }}>{createError}</p>}
      {transactionSignature && <p>Proposal created! Transaction signature: {transactionSignature}</p>}
    </div>
  );
};

export default CreateProposal;
