import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Mine from './components/Mine';
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Connection } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import Transactions from './components/Transactions';


function App() {

  useEffect(() => {
    const disableRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', disableRightClick);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
    };
  }, []);


  const network = WalletAdapterNetwork.Devnet;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (

    <ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={[]} autoConnect>
    <WalletModalProvider>
      {/* <div 
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "10px",
          zIndex: 1000, // Ensure high z-index for the wallet buttons
          position: "absolute", // Fixed positioning to keep it on top
          top: 0, 
          backgroundColor: "#1a2c38", 
          width: "100%" ,
          zIndex: 1100
        }}
      >
        <WalletMultiButton style={{ zIndex: 1100 }} /> 
        <WalletDisconnectButton style={{ marginLeft: "10px", zIndex: 1100 }} />
      </div> */}
      
      {/* Main content of the app */}
      <div className='' style={{position:"absolute", zIndex: 1, backgroundColor:"#1a2c38" }}> {/* Content behind wallet buttons */}
        <div className='flex justify-between absolute w-screen p-3'>
          <WalletMultiButton style={{ zIndex: 1100, left:0 }} /> 
          <WalletDisconnectButton style={{ marginLeft: "10px", zIndex: 1100, right:0 }} />
        </div>
        <Router>
          <Routes>
            <Route path='/' element={<Mine />}/>
            <Route path='tran' element={<Transactions/>}/>
          </Routes>
        </Router>
        <footer className="bg-#1a2c38 text-white py-6 px-4 text-center">
          <div className="container mx-auto">
            <p className="text-lg font-semibold italic">"Code never sleeps, but I do... sometimes."</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="https://www.linkedin.com/in/pritam-p-012561253/" className="hover:text-gray-400" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="https://twitter.com/your-profile" className="hover:text-gray-400" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
              <a href="https://github.com/PritamP20" className="hover:text-gray-400" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </footer>


      </div>
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>




    
  )
}

export default App
