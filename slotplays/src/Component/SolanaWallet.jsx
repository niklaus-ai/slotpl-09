import { Buffer } from "buffer";
window.Buffer = Buffer;
import { Connection, PublicKey, clusterApiUrl, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

const PLATFORM_WALLET_ADDRESS = "46qSEs9Gz4Bz8LJ1mBg2LNbwBFNtkxZGwR9vc7HdRCrPwyRMn9k6ZjPYo31vUY8aVh9oh2ACpfzLuDYBj3xAHakv"; 

const TOKEN_MINT_ADDRESS = "2STjJWDHTGiytKB4NeCPKbettQSRs7wTwECRGefCKRAt"; 

export const connectWallet = async () => {
  try {
    if (window.solana && window.solana.isPhantom) {
      const response = await window.solana.connect();
      return response.publicKey.toString();
    } else {
      alert("Phantom wallet not found! Please install it.");
      return null;
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    return null;
  }
};

const isValidPublicKey = (key) => {
  try {
    new PublicKey(key); // This will throw an error if the key is invalid
    return true;
  } catch (error) {
    return false;
  }
};

// Validate inputs in functions
export const getTokenBalance = async (walletAddress) => {
  try {
    if (!isValidPublicKey(walletAddress) || !isValidPublicKey(TOKEN_MINT_ADDRESS)) {
      throw new Error("Invalid public key provided");
    }

    const connection = new Connection(clusterApiUrl("devnet"));
    const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);
    const tokenAccount = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { mint: mintPublicKey }
    );

    if (tokenAccount.value.length > 0) {
      const balance = tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    }
    return 0;
  } catch (error) {
    console.error("Error fetching token balance:", error);
    return 0;
  }
};




export const depositToken = async (walletAddress, amount) => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);
    const recipientPublicKey = new PublicKey(PLATFORM_WALLET_ADDRESS);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      window.solana.publicKey,
      mintPublicKey,
      walletAddress
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      window.solana.publicKey,
      mintPublicKey,
      recipientPublicKey
    );

    const transaction = new Transaction().add(
      transfer(
        connection,
        window.solana.publicKey,
        fromTokenAccount.address,
        toTokenAccount.address,
        window.solana.publicKey,
        amount * Math.pow(10, 9) // Convert to lamports
      )
    );

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    return true;
  } catch (error) {
    console.error("Error during deposit:", error);
    return false;
  }
};

export const withdrawToken = async (walletAddress, amount) => {
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      window.solana.publicKey,
      mintPublicKey,
      PLATFORM_WALLET_ADDRESS
    );
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      window.solana.publicKey,
      mintPublicKey,
      walletAddress
    );

    const transaction = new Transaction().add(
      transfer(
        connection,
        window.solana.publicKey,
        fromTokenAccount.address,
        toTokenAccount.address,
        window.solana.publicKey,
        amount * Math.pow(10, 9) // Convert to lamports
      )
    );

    const { signature } = await window.solana.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    return true;
  } catch (error) {
    console.error("Error during withdrawal:", error);
    return false;
  }
};
