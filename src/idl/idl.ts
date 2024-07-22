import { PublicKey } from "@solana/web3.js";

export const IDL = {
  version: "0.1.0",
  name: "mescena",
  instructions: [
    {
      name: "submitProposal",
      accounts: [
        { name: "proposal", isMut: true, isSigner: true },
        { name: "creator", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "description", type: "string" },
        { name: "choices", type: "bool" },
      ],
    },
    {
      name: "rewardContentCreator",
      accounts: [
        { name: "user", isMut: true, isSigner: true },
        { name: "recipient", isMut: true, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "voteProposal",
      accounts: [
        { name: "user", isMut: true, isSigner: false },
        { name: "proposal", isMut: true, isSigner: false },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "User",
      type: {
        kind: "struct",
        fields: [
          { name: "isContentCreator", type: "bool" },
          { name: "rewards", type: "u64" },
          { name: "votedProposals", type: { vec: "publicKey" } },
        ],
      },
    },
    {
      name: "Proposal",
      type: {
        kind: "struct",
        fields: [
          { name: "description", type: "string" },
          { name: "creator", type: "publicKey" },
          { name: "isInitialized", type: "bool" },
          { name: "votes", type: "u64" },
          { name: "choices", type: "bool" },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AlreadyVoted",
      msg: "User has already voted on this proposal.",
    },
    { code: 6001, name: "InsufficientFunds", msg: "Insufficient funds." },
    {
      code: 6002,
      name: "NotContentCreator",
      msg: "User is not a content creator.",
    },
    { code: 6003, name: "InvalidOwner", msg: "Invalid owner." },
  ],
};
export const PROGRAM_ID = new PublicKey(
  "74oXqeNjUuheobfCu37hYTLpNzZBmHS5ogGAu2jT39X4"
);

