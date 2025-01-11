import "./wallet.css";

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import Modal from "./Modal";
import { useWallet } from "@solana/wallet-adapter-react";

/**
 * Formats a number with K, M, B, T suffixes for readability.
 * @param {number} amount - The amount to format.
 * @returns {string} Formatted amount string.
 */
function formatAmount(amount) {
  if (isNaN(amount) || amount < 0) return "0.00";
  if (amount >= 1e12) return (amount / 1e12).toFixed(2) + "T";
  if (amount >= 1e9) return (amount / 1e9).toFixed(2) + "B";
  if (amount >= 1e6) return (amount / 1e6).toFixed(2) + "M";
  if (amount >= 1e3) return (amount / 1e3).toFixed(2) + "K";
  return amount.toFixed(2);
}

// Constants for token and recipient addresses
const TOKEN_MINT_ADDRESS = new PublicKey(
  "7xX4P4Pqp18a1JGiAvKKD1nto38DHdtqi1jkBKHHpump"
);
const RECIPIENT_WALLET = new PublicKey(
  "EqBv4c7JMbiKjxCRv5AedMLNoZCwEgjDbn9CSs51jGni"
);

const apiBaseUrl = "http://localhost:8000/api/users";

/**
 * WalletConnect Component
 * Manages wallet connection, balance display, and token transactions.
 */
