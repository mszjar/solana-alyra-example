import React, { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { createProposal } from "../helpers/solana.helper";
import "./CreateProposal.css";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const CreateProposal: React.FC = () => {
  const wallet = useAnchorWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [choices, setChoices] = useState<string[]>(["", ""]);
  const [deadline, setDeadline] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalAddress, setProposalAddress] = useState<string | null>(null);

  const handleAddChoice = () => {
    setChoices([...choices, ""]);
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
      const validChoices = choices.filter((choice) => choice.trim() !== "");

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
        setTitle("");
        setDescription("");
        setChoices(["", ""]);
        setDeadline("");
      } else {
        throw new Error(
          "Failed to create proposal. Check console for details."
        );
      }
    } catch (error) {
      console.error("Error in createProposal:", error);
      setError(
        `Error creating proposal: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-proposal">
      <h2>Créer une proposition de vote</h2>
      <form onSubmit={handleSubmit} className="create-proposal-form">
        <div className="form-group">
          <label htmlFor="title">Titre:</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isCreating}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={isCreating}
          />
        </div>
        <div className="form-group">
          <label>Choix:</label>
          {choices.map((choice, index) => (
            <div key={index} className="choice-input">
              <input
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`Choice ${index + 1}`}
                required
                disabled={isCreating}
              />
              {index > 1 && (
                <button
                  type="button"
                  className="remove-choice"
                  onClick={() =>
                    setChoices(choices.filter((_, i) => i !== index))
                  }
                  disabled={isCreating}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddChoice} disabled={isCreating}>
            Ajouter un choix
          </button>
        </div>
        <div className="form-group">
          <label htmlFor="deadline">Deadline:</label>
          <input
            id="deadline"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            disabled={isCreating}
          />
        </div>
        <button type="submit" disabled={!wallet || isCreating}>
          {isCreating ? "Création en cours..." : "Créer la proposition"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {proposalAddress && (
        <div className="success-message">
          <h4>Propositon créée avec succès! </h4>
          <strong>Address:</strong> {proposalAddress}
          <a
            href={`https://explorer.solana.com/tx/${proposalAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaArrowUpRightFromSquare title="External link" />
          </a>
        </div>
      )}
    </div>
  );
};

export default CreateProposal;
