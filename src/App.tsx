import './App.css';

import { Route, Routes } from "react-router-dom";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Dashboard } from './pages/Dashboard';
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getSolanaBalance } from './helpers/solana.helper';

import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Video from "./pages/video/Video";

function App() {

  const wallet = useWallet();
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (wallet.publicKey) {
      getSolanaBalance(wallet.publicKey.toBase58())
        .then((balance) => setSolanaBalance(balance));
    } else {
      setSolanaBalance(null);
    }
  }, [wallet.publicKey]);

  return (
    <div className="App">
      {/* <div className="header">
        <div className='wallet'>
          {
            solanaBalance !== null && 
            (
              <div>
                <p>Balance: {solanaBalance} SOL</p>
              </div>
            )
          }
          <WalletMultiButton></WalletMultiButton>
        </div>
      </div> */}
      <Navbar setSidebarOpen={setSidebarOpen} solanaBalance={solanaBalance}></Navbar>
      <Routes>
              <Route
                path="/"
                element={<Home sidebarOpen={sidebarOpen}></Home>}
              />
              <Route
                path="/video/:categoryId/:videoId"
                element={<Video></Video>}
              />
            </Routes>
      <Dashboard />
    </div>
  );
}

export default App;
