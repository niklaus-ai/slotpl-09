// import React, { useState } from "react";
// import { Settings, Volume2, Info } from "lucide-react";
// import { useWallet } from "@solana/wallet-adapter-react"; // Assuming you are using Solana wallet adapter
// import { Connection, Keypair, Transaction } from "@solana/web3.js";

// const GameControls = ({ betAmount, setBetAmount, score, playerBalance, isShuffling, shuffleGrid }) => {
//   const { publicKey, sendTransaction, connected } = useWallet();
//   const [betLoading, setBetLoading] = useState(false);

//   const handleBet = async () => {
//     if (!connected || playerBalance < betAmount) {
//       alert("Not connected or insufficient funds.");
//       return;
//     }

//     setBetLoading(true);
//     // Add Solana transaction logic here
//     try {
//       const connection = new Connection("https://api.mainnet-beta.solana.com"); // Use mainnet or testnet
//       const fromWallet = publicKey;

//       // Create a Solana transaction
//       const transaction = new Transaction();

//       // Here you would implement your actual bet logic and send the transaction to the blockchain
//       // Example: adding a bet to a specific contract (this needs to be implemented)
      
//       // Send transaction
//       const signature = await sendTransaction(transaction, connection);
//       console.log("Transaction sent:", signature);

//       // Update player balance or other states based on success/failure
//       setBetLoading(false);
//       shuffleGrid(); // Proceed with the game logic after successful bet
//     } catch (error) {
//       console.error("Error while processing the bet:", error);
//       setBetLoading(false);
//     }
//   };

//   return (
//     <div className="h-20 w-full bg-black/50 mt-4 p-12 rounded-lg flex items-center justify-between px-6 shadow-lg border-black-600 backdrop-blur-sm">
//       <div className="flex gap-4">
//         <Settings className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//         <Info className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//         <Volume2 className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//       </div>
//       <div className="text-white">
//         <div>Score: {score}</div>
//         <div>CREDIT ${playerBalance.toFixed(2)}</div>
//         <div>
//           Bet:{" "}
//           <input
//             type="number"
//             value={betAmount}
//             onChange={(e) => setBetAmount(Number(e.target.value))}
//             className="bg-black text-white px-4 py-2 rounded-lg"
//           />
//         </div>
//       </div>
//       <button
//         onClick={handleBet}
//         disabled={betLoading || isShuffling}
//         className={`bg-purple-700 text-white px-6 py-3 rounded-full shadow-md hover:bg-purple-600 border-2 border-white ${betLoading ? 'cursor-not-allowed opacity-50' : ''}`}
//       >
//         {betLoading ? "Processing Bet..." : isShuffling ? "SPINNING" : "SPIN"}
//       </button>
//     </div>
//   );
// };

// export default GameControls;
