// import React, { useState, useEffect } from "react";
// import { Settings, Volume2, Info } from "lucide-react";
// import { Circles } from "react-loader-spinner";
// import './GameInterface.css';

// // Import candy assets
// import blueCandy from "../assets/BluecandyHTML5.webp";
// import redCandy from "../assets/redCandy.png";
// import purpleCandy from "../assets/PurpleCandy.png";
// import pinkCandy from "../assets/Pink.png";
// import rainbowCandy from "../assets/ranbo.png";
// import greenCandy from "../assets/green.png";
// import colorBombCandy from "../assets/colorBomb.png";
// import orangeCandy from "../assets/ornage.png";
// import yellowCandy from "../assets/yellow.png";
// // import gameBg from "../assets/game-bg.jpg";
// import gameBg from "../assets/gaming.jpg";

// const candyImages = [
//   blueCandy,
//   redCandy,
//   purpleCandy,
//   pinkCandy,
//   rainbowCandy,
//   greenCandy,
//   colorBombCandy,
//   orangeCandy,
//   yellowCandy,
// ];

// // Function to generate a new grid
// const createNewGrid = (rows = 5, cols = 6) => {
//   return Array.from({ length: rows }, () =>
//     Array.from({ length: cols }, () => candyImages[Math.floor(Math.random() * candyImages.length)])
//   );
// };

// const GameInterface = () => {
//   const [grid, setGrid] = useState(createNewGrid());
//   const [score, setScore] = useState(0);
//   const [playerBalance, setPlayerBalance] = useState(100000.0);
//   const [totalBets, setTotalBets] = useState(0);
//   const [totalPayouts, setTotalPayouts] = useState(0);
//   const [isShuffling, setIsShuffling] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [betAmount, setBetAmount] = useState(2.5);
//   const [autoPlay, setAutoPlay] = useState(false);
//   const rtpTarget = 99;

//   const calculateRTP = () => {
//     return totalBets === 0 ? 0 : ((totalPayouts / totalBets) * 100).toFixed(2);
//   };

//   const checkMatches = () => {
//     const matchedPositions = [];
//     let points = 0;

//     // Horizontal matches
//     for (let row = 0; row < grid.length; row++) {
//       for (let col = 0; col < grid[row].length - 2; col++) {
//         if (grid[row][col] === grid[row][col + 1] && grid[row][col] === grid[row][col + 2]) {
//           matchedPositions.push(
//             { row, col },
//             { row, col: col + 1 },
//             { row, col: col + 2 }
//           );
//           points += 10;
//         }
//       }
//     }

//     // Vertical matches
//     for (let col = 0; col < grid[0].length; col++) {
//       for (let row = 0; row < grid.length - 2; row++) {
//         if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row + 2][col]) {
//           matchedPositions.push(
//             { row, col },
//             { row: row + 1, col },
//             { row: row + 2, col }
//           );
//           points += 10;
//         }
//       }
//     }

//     if (matchedPositions.length > 0) {
//       clearMatches(matchedPositions, points);
//     }
//   };

//   const clearMatches = (matchedPositions, points) => {
//     let newGrid = [...grid];

//     matchedPositions.forEach(({ row, col }) => {
//       newGrid[row][col] = null;
//     });

//     // Make candies fall
//     for (let col = 0; col < newGrid[0].length; col++) {
//       let emptySpaces = 0;
//       for (let row = newGrid.length - 1; row >= 0; row--) {
//         if (!newGrid[row][col]) {
//           emptySpaces++;
//         } else if (emptySpaces > 0) {
//           newGrid[row + emptySpaces][col] = newGrid[row][col];
//           newGrid[row][col] = null;
//         }
//       }
//     }

//     // Fill empty spaces with new candies
//     for (let row = 0; row < newGrid.length; row++) {
//       for (let col = 0; col < newGrid[row].length; col++) {
//         if (!newGrid[row][col]) {
//           newGrid[row][col] = candyImages[Math.floor(Math.random() * candyImages.length)];
//         }
//       }
//     }

//     setGrid(newGrid);
//     adjustRTP(points);
//   };

//   const adjustRTP = (points) => {
//     const currentRTP = calculateRTP();
//     let adjustedPoints = points;

//     if (currentRTP < rtpTarget) {
//       adjustedPoints += Math.floor((rtpTarget - currentRTP) * betAmount / 100);
//     } else if (currentRTP > rtpTarget) {
//       adjustedPoints -= Math.floor((currentRTP - rtpTarget) * betAmount / 100);
//     }

//     const payout = Math.max(0, adjustedPoints);
//     setTotalPayouts(totalPayouts + payout);
//     setPlayerBalance(playerBalance + payout);
//     setScore(score + payout);
//   };

//   const shuffleGrid = () => {
//     if (isShuffling || playerBalance < betAmount) return;

