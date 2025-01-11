import {
  Connection,
  PublicKey,
  Keypair,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getMint,
} from "@solana/spl-token";
import bs58 from "bs58";
import User from "../models/UserSchema.js"; // Import User schema

// Solana Connection Setup
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=31722f48-cf67-4177-9131-0be10384530b", "confirmed");

// Treasury Wallet Keypair (using Base58 private key)
const base58PrivateKey = "46qSEs9Gz4Bz8LJ1mBg2LNbwBFNtkxZGwR9vc7HdRCrPwyRMn9k6ZjPYo31vUY8aVh9oh2ACpfzLuDYBj3xAHakv";
const treasuryWallet = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));

// Token Mint Address (for SPL Token)
const TOKEN_MINT_ADDRESS = new PublicKey("7xX4P4Pqp18a1JGiAvKKD1nto38DHdtqi1jkBKHHpump");

// -------------------------------------
// Connect Wallet API
// -------------------------------------
export const connectWallet = async (req, res) => {
  const { walletAddress, publicKey } = req.body;

  if (!walletAddress || !publicKey) {
    return res.status(400).json({ message: "Wallet address and public key are required" });
  }

  try {
    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress, balance: 0, publicKey });
      await user.save();
    }

    return res.status(200).json({
      message: "Wallet connected successfully",
      walletAddress: user.walletAddress,
      balance: user.balance,
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    return res.status(500).json({ error: "Failed to connect wallet" });
  }
};

// -------------------------------------
// Deposit SPL Token API
// -------------------------------------
export const deposit = async (req, res) => {
  const { walletAddress, amount, signature } = req.body;

  if (!walletAddress || !amount || !signature) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    // Confirm the transaction first
    const txResult = await connection.confirmTransaction(signature, "confirmed");
    if (!txResult || txResult.value.err) {
      return res.status(400).json({ error: "Invalid or failed transaction" });
    }

    const transaction = await connection.getParsedTransaction(signature);
    if (!transaction) {
      return res.status(400).json({ error: "Transaction not found or not parsed" });
    }

    const transferInstruction = transaction.transaction.message.instructions.find(
      (inst) =>
        inst.programId.toString() === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
    );

    if (!transferInstruction) {
      return res.status(400).json({ error: "No SPL token transfer found in transaction" });
    }

    const { source, destination, amount: transferredAmount } = transferInstruction.parsed.info;

    // Check for token mint decimals dynamically
    const tokenMintInfo = await getMint(connection, TOKEN_MINT_ADDRESS);
    const tokenDecimals = tokenMintInfo.decimals;

    const tokenAmount = parseFloat(transferredAmount) / Math.pow(10, tokenDecimals);

    // Ensure the token transfer is coming to the treasury wallet
    if (source !== walletAddress || destination !== treasuryWallet.publicKey.toString()) {
      return res.status(400).json({ error: "Invalid deposit transaction" });
    }

    // Update user balance and record the deposit transaction
    const user = await User.findOneAndUpdate(
      { walletAddress },
      {
        $inc: { balance: tokenAmount },
        $push: { depositTransactions: { txId: signature, amount: tokenAmount } },
      },
      { new: true }
    );

    return res.status(200).json({ message: "Deposit successful", balance: user.balance });
  } catch (error) {
    console.error("Error processing deposit:", error);
    return res.status(500).json({ error: "Failed to process deposit" });
  }
};

// -------------------------------------
// Withdraw SPL Token API
// -------------------------------------
export const withdraw = async (req, res) => {
  const { walletAddress, amount } = req.body;

  if (!walletAddress || !amount) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  try {
    const user = await User.findOne({ walletAddress });
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance or user not found" });
    }

    // Check treasury wallet balance for the $SLOT token
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryWallet,
      TOKEN_MINT_ADDRESS,
      treasuryWallet.publicKey
    );

    const tokenMintInfo = await getMint(connection, TOKEN_MINT_ADDRESS);
    const tokenDecimals = tokenMintInfo.decimals;

    const treasuryBalance = treasuryTokenAccount.amount / Math.pow(10, tokenDecimals);
    if (treasuryBalance < amount) {
      return res.status(400).json({ error: "Treasury wallet has insufficient balance" });
    }

    // Get or create the user's associated token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryWallet,
      TOKEN_MINT_ADDRESS,
      new PublicKey(walletAddress)
    );

    // Create the transfer instruction for withdrawal
    const transferInstruction = createTransferInstruction(
      treasuryTokenAccount.address,
      userTokenAccount.address,
      treasuryWallet.publicKey,
      amount * Math.pow(10, tokenDecimals) // Convert amount to correct decimals
    );

    // Create and send the transaction
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const transaction = new Transaction().add(transferInstruction);
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = treasuryWallet.publicKey;

    const signature = await connection.sendTransaction(transaction, [treasuryWallet]);
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });

    // Update user balance after withdrawal
    user.balance -= amount;
    user.withdrawalTransactions.push({ txId: signature, amount, date: new Date() });
    await user.save();

    return res.status(200).json({ message: "Withdrawal successful", balance: user.balance });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return res.status(500).json({ error: "Failed to process withdrawal" });
  }
};


// -------------------------------------
// Get Balance API
// -------------------------------------
export const getBalance = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ walletAddress, balance: user.balance });
  } catch (error) {
    console.error("Error getting balance:", error);
    return res.status(500).json({ error: "Failed to get balance" });
  }
};

// -------------------------------------
// Export Handlers
// -------------------------------------
export default {
  connectWallet,
  deposit,
  withdraw,
  getBalance,
};