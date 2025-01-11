import React, { useState } from "react";

const TransactionForm = ({ walletAddress }) => {
  const [amount, setAmount] = useState(0);
  const [transactionType, setTransactionType] = useState("deposit");

  const handleTransaction = () => {
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    if (amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    // Handle transaction here (API call or logic)
    alert(
      `${transactionType === "deposit" ? "Depositing" : "Withdrawing"} ${amount} $SLOT tokens for wallet ${walletAddress}`
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Transaction</h2>
      <p className="text-gray-600 mb-4">
        Wallet Address: {walletAddress || "Not connected"}
      </p>
      <div className="space-y-2">
        <input
          type="number"
          placeholder="Amount"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="w-full px-4 py-2 border rounded-md"
          onChange={(e) => setTransactionType(e.target.value)}
          value={transactionType}
        >
          <option value="deposit">Deposit</option>
          <option value="withdraw">Withdraw</option>
        </select>
        <button
          onClick={handleTransaction}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