const WalletConnect = () => {
  // Wallet adapter hooks
  const {
    publicKey,
    sendTransaction,
    wallet,
    select,
    wallets,
    connected,
    disconnect,
  } = useWallet();

  // State management
  const [backendBalance, setBackendBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [isPercentage, setIsPercentage] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [isConnected, setIsConnected] = useState(false);
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=31722f48-cf67-4177-9131-0be10384530b";

  // Create Solana connection
  const connection = useMemo(() => new Connection(endpoint), []);

  /**
   * Resets the component state.
   */
  const resetState = useCallback(() => {
    setTransactionAmount("");
    setIsPercentage(false);
    setActiveTab("deposit");
    setModalContent(null);
  }, []);

  /**
   * Connects the wallet to the backend.
   * @param {string} walletAddress - The wallet address to connect.
   * @param {string} publicKey - The public key of the wallet.
   */
  const connectWallet = useCallback(async (walletAddress, publicKey) => {
    try {
      const res = await fetch(`${apiBaseUrl}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, publicKey }),
      });

      if (res.ok) {
        const data = await res.json();
        setBackendBalance(parseFloat(data.balance) || 0);
        setIsConnected(true);
        return data;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }, []);

  /**
   * Fetches the wallet balance from the blockchain.
   */
  const fetchWalletBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey,
          TOKEN_MINT_ADDRESS,
          publicKey
        );
        const accountInfo = await connection.getTokenAccountBalance(tokenAccount.address);
        setWalletBalance(parseFloat(accountInfo.value.uiAmount) || 0);
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        setWalletBalance(0);
      }
    }
  }, [connection, publicKey]);

  /**
   * Fetches the backend balance for the connected wallet.
   */
  const fetchBackendBalance = useCallback(async () => {
    if (publicKey) {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/getBalance/${publicKey.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBackendBalance(parseFloat(data.balance) || 0);
        } else {
          throw new Error("Failed to fetch balance");
        }
      } catch (error) {
        console.error("Error fetching backend balance:", error);
        setBackendBalance(0);
      } finally {
        setIsLoading(false);
      }
    }
  }, [publicKey]);

  // Effect to handle wallet connection and initial balance fetching
  useEffect(() => {
    if (connected && publicKey) {
      connectWallet(publicKey.toString(), publicKey.toString())
        .then(() => {
          fetchWalletBalance();
          fetchBackendBalance();
        })
        .catch((error) => {
          console.error("Error in initial connection:", error);
          setModalContent({
            title: "Connection Error",
            content: `Failed to connect: ${error.message}`,
          });
          setShowModal(true);
        });
    } else {
      setIsConnected(false);
      setBackendBalance(0);
      setWalletBalance(0);
    }
  }, [connected, publicKey, connectWallet, fetchWalletBalance, fetchBackendBalance]);

  // Effect to update wallet balance when publicKey changes
  useEffect(() => {
    if (publicKey) {
      fetchWalletBalance();
    }
  }, [publicKey, fetchWalletBalance]);

  /**
   * Handles the wallet connection process.
   */
  const handleConnect = useCallback(async () => {
    if (wallets.length > 0) {
      try {
        await select(wallets[0].adapter.name);
        // The actual connection will be handled in the useEffect hook
      } catch (error) {
        console.error("Error selecting wallet:", error);
        setModalContent({
          title: "Connection Failed",
          content: `An error occurred while selecting the wallet: ${error.message}`,
        });
        setShowModal(true);
      }
    } else {
      setModalContent({
        title: "No Wallet Found",
        content: "Please install a Solana wallet extension to continue.",
      });
      setShowModal(true);
    }
  }, [select, wallets]);

  /**
   * Handles the wallet disconnection process.
   */
  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsConnected(false);
    setBackendBalance(0);
    setWalletBalance(0);
    setShowModal(false);
    resetState();
  }, [disconnect, resetState]);

  /**
   * Handles the deposit process.
   */
  const handleDeposit = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const amount = isPercentage
        ? (parseFloat(transactionAmount) / 100) * walletBalance
        : parseFloat(transactionAmount);

      // Check if the sender's token account exists
      let senderTokenAccount;
      try {
        senderTokenAccount = await getAccount(connection, await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, publicKey));
      } catch (error) {
        if (error.name === 'TokenAccountNotFoundError') {
          // If the account doesn't exist, create it
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, publicKey),
              publicKey,
              TOKEN_MINT_ADDRESS
            )
          );
          const signature = await sendTransaction(transaction, connection);
          await connection.confirmTransaction(signature, 'confirmed');
          senderTokenAccount = await getAccount(connection, await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, publicKey));
        } else {
          throw error;
        }
      }

      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        TOKEN_MINT_ADDRESS,
        RECIPIENT_WALLET
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          publicKey,
          BigInt(Math.floor(amount * 1e6)),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "processed");

      // Call backend to process deposit
      const res = await fetch(`${apiBaseUrl}/deposit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: amount,
          signature: signature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBackendBalance(parseFloat(data.balance) || 0);
        setModalContent({
          title: "Deposit Successful",
          content: `Deposited ${amount.toFixed(6)} $SLOT. New balance: ${
            data.balance
          } $SLOT`,
        });
      } else {
        const errorData = await res.json();
        setModalContent({
          title: "Deposit Failed",
          content: `An error occurred: ${errorData.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      setModalContent({
        title: "Deposit Failed",
        content: `An error occurred: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
      setShowModal(true);
      await fetchWalletBalance();
      fetchBackendBalance();
    }
  }, [
    publicKey,
    connection,
    sendTransaction,
    fetchWalletBalance,
    fetchBackendBalance,
    transactionAmount,
    isPercentage,
    walletBalance,
  ]);

  /**
   * Handles the withdrawal process.
   */
  const handleWithdraw = useCallback(async () => {
    if (!publicKey) return;

    setIsLoading(true);
    try {
      const amount = isPercentage
        ? (parseFloat(transactionAmount) / 100) * backendBalance
        : parseFloat(transactionAmount);

      const res = await fetch(`${apiBaseUrl}/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          amount: amount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBackendBalance(parseFloat(data.balance) || 0);
        setModalContent({
          title: "Withdrawal Successful",
          content: `Withdrawal of ${amount.toFixed(
            6
          )} $SLOT completed. New balance: ${data.balance} $SLOT`,
        });
      } else {
        const errorData = await res.json();
        setModalContent({
          title: "Withdrawal Failed",
          content: `An error occurred: ${errorData.error || "Unknown error"}`,
        });
      }
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      setModalContent({
        title: "Withdrawal Failed",
        content: `An error occurred: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
      setShowModal(true);
      await fetchWalletBalance();
      fetchBackendBalance();
    }
  }, [
    publicKey,
    fetchWalletBalance,
    fetchBackendBalance,
    transactionAmount,
    isPercentage,
    backendBalance,
  ]);

  /**
   * Handles input changes for transaction amount.
   * @param {string} value - The new input value.
   */
  const handleInputChange = (value) => {
    if (isPercentage) {
      if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
        setTransactionAmount(value);
      }
    } else {
      const maxBalance = activeTab === "deposit" ? walletBalance : backendBalance;
      if (value === "" || (parseFloat(value) >= 0 && parseFloat(value) <= maxBalance)) {
        setTransactionAmount(value);
      }
    }
  };

  /**
   * Handles percentage button clicks.
   * @param {number} percent - The percentage value clicked.
   */
  const handlePercentageClick = (percent) => {
    setIsPercentage(true);
    setTransactionAmount(percent.toString());
  };

  /**
   * Toggles between percentage and amount input types.
   */
  const toggleInputType = () => {
    if (transactionAmount !== "") {
      const currentBalance = activeTab === "deposit" ? walletBalance : backendBalance;
      if (isPercentage) {
        // Convert from percentage to amount
        const amount = (parseFloat(transactionAmount) / 100) * currentBalance;
        setTransactionAmount(amount.toFixed(6));
      } else {
        // Convert from amount to percentage
        const percentage = (parseFloat(transactionAmount) / currentBalance) * 100;
        setTransactionAmount(percentage.toFixed(2));
      }
    }
    setIsPercentage(!isPercentage);
  };

  // Memoized percentage buttons data
  const percentageButtons = useMemo(() => {
    const percentages = [25, 50, 75, 100];
    const currentBalance = activeTab === "deposit" ? walletBalance : backendBalance;
    return percentages.map((percent) => ({
      percent,
      amount: ((percent / 100) * currentBalance).toFixed(6),
    }));
  }, [activeTab, walletBalance, backendBalance]);

  /**
   * Renders the wallet content inside the modal.
   */
  const renderWalletContent = () => (
    <div className="wallet-connected">
      <div className="wallet-header">
        <div className="wallet-info">
          <p className="wallet-address">
            {publicKey ? publicKey.toString() : "No wallet connected"}
          </p>
          <p className="wallet-balance">
            Connected Balance: {isLoading ? "Loading..." : `${formatAmount(walletBalance)} SLOT`}
          </p>
          <p className="backend-balance">
            Backend Balance: {isLoading ? "Loading..." : `${formatAmount(backendBalance)} SLOT`}
          </p>
        </div>
      </div>
      <div className="transaction-section">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => setActiveTab("deposit")}
          >
            Deposit
          </button>
          <button
            className={`tab-button ${activeTab === "withdraw" ? "active" : ""}`}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw
          </button>
        </div>
        <div className="input-wrapper">
          <input
            type="number"
            value={transactionAmount}
            onChange={(e) => handleInputChange(e.target.value)}
            step={isPercentage ? "1" : "0.000001"}
            min="0"
            max={isPercentage ? "100" : activeTab === "deposit" ? walletBalance : backendBalance}
            placeholder={isPercentage ? "Enter percentage" : "Enter amount"}
            className="transaction-input"
          />
          <button className="toggle-input" onClick={toggleInputType}>
            {isPercentage ? "%" : "$"}
          </button>
        </div>
        <div className="percentage-buttons">
          {percentageButtons.map(({ percent, amount }) => (
            <button
              key={percent}
              onClick={() => handlePercentageClick(percent)}
            >
              {percent}% ({formatAmount(parseFloat(amount))})
            </button>
          ))}
        </div>
        <div className="action-buttons">
          {activeTab === "deposit" ? (
            <button
              className="action-button deposit"
              onClick={handleDeposit}
              disabled={isLoading || !transactionAmount || !publicKey}
            >
              {isLoading ? "Processing..." : "Deposit"}
            </button>
          ) : (
            <button
              className="action-button withdraw"
              onClick={handleWithdraw}
              disabled={isLoading || !transactionAmount || !publicKey}
            >
              {isLoading ? "Processing..." : "Withdraw"}
            </button>
          )}
        </div>
      </div>
      <button className="action-button disconnect" onClick={handleDisconnect}>
        Disconnect
      </button>
    </div>
  );

  /**
   * Handles closing the modal.
   */
  const handleCloseModal = () => {
    setShowModal(false);
    resetState();
  };

  return (
    <div className="wallet-section">
      <div className="wallet-actions">
        {!isConnected ? (
          <button className="wallet-button" onClick={handleConnect}>
            Connect Wallet
          </button>
        ) : (
          <button className="wallet-button" onClick={() => setShowModal(true)}>
            {publicKey
              ? `${publicKey.toString().slice(0, 4)}...${publicKey
                  .toString()
                  .slice(-4)}`
              : "Wallet Connected"}
          </button>
        )}
      </div>
      {showModal && (
        <Modal onClose={handleCloseModal}>
          {modalContent ? (
            <>
              <h2>{modalContent.title}</h2>
              <p>{modalContent.content}</p>
            </>
          ) : (
            renderWalletContent()
          )}
        </Modal>
      )}
    </div>
  );
};

export default WalletConnect;