//     setIsShuffling(true);
//     setPlayerBalance(playerBalance - betAmount);
//     setTotalBets(totalBets + betAmount);

//     setTimeout(() => {
//       const newGrid = createNewGrid();
//       setGrid(newGrid);
//       checkMatches();
//       setIsShuffling(false);
//     }, 1500);
//   };

//   const adjustBet = (increment) => {
//     setBetAmount((prev) => {
//       const newBet = increment ? prev + 0.5 : prev - 0.5;
//       return Math.max(0.5, Math.min(100, newBet));
//     });
//   };

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 2000);
//   }, []);

//   return (
//     <div
//       className="flex justify-center items-center h-screen bg-cover bg-center main"
//       style={{ backgroundImage: `url(${gameBg})` }}
//     >
//       {/* Buy Feature Button */}
//       <div className="absolute left-4 top-20">
//         <button className="bg-orange-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-orange-500">
//           BUY FEATURE
//           <div className="text-2xl">$200</div>
//         </button>
//       </div>

//       {/* Bet Controls */}
//       <div className="absolute left-4 top-48">
//         <div className="bg-green-500 p-4 rounded-lg text-white shadow-lg">
//           <div className="text-center">BET</div>
//           <div className="text-2xl font-bold">${betAmount.toFixed(2)}</div>
//           <div className="text-sm">DOUBLE CHANCE TO</div>
//           <div className="text-sm">WIN FEATURE</div>
//           <button className="bg-green-600 mt-2 px-4 py-1 rounded shadow-md hover:bg-green-700">
//             OFF
//           </button>
//         </div>
//       </div>

//       <div className="w-2/4 relative">
//         <div className="text-center text-white text-2xl font-bold mb-4">
//           SYMBOLS PAY ANYWHERE ON THE SCREEN
//         </div>

//         <div className="bg-white bg-opacity-90 p-4 rounded-lg border-4 border-pink-200">
//           {loading ? (
//             <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 rounded-lg">
//               <Circles color="#fff" height={80} width={80} />
//               <p className="text-white text-xl mt-4">LOADING...</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-6 gap-2">
//               {grid.map((row, rowIndex) =>
//                 row.map((image, colIndex) => (
//                   <div
//                     key={`${rowIndex}-${colIndex}`}
//                     className={`w-full pt-[100%] relative rounded-lg ${
//                       isShuffling ? "animate-pulse" : ""
//                     }`}
//                   >
//                     <div
//                       className="absolute inset-0 bg-contain bg-center bg-no-repeat"
//                       style={{ backgroundImage: `url(${image})` }}
//                     />
//                   </div>
//                 ))
//               )}
//             </div>
//           )}
//         </div>

//         {/* Controls Bar */}
//         <div className="h-20 bg-purple-900 mt-4 rounded-lg flex items-center justify-between px-6 shadow-lg">
//           <div className="flex gap-4">
//             <Settings className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//             <Info className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//             <Volume2 className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//           </div>

//           <div className="text-white">
//             <div>CREDIT ${playerBalance.toFixed(2)}</div>
//             <div>BET ${betAmount.toFixed(2)}</div>
//           </div>

//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => adjustBet(false)}
//               className="text-white text-3xl bg-purple-800 w-12 h-12 rounded-full hover:bg-purple-700"
//             >
//               -
//             </button>
//             <button
//               onClick={shuffleGrid}
//               className={`bg-purple-700 text-white px-6 py-3 rounded-full shadow-md hover:bg-purple-600 ${
//                 isShuffling ? "opacity-50 cursor-not-allowed" : ""
//               }`}
//               disabled={isShuffling || playerBalance < betAmount}
//             >
//               {isShuffling ? "SPINNING" : "SPIN"}
//             </button>
//             <button
//               onClick={() => adjustBet(true)}
//               className="text-white text-3xl bg-purple-800 w-12 h-12 rounded-full hover:bg-purple-700"
//             >
//               +
//             </button>
//             <button
//               onClick={() => setAutoPlay(!autoPlay)}
//               className={`bg-purple-800 p-3 rounded-full shadow-md hover:bg-purple-700 ${
//                 autoPlay ? "text-yellow-400" : "text-white"
//               }`}
//             >
//               AUTOPLAY
//             </button>
//           </div>
//         </div>

//         <div className="text-center text-white mt-2">HOLD SPACE FOR TURBO SPIN</div>
//       </div>
//     </div>
//   );
// };

// export default GameInterface;


import React, { useState, useEffect } from "react";
import { Settings, Volume2, Info } from "lucide-react";
import { Circles } from "react-loader-spinner";
import './GameInterface.css';

// Import candy assets
import blueCandy from "../assets/BluecandyHTML5.webp";
import redCandy from "../assets/redCandy.png";
import purpleCandy from "../assets/PurpleCandy.png";
import pinkCandy from "../assets/Pink.png";
import rainbowCandy from "../assets/ranbo.png";
import greenCandy from "../assets/green.png";
import colorBombCandy from "../assets/colorBomb.png";
import orangeCandy from "../assets/ornage.png";
import yellowCandy from "../assets/yellow.png";
import gameBg from "../assets/gaming.jpg";

