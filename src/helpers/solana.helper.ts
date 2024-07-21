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
  recipientPubkey: PublicKey
): Promise<string | null> => {
    try {
        const tx = await program.methods
            .rewardContentCreator()
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
