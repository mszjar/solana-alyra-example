import { BN, Idl, Program } from "@coral-xyz/anchor";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { IDL, PROGRAM_ID } from "../idl/idl";

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

export const initializeUser = async (wallet: AnchorWallet): Promise<string | null> => {
  try {
      console.log("Starting user initialization...");
      console.log("Wallet public key:", wallet.publicKey.toBase58());
      console.log("Program ID:", PROGRAM_ID.toBase58());

      const tx = await program.methods.initializeUser()
          .accounts({
              user: wallet.publicKey,
              userSigner: wallet.publicKey,
              systemProgram: SystemProgram.programId,
          })
          .transaction();

      console.log("Transaction created");

      const recentBlockhash = await getRecentBlockhash();
      if (!recentBlockhash) {
          console.error("Failed to get recent blockhash");
          return null;
      }
      console.log("Recent blockhash:", recentBlockhash);

      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = recentBlockhash;

      console.log("Transaction prepared, sending to wallet for signing...");
      const signedTx = await wallet.signTransaction(tx);

      console.log("Transaction signed, submitting to network...");
      const rawTx = signedTx.serialize();

      const txid = await connection.sendRawTransaction(rawTx, {
          skipPreflight: false,
          preflightCommitment: 'confirmed'
      });

      console.log("Transaction submitted, signature:", txid);

      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction(txid, 'confirmed');

      if (confirmation.value.err) {
          console.error("Transaction failed:", confirmation.value.err);
          return null;
      }

      console.log("Transaction confirmed successfully");
      return txid;
  } catch (error) {
      console.error("Error in initializeUser:");
      if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
      } else {
          console.error("Unknown error:", error);
      }
      return null;
  }
};
export const submitProposal = async (wallet: AnchorWallet, description: string): Promise<string | null> => {
    try {
        const tx = await program.methods.submitProposal(description)
            .accounts({
                proposal: wallet.publicKey,
                creator: wallet.publicKey,
                creatorUser: wallet.publicKey,
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
        console.error("Error submitting proposal:", error);
        return null;
    }
};

export const rewardContentCreator = async (
  wallet: AnchorWallet,
  contentCreatorPubkey: PublicKey,
  amount: number
): Promise<string | null> => {
    try {
        console.log("Starting reward content creator process...");
        console.log("Wallet public key:", wallet.publicKey.toBase58());
        console.log("Content creator public key:", contentCreatorPubkey.toBase58());
        console.log("Amount:", amount);

        console.log("Creating transaction...");
        const tx = await program.methods.rewardContentCreator(new BN(amount))
            .accounts({
                user: wallet.publicKey,
                contentCreator: contentCreatorPubkey,
                systemProgram: SystemProgram.programId,
            })
            .transaction();

        console.log("Transaction created successfully");

        console.log("Getting recent blockhash...");
        const recentBlockhash = await getRecentBlockhash();
        if (!recentBlockhash) {
            console.error("Failed to get recent blockhash");
            return null;
        }
        console.log("Recent blockhash obtained:", recentBlockhash);

        tx.feePayer = wallet.publicKey;
        tx.recentBlockhash = recentBlockhash;

        console.log("Transaction prepared, sending to wallet for signing...");
        const signedTx = await wallet.signTransaction(tx);

        console.log("Transaction signed, submitting to network...");
        const rawTx = signedTx.serialize();

        const txid = await connection.sendRawTransaction(rawTx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });

        console.log("Transaction submitted, signature:", txid);

        // Wait for transaction confirmation
        console.log("Waiting for transaction confirmation...");
        const confirmation = await connection.confirmTransaction(txid, 'confirmed');

        if (confirmation.value.err) {
            console.error("Transaction failed:", confirmation.value.err);
            return null;
        }

        console.log("Transaction confirmed successfully");
        return txid;
    } catch (error) {
        console.error("Error in rewardContentCreator:");
        if (error instanceof Error) {
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        } else {
            console.error("Unknown error:", error);
        }
        return null;
    }
};

export const voteProposal = async (wallet: AnchorWallet, proposalPubkey: PublicKey): Promise<string | null> => {
    try {
        const tx = await program.methods.voteProposal()
            .accounts({
                user: wallet.publicKey,
                proposal: proposalPubkey,
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
        console.error("Error voting on proposal:", error);
        return null;
    }
};