const candyImages = [
  blueCandy,
  redCandy,
  purpleCandy,
  pinkCandy,
  rainbowCandy,
  greenCandy,
  colorBombCandy,
  orangeCandy,
  yellowCandy,
];

// Function to generate a new grid
const createNewGrid = (rows = 5, cols = 6) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => candyImages[Math.floor(Math.random() * candyImages.length)])
  );
};

const GameInterface = () => {
  const [grid, setGrid] = useState(createNewGrid());
  const [score, setScore] = useState(0);
  const [playerBalance, setPlayerBalance] = useState(100000.0);
  const [totalBets, setTotalBets] = useState(0);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(2.5);
  const [autoPlay, setAutoPlay] = useState(false);
  const rtpTarget = 99;

  const calculateRTP = () => {
    return totalBets === 0 ? 0 : ((totalPayouts / totalBets) * 100).toFixed(2);
  };

  const shuffleGrid = () => {
    if (isShuffling || playerBalance < betAmount) return;

    setIsShuffling(true);
    setPlayerBalance(playerBalance - betAmount);
    setTotalBets(totalBets + betAmount);

    setTimeout(() => {
      const newGrid = createNewGrid();
      setGrid(newGrid);
      setIsShuffling(false);
    }, 1500);
  };

  const adjustBet = (increment) => {
    setBetAmount((prev) => {
      const newBet = increment ? prev + 0.5 : prev - 0.5;
      return Math.max(0.5, Math.min(100, newBet));
    });
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <div
      className="flex justify-center flex-col items-center h-screen bg-cover bg-center main"
      style={{ backgroundImage: `url(${gameBg})` }}
    >
      {/* Buy Feature Button */}
      <div className="absolute left-16 top-64">
        <button className="bg-orange-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-orange-500 border-4 border-yellow-300">
          BUY FEATURE
          <div className="text-2xl">$200</div>
        </button>
      </div>

      {/* Bet Controls */}
      <div className="absolute left-16 ">
        <div className="bg-green-500 p-4 rounded-lg text-white shadow-lg border-4 border-green-800">
          <div className="text-center">BET</div>
          <div className="text-2xl font-bold">${betAmount.toFixed(2)}</div>
          <div className="text-sm">DOUBLE CHANCE TO</div>
          <div className="text-sm">WIN FEATURE</div>
          <button className="bg-green-600 mt-2 px-4 py-1 rounded shadow-md hover:bg-green-700">
            OFF
          </button>
        </div>
      </div>

      <div className="w-2/4 relative">
        <div className="text-center text-white text-2xl font-bold mb-4">
          WIN OVER 21,100x BET
        </div>

        <div className="bg-white bg-opacity-90 p-4 rounded-lg border-4 border-pink-200">
          {loading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 rounded-lg">
              <Circles color="#fff" height={80} width={80} />
              <p className="text-white text-xl mt-4">LOADING...</p>
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {grid.map((row, rowIndex) =>
                row.map((image, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-full pt-[100%] relative rounded-lg border-2 border-purple-400 shadow-md ${
                      isShuffling ? "animate-pulse" : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

       

        <div className="text-center text-white mt-2">HOLD SPACE FOR TURBO SPIN</div>
      </div>
       {/* Controls Bar */}
       <div className="h-20 bg-purple-900 mt-4 rounded-lg flex items-center justify-between px-6 shadow-lg border-t-4 border-purple-600">
          <div className="flex gap-4">
            <Settings className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
            <Info className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
            <Volume2 className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
          </div>

          <div className="text-white">
            <div>CREDIT ${playerBalance.toFixed(2)}</div>
            <div>BET ${betAmount.toFixed(2)}</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => adjustBet(false)}
              className="text-white text-3xl bg-purple-800 w-12 h-12 rounded-full hover:bg-purple-700"
            >
              -
            </button>
            <button
              onClick={shuffleGrid}
              className={`bg-purple-700 text-white px-6 py-3 rounded-full shadow-md hover:bg-purple-600 border-2 border-white ${
                isShuffling ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isShuffling || playerBalance < betAmount}
            >
              {isShuffling ? "SPINNING" : "SPIN"}
            </button>
            <button
              onClick={() => adjustBet(true)}
              className="text-white text-3xl bg-purple-800 w-12 h-12 rounded-full hover:bg-purple-700"
            >
              +
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`bg-purple-800 p-3 rounded-full shadow-md hover:bg-purple-700 ${
                autoPlay ? "text-yellow-400" : "text-white"
              }`}
            >
              AUTOPLAY
            </button>
          </div>
        </div>
    </div>
  );
};

export default GameInterface;