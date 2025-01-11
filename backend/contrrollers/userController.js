import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction
} from "@solana/web3.js";
import {
    TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAccount,
    getAssociatedTokenAddress,
    getMint,
    getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import { BigNumber } from 'bignumber.js';
import User from "../models/UserSchema.js";
import bs58 from "bs58";

// ============================================================================
// CONFIGURATION AND SETUP
// ============================================================================

/**
 * Solana Connection Setup
 * @constant {Connection}
 */
const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=31722f48-cf67-4177-9131-0be10384530b", "confirmed");

/**
 * Treasury Wallet Configuration
 * @constant {Keypair}
 * @todo Implement secure key management in production
 */
const base58PrivateKey = "46qSEs9Gz4Bz8LJ1mBg2LNbwBFNtkxZGwR9vc7HdRCrPwyRMn9k6ZjPYo31vUY8aVh9oh2ACpfzLuDYBj3xAHakv";
const treasuryWallet = Keypair.fromSecretKey(bs58.decode(base58PrivateKey));

/**
 * Token Mint Address for SPL Token
 * @constant {PublicKey}
 */
const TOKEN_MINT_ADDRESS = new PublicKey("7xX4P4Pqp18a1JGiAvKKD1nto38DHdtqi1jkBKHHpump"); // TODO: SET YOUR TOKEN MINT ADDRESS

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts lamports to SOL
 * @function
 * @param {BigNumber} lamports - Amount in lamports
 * @param {number} decimals - Number of decimal places
 * @returns {string} Amount in SOL
 */
const lamportsToSol = (lamports, decimals) => {
    return new BigNumber(lamports.toString()).dividedBy(new BigNumber(10).pow(decimals)).toString();
};

/**
 * Converts SOL to lamports
 * @function
 * @param {string|number} sol - Amount in SOL
 * @param {number} decimals - Number of decimal places
 * @returns {BigNumber} Amount in lamports
 */
const solToLamports = (sol, decimals) => {
    return new BigNumber(sol).multipliedBy(new BigNumber(10).pow(decimals));
};

// ============================================================================
// WALLET CONNECTION
// ============================================================================

/**
 * Connects a wallet to the system
 * @async
 * @function connectWallet
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with connection status
 * @throws Will throw an error if the connection fails
 */
export const connectWallet = async (req, res) => {
    const { walletAddress, publicKey } = req.body;

    if (!walletAddress || !publicKey) {
        return res.status(400).json({ message: "Wallet address and public key are required" });
    }

    try {
        let user = await User.findOne({ walletAddress });

        if (!user) {
            user = new User({ walletAddress, balance: '0', publicKey });
            await user.save();
        }

        return res.status(200).json({
            message: "Wallet connected successfully",
            walletAddress: user.walletAddress,
            balance: user.balance,
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to connect wallet" });
    }
};

// ============================================================================
// DEPOSIT HANDLING
// ============================================================================

/**
 * Processes a deposit of SPL tokens
 * @async
 * @function deposit
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with deposit status
 * @throws Will throw an error if the deposit process fails
 */
export const deposit = async (req, res) => {
    const { walletAddress, amount, signature } = req.body;

    if (!walletAddress || !amount || !signature) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    try {

        // Fetch and confirm the transaction
        let transaction;
        let attempts = 0;
        const maxAttempts = 5;
        const delayMs = 2000;

        while (!transaction && attempts < maxAttempts) {
            transaction = await connection.getParsedTransaction(signature, 'confirmed');
            if (!transaction) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
                attempts++;
            }
        }

        if (!transaction) {
            return res.status(400).json({ error: "Transaction not found or not confirmed" });
        }


        // Find the token transfer instruction
        const tokenTransferInstruction = transaction.transaction.message.instructions.find(
            (inst) => inst.programId.toString() === TOKEN_PROGRAM_ID.toString() && inst.parsed?.type === 'transfer'
        );

        if (!tokenTransferInstruction) {
            return res.status(400).json({ error: "No SPL token transfer found in transaction" });
        }


        const { source, destination, amount: transferAmount } = tokenTransferInstruction.parsed.info;

        // Fetch the associated token accounts
        const userPublicKey = new PublicKey(walletAddress);
        const userAssociatedTokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT_ADDRESS,
            userPublicKey
        );

        const treasuryAssociatedTokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT_ADDRESS,
            treasuryWallet.publicKey
        );

        // Verify the transaction details
        if (source !== userAssociatedTokenAccount.toString()) {
            return res.status(400).json({ error: "Invalid deposit transaction: source address mismatch" });
        }

        if (destination !== treasuryAssociatedTokenAccount.toString()) {
            return res.status(400).json({ error: "Invalid deposit transaction: destination address mismatch" });
        }

        // Verify the deposited amount
        const tokenMintInfo = await getMint(connection, TOKEN_MINT_ADDRESS);
        const tokenDecimals = tokenMintInfo.decimals;
        const depositAmount = new BigNumber(transferAmount);
        const expectedAmount = solToLamports(amount, tokenDecimals);

        if (!depositAmount.isEqualTo(expectedAmount)) {
            return res.status(400).json({ error: "Deposit amount mismatch" });
        }

        // Update user balance
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const depositAmountInSol = lamportsToSol(depositAmount, tokenDecimals);
        user.balance = new BigNumber(user.balance).plus(depositAmountInSol).toString();
        user.depositTransactions.push({ txId: signature, amount: depositAmountInSol });
        await user.save();

        return res.status(200).json({ message: "Deposit successful", balance: user.balance });
    } catch (error) {
        return res.status(500).json({ error: "Failed to process deposit", details: error.message });
    }
};

