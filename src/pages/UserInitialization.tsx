import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { initializeUser } from '../helpers/solana.helper';

const UserInitialization: React.FC = () => {
  const wallet = useAnchorWallet();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  const handleInitializeUser = async () => {
    if (!wallet) {
      setInitializationError("Wallet not connected");
      return;
    }

    setIsInitializing(true);
    setInitializationError(null);
    setTransactionSignature(null);

    try {
      console.log("Calling initializeUser...");
      const signature = await initializeUser(wallet);
      console.log("initializeUser returned:", signature);
      if (signature) {
        setTransactionSignature(signature);
        console.log("User initialized successfully:", signature);
      } else {
        setInitializationError("Failed to initialize user. Check console for details.");
      }
    } catch (error) {
      console.error("Error in handleInitializeUser:", error);
      setInitializationError(`Error initializing user: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div>
      <h2>Initialize User</h2>
      <button
        onClick={handleInitializeUser}
        disabled={!wallet || isInitializing}
      >
        {isInitializing ? 'Initializing...' : 'Initialize User'}
      </button>
      {initializationError && (
        <p style={{ color: 'red' }}>{initializationError}</p>
      )}
      {transactionSignature && (
        <p>Initialization successful! Transaction signature: {transactionSignature}</p>
      )}
    </div>
  );
};

export default UserInitialization;
