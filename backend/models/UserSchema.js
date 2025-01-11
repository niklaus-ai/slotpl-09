// const mongoose = require("mongoose");
import mongoose from "mongoose";

// Schema for deposit transactions
const depositTransactionSchema = new mongoose.Schema({
  txId: { type: String, required: true }, // Transaction ID
  amount: { type: Number, required: true }, // Amount deposited
  date: { type: Date, default: Date.now }, // Date of transaction
});

// Schema for withdrawal transactions
const withdrawalTransactionSchema = new mongoose.Schema({
  txId: { type: String, required: true }, // Transaction ID
  amount: { type: Number, required: true }, // Amount withdrawn
  date: { type: Date, default: Date.now }, // Date of transaction
});

// Main User schema
const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true, // Ensures wallet address is unique
    },
    publicKey: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      default: 0, // Store in lamports (smallest token unit)
      min: [0, "Balance cannot be negative"], // Non-negative balance validation
    },
    depositTransactions: [depositTransactionSchema], // Array of deposit transactions
    withdrawalTransactions: [withdrawalTransactionSchema], // Array of withdrawal transactions
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const User = mongoose.model("User", userSchema);

export default User;
