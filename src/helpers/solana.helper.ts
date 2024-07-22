import { BN, Idl, Program } from "@coral-xyz/anchor";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { IDL, PROGRAM_ID } from "../idl/idl";

export interface Choice {
  label: string;
  count: string;
}

export interface Proposal {
  publicKey: string;
  account: {
      title: string;
      description: string;
      choices: Choice[];
      deadline: string;
  };
}

const connection = new Connection(process.env.REACT_APP_RPC_URL!, "confirmed");
const program = new Program<Idl>(IDL as Idl, PROGRAM_ID, {
    connection,
});

export async function getSolanaBalance(publicKey: string): Promise<number> {
    const balanceInLamports = await connection.getBalance(new PublicKey(publicKey));
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    return balanceInSol;
}

export const getRecentBlockhash = async (): Promise<string | null> => {
    try {
      return (await connection.getLatestBlockhash()).blockhash;
    } catch (error) {
      console.error(error);
      return null;
    }
}

export const createProposal = async (
    wallet: AnchorWallet,
    title: string,
    description: string,
    choices: string[],
    deadline: number
  ): Promise<string | null> => {
    try {
      const tx = await program.methods.create_proposal(title, description, choices, new BN(deadline))
        .accounts({
          proposal: wallet.publicKey,  // This should be a new account for the proposal
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
  
      const recentBlockhash = await getRecentBlockhash();
      if (tx && recentBlockhash) {
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = recentBlockhash;
        const signedTx = await wallet.signTransaction(tx);
        return await connection.sendRawTransaction(signedTx.serialize());
      }
      return null;
    } catch (error) {
      console.error("Error creating proposal:", error);
      return null;
    }
  };

export const rewardContentCreator = async (
  wallet: AnchorWallet,
  recipientPubkey: PublicKey
): Promise<string | null> => {
    try {
        const tx = await program.methods
            .reward_content_creator()
            .accounts({
                user: wallet.publicKey,
                recipient: recipientPubkey,
                systemProgram: SystemProgram.programId,
            })
            .transaction();

        const { blockhash } = await connection.getLatestBlockhash();
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = blockhash;

        const signedTx = await wallet.signTransaction(tx);
        const rawTx = signedTx.serialize();

        const txid = await connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });

        const confirmation = await connection.confirmTransaction(txid, 'confirmed');
        if (confirmation.value.err) {
            console.error("Transaction failed:", confirmation.value.err);
            return null;
        }

        return txid;
    } catch (error) {
        console.error("Error in rewardContentCreator:", error);
        return null;
    }
};

export const fetchAllProposals = async (): Promise<Proposal[]> => {
  try {
      const accounts = await program.account.proposal.all();
      return accounts.map(account => {
          const accountData = account.account as any; // Type assertion
          return {
              publicKey: account.publicKey.toBase58(),
              account: {
                  title: accountData.title as string,
                  description: accountData.description as string,
                  choices: (accountData.choices as any[]).map(choice => ({
                      label: choice.label as string,
                      count: choice.count.toString()
                  })),
                  deadline: accountData.deadline.toString()
              }
          };
      });
  } catch (error) {
      console.error("Error fetching proposals:", error);
      return [];
  }
};

export const voteOnProposal = async (
  wallet: AnchorWallet,
  proposalPubkey: PublicKey,
  choiceIndex: number
): Promise<string | null> => {
  try {
      const [voterPubkey] = PublicKey.findProgramAddressSync(
          [proposalPubkey.toBuffer(), wallet.publicKey.toBuffer()],
          program.programId
      );

      const tx = await program.methods
          .vote(choiceIndex)
          .accounts({
              proposal: proposalPubkey,
              voter: voterPubkey,
              signer: wallet.publicKey,
              systemProgram: SystemProgram.programId,
          })
          .transaction();

      const { blockhash } = await connection.getLatestBlockhash();
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = blockhash;

      const signedTx = await wallet.signTransaction(tx);
      const rawTx = signedTx.serialize();

      const txid = await connection.sendRawTransaction(rawTx, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
      });

      const confirmation = await connection.confirmTransaction(txid, 'confirmed');
      if (confirmation.value.err) {
          console.error("Transaction failed:", confirmation.value.err);
          return null;
      }

      return txid;
  } catch (error) {
      console.error("Error in voteOnProposal:", error);
      return null;
  }
};

export const castVote = async (
    wallet: AnchorWallet,
    proposalPubkey: PublicKey,
    choiceIndex: number
  ): Promise<string | null> => {
    try {
      const [voterPda, _] = PublicKey.findProgramAddressSync(
        [proposalPubkey.toBuffer(), wallet.publicKey.toBuffer()],
        program.programId
      );
  
      const tx = await program.methods.vote(choiceIndex)
        .accounts({
          proposal: proposalPubkey,
          voter: voterPda,
          signer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction();
  
      const recentBlockhash = await getRecentBlockhash();
      if (tx && recentBlockhash) {
        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = recentBlockhash;
        const signedTx = await wallet.signTransaction(tx);
        return await connection.sendRawTransaction(signedTx.serialize());
      }
      return null;
    } catch (error) {
      console.error("Error casting vote:", error);
      return null;
    }
  };
