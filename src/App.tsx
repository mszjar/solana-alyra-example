import "./App.css";

import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getSolanaBalance } from "./helpers/solana.helper";

import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import Video from "./pages/video/Video";

function App() {
  const wallet = useWallet();
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (wallet.publicKey) {
      getSolanaBalance(wallet.publicKey.toBase58()).then((balance) =>
        setSolanaBalance(balance)
      );
    } else {
      setSolanaBalance(null);
    }
  }, [wallet.publicKey]);

  return (
    <div className="App">
      <Navbar
        setSidebarOpen={setSidebarOpen}
        solanaBalance={solanaBalance}
      ></Navbar>
      <Routes>
        <Route path="/" element={<Home sidebarOpen={sidebarOpen}></Home>} />
        <Route path="/video/:categoryId/:videoId" element={<Video></Video>} />
      </Routes>
    </div>
  );
}

export default App;
