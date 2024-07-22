import { useAnchorWallet } from "@solana/wallet-adapter-react";
import RewardContentCreator from "./RewardContentCreator";
import VoteOnProposal from "./VoteOnProposal";

export function Dashboard() {

    const anchorWallet = useAnchorWallet();

    return (
        <div>
            {
                anchorWallet?.publicKey ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <p>
                        Connected to wallet: <b>{anchorWallet.publicKey.toBase58()}</b>
                        </p>
                        <RewardContentCreator/>
                        <VoteOnProposal/>
                    </div>
                ) : (
                    <div>
                    <h1>Solana React Exemple</h1>
                    <p>
                        Cliquer sur le bouton "Connect Wallet" pour connecter votre wallet Solana.
                    </p>
                    </div>
                )
            }
        </div>
    );
}