// ============================================================================
// WITHDRAWAL PROCESSING
// ============================================================================

/**
 * Processes a withdrawal of SPL tokens
 * @async
 * @function withdraw
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with withdrawal status
 * @throws Will throw an error if the withdrawal process fails
 */
export const withdraw = async (req, res) => {
    const { walletAddress, amount } = req.body;

    if (!walletAddress || !amount) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    try {
        // Check user balance
        const user = await User.findOne({ walletAddress });
        if (!user || new BigNumber(user.balance).isLessThan(amount)) {
            return res.status(400).json({ error: "Insufficient balance or user not found" });
        }

        const withdrawAmount = parseFloat(amount);

        // Check if the treasury's token account exists
        let treasuryTokenAccount;
        try {
            treasuryTokenAccount = await getAccount(connection, await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, treasuryWallet.publicKey));
        } catch (error) {
            if (error.name === 'TokenAccountNotFoundError') {
                // If the account doesn't exist, create it
                const transaction = new Transaction().add(
                    createAssociatedTokenAccountInstruction(
                        treasuryWallet.publicKey,
                        await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, treasuryWallet.publicKey),
                        treasuryWallet.publicKey,
                        TOKEN_MINT_ADDRESS
                    )
                );
                const signature = await sendAndConfirmTransaction(connection, transaction, [treasuryWallet]);
                treasuryTokenAccount = await getAccount(connection, await getAssociatedTokenAddress(TOKEN_MINT_ADDRESS, treasuryWallet.publicKey));
            } else {
                throw error;
            }
        }

        const tokenMintInfo = await getMint(connection, TOKEN_MINT_ADDRESS);
        const tokenDecimals = tokenMintInfo.decimals;

        const treasuryBalance = new BigNumber(treasuryTokenAccount.amount.toString());
        const withdrawAmountLamports = new BigNumber(withdrawAmount).multipliedBy(new BigNumber(10).pow(tokenDecimals));

        if (treasuryBalance.isLessThan(withdrawAmountLamports)) {
            return res.status(400).json({ error: "Treasury wallet has insufficient balance" });
        }

        // Get or create the user's associated token account
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            treasuryWallet,
            TOKEN_MINT_ADDRESS,
            new PublicKey(walletAddress)
        );

        const transaction = new Transaction().add(
            createTransferInstruction(
                treasuryTokenAccount.address,
                recipientTokenAccount.address,
                treasuryWallet.publicKey,
                BigInt(withdrawAmountLamports.toString()),
                [],
                TOKEN_PROGRAM_ID
            )
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [treasuryWallet]);

        // Update user balance after withdrawal
        user.balance = new BigNumber(user.balance).minus(withdrawAmount).toString();
        user.withdrawalTransactions.push({ txId: signature, amount: withdrawAmount, date: new Date() });
        await user.save();

        return res.status(200).json({ message: "Withdrawal successful", balance: user.balance, signature });
    } catch (error) {
        return res.status(500).json({ error: "Failed to process withdrawal", details: error.message });
    }
};

// ============================================================================
// BALANCE RETRIEVAL
// ============================================================================

/**
 * Retrieves the balance for a given wallet address
 * @async
 * @function getBalance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} JSON response with wallet balance
 * @throws Will throw an error if balance retrieval fails
 */
export const getBalance = async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ walletAddress, balance: user.balance });
    } catch (error) {
        return res.status(500).json({ error: "Failed to get balance" });
    }
};

// ============================================================================
// EXPORT HANDLERS
// ============================================================================

/**
 * @exports
 * @type {Object}
 * @property {Function} connectWallet - Handler for wallet connection
 * @property {Function} deposit - Handler for token deposits
 * @property {Function} withdraw - Handler for token withdrawals
 * @property {Function} getBalance - Handler for balance retrieval
 */
export default {
    connectWallet,
    deposit,
    withdraw,
    getBalance,
};
