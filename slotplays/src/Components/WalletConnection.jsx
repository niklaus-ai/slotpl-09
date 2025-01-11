
import { Buffer } from 'buffer';
window.Buffer = Buffer.Buffer;
import React, { useState, useEffect } from 'react';
import bs58 from 'bs58';
import './wallet.css';
import { Connection, PublicKey, Transaction,clusterApiUrl, SystemProgram,Keypair } from '@solana/web3.js';
// import { TOKEN ,TOKEN_PROGRAM_ID } from '@solana/spl-token'; 
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';



// Ensure Buffer is available in the window object for the browser environment


const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [availableWallets, setAvailableWallets] = useState([]);
  const [balance, setBalance] = useState(null);

  const apiBaseUrl = 'http://localhost:8000/api/users'; 

  useEffect(() => {
    // Detect available wallets in the user's browser
    const { solana } = window;
    const detectedWallets = [];

    if (solana) {
      if (solana.isPhantom) {
        detectedWallets.push('Phantom');
      }
      if (solana.isSolflare) {
        detectedWallets.push('Solflare');
      }
      if (window.sollet) {
        detectedWallets.push('Sollet');
      }
    }

    setAvailableWallets(detectedWallets);
  }, []);

  const fetchBalance = async (walletAddress) => {
    try {
      const res = await fetch(`${apiBaseUrl}/getBalance/${walletAddress}`);
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      } else {
        console.error('Failed to fetch balance:', await res.json());
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const promptWalletChoice = () => {
    const choice = window.confirm('Do you want to connect to Phantom or Solflare wallet?');
    if (choice) {
      const selectedWallet = window.prompt('Please type Phantom or Solflare to select your wallet:');
      if (selectedWallet === 'Phantom' || selectedWallet === 'Solflare') {
        connectWallet(selectedWallet);
      } else {
        alert('Invalid wallet selected. Please choose either Phantom or Solflare.');
      }
    } else {
      alert('You chose not to connect a wallet.');
    }
  };

  const connectWallet = async (wallet) => {
    try {
      const { solana } = window;

      // Check if the solana object is available
      if (!solana) {
        console.error('Solana Wallet not found! Please install a supported wallet.');
        alert('Solana Wallet not found! Please install a supported wallet.');
        return;
      }

      // Handle Phantom wallet
      if (wallet === 'Phantom' && solana.isPhantom) {
        const response = await solana.connect();
        const walletAddress = response.publicKey.toString();
        setWalletAddress(walletAddress);
        setConnectedWallet('Phantom');

        // Send wallet info to the backend
        await sendWalletInfoToBackend(walletAddress);
        onConnect(walletAddress);
        fetchBalance(walletAddress);
      }

      // Handle Solflare wallet
      else if (wallet === 'Solflare' && solana.isSolflare) {
        const response = await solana.connect();
        const walletAddress = response.publicKey.toString();
        setWalletAddress(walletAddress);
        setConnectedWallet('Solflare');

        // Send wallet info to the backend
        await sendWalletInfoToBackend(walletAddress);
        onConnect(walletAddress);
        fetchBalance(walletAddress);
      }

      // Handle Sollet wallet
      else if (wallet === 'Sollet' && window.sollet) {
        const sollet = window.open('https://www.sollet.io', '_blank');
        alert('Sollet wallet connection requires manual setup.');
        sollet.focus();
      }

      // Handle unsupported wallet type
      else {
        alert(`${wallet} Wallet not supported.`);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('An error occurred while connecting the wallet. Please try again.');
    }
  };

  const sendWalletInfoToBackend = async (walletAddress) => {
    try {
      const res = await fetch(`${apiBaseUrl}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, publicKey: walletAddress }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      } else {
        const errorData = await res.json();
        console.error('Failed to connect wallet:', errorData);
        alert('Failed to connect wallet to the backend.');
      }
    } catch (error) {
      console.error('Error sending wallet info to backend:', error);
    }
  };


  
  const handleDeposit = async () => {
    const amount = prompt("Enter amount to deposit (in $SLOT token):");
    if (!amount) return;
  
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Invalid or negative amount entered.");
      return;
    }
  
    try {
      if (!walletAddress) {
        throw new Error("Wallet not connected!");
      }
  
      const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=31722f48-cf67-4177-9131-0be10384530b", "confirmed");
      const slotTokenMintAddress = new PublicKey("7xX4P4Pqp18a1JGiAvKKD1nto38DHdtqi1jkBKHHpump");
      const senderPublicKey = new PublicKey(walletAddress);
      const recipientWalletAddress = new PublicKey("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
  
      console.log("Connection:", connection);
      console.log("Sender Public Key:", senderPublicKey.toString());
      console.log("Recipient Wallet Address:", recipientWalletAddress.toString());
      console.log("Slot Token Mint Address:", slotTokenMintAddress.toString());
      const payer = Keypair.fromSecretKey(senderPublicKey);

      // const payer = Keypair.fromSecretKey('38x61Kvo9k51NrKfon3eRUqXc6BPKjELRM5UbKSppUabfwsLBYLLRtLv6rjDfhgWkFnPgrN6YdbfWV2zKfvj5vFW');
      const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        slotTokenMintAddress,
        senderPublicKey
      );
      console.log("senderToken",senderTokenAccount)
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        senderPublicKey,
        slotTokenMintAddress,
        recipientWalletAddress
      );
  
      if (!senderTokenAccount || !recipientTokenAccount) {
        throw new Error("Token accounts could not be created or found.");
      }
  
      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          senderPublicKey,
          amountValue * 10 ** 6,
          [],
          TOKEN_PROGRAM_ID
        )
      );
  
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPublicKey;
  
      const { solana } = window;
      if (!solana || !solana.isPhantom) {
        throw new Error("Phantom wallet not detected!");
      }
  
      const signedTransaction = await solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
      });
  
      await connection.confirmTransaction(signature, "processed");
      alert(`Transaction successful! Signature: ${signature}`);
    } catch (error) {
      console.error("Error during deposit:", error);
      alert("An error occurred while processing the deposit.");
    }
  };
  
  


  const handleWithdraw = async () => {
    const amount = prompt('Enter amount to withdraw:');
    if (!amount) return;

    try {
      const res = await fetch(`${apiBaseUrl}/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          amount: parseFloat(amount),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Withdrawal successful! New balance: ${data.balance}`);
        setBalance(data.balance);
      } else {
        console.error('Withdrawal failed:', await res.json());
      }
    } catch (error) {
      console.error('Error withdrawing funds:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setConnectedWallet(null);
    setBalance(null);
    onDisconnect();
  };

  return (
    <nav className='wallet-section'>
      <div className='wallet-actions'>
        {!walletAddress ? (
          <button className='wallet-button' onClick={promptWalletChoice}>
            Connect Wallet
          </button>
        ) : (
          <div className='wallet-connected'>
            <p className='wallet-info'>Connected with: {connectedWallet}</p>
            <p className='wallet-info'>Address: {walletAddress}</p>
            <p className='wallet-info'>Balance: {balance || 0} $SLOT</p>
            <button className='action-button deposit' onClick={handleDeposit}>
              Deposit
            </button>
            <button className='action-button withdraw' onClick={handleWithdraw}>
              Withdraw
            </button>
            <button className='action-button disconnect' onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default WalletConnect;
