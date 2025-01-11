import React from "react";
import { connectWallet } from "./SolanaWallet"; // Import the connectWallet function

const WalletModal = ({ setWalletAddress, toggleModal, updateBalance }) => {
  const handleConnectWallet = async () => {
    const address = await connectWallet(); // Call the imported function
    if (address) {
      setWalletAddress(address);
      updateBalance();
      toggleModal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <button
          onClick={handleConnectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Connect to Wallet
        </button>
        <button
          onClick={toggleModal}
          className="text-red-500 mt-4 block hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
