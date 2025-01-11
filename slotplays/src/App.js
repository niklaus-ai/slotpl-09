import './App.css';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import React, { useMemo } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import GameInterface from './Components/GameInterfrence';
import UserStatistics from './Components/UserStatistics';
import WalletConnect from './Components/WalletConnection';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import logo from "./assets/logo12.png";

require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=31722f48-cf67-4177-9131-0be10384530b";

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <div className="homepage-container min-h-screen w-full bg-black">
              <div className="p-6">
                <Navbar />
                <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6"></h1>

                <div className="max-w-6xl mx-auto space-y-6">
                  <Routes>
                    <Route path="/" element={<GameInterface />} />
                  </Routes>
                  <UserStatistics />
                </div>
              </div>
            </div>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-gray-800 via-gray-900 to-black p-4 flex items-center justify-between shadow-lg rounded-lg">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex items-center  space-x-4">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-full" />
          <span className="text-sky-400 font-extrabold text-3xl drop-shadow-lg">
            SlotPlay
          </span>
        </div>
        <div>
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default App;

