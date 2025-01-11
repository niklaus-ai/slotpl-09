import React, { useState, useEffect } from "react";
import { Settings, Volume2, Info } from "lucide-react";
import { Circles } from "react-loader-spinner";
import './GameInterface.css';

// Import candy assets
import blueCandy from "../assets/blueCandy.webp";
import redCandy from "../assets/redCandy.png";
import purpleCandy from "../assets/PurpleCandy.png";
import pinkCandy from "../assets/Pink.png";
import rainbowCandy from "../assets/ranbo.png";
import greenCandy from "../assets/green.png";
import colorBombCandy from "../assets/colorBomb.png";
import orangeCandy from "../assets/ornage.png";
import yellowCandy from "../assets/yellow.png";
import gameBg from "../assets/gaming2.png";
import Loader from "./loader";
import RainbowCandyText from "./text";

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

const width = 6; // Columns
const height = 5; // Rows
const totalCells = width * height;

// Create a new grid
const createNewGrid = () => {
  return Array.from({ length: totalCells }, () =>
    candyImages[Math.floor(Math.random() * candyImages.length)]
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

  // Calculate RTP
  const calculateRTP = () => {
    return totalBets === 0 ? 0 : ((totalPayouts / totalBets) * 100).toFixed(2);
  };

  // Check for matches in rows of three
  const checkRowForThree = () => {
    for (let i = 0; i < totalCells; i++) {
      if (i % width > width - 3) continue; // Skip last two columns
      const rowOfThree = [i, i + 1, i + 2];
      const decidedCandy = grid[i];

      if (
        rowOfThree.every(
          (index) => grid[index] === decidedCandy && decidedCandy !== ""
        )
      ) {
        setScore((prevScore) => prevScore + 3);
        rowOfThree.forEach((index) => (grid[index] = ""));
      }
    }
  };

  // Check for matches in columns of three
  const checkColumnForThree = () => {
    for (let i = 0; i < totalCells - 2 * width; i++) {
      const columnOfThree = [i, i + width, i + 2 * width];
      const decidedCandy = grid[i];

      if (
        columnOfThree.every(
          (index) => grid[index] === decidedCandy && decidedCandy !== ""
        )
      ) {
        setScore((prevScore) => prevScore + 3);
        columnOfThree.forEach((index) => (grid[index] = ""));
      }
    }
  };

  // Move candies down after matches
  const moveCandiesDown = () => {
    for (let i = totalCells - 1; i >= 0; i--) {
      if (grid[i] === "") {
        const aboveIndex = i - width;
        if (aboveIndex >= 0) {
          grid[i] = grid[aboveIndex];
          grid[aboveIndex] = "";
        }
      }
    }
  };

  // Fill blanks with new candies
  const fillBlanks = () => {
    for (let i = 0; i < width; i++) {
      if (grid[i] === "") {
        const randomCandy =
          candyImages[Math.floor(Math.random() * candyImages.length)];
        grid[i] = randomCandy;
      }
    }
  };

  // Shuffle the grid
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

  // Main game logic
  useEffect(() => {
    const timer = setInterval(() => {
      checkRowForThree();
      checkColumnForThree();
      moveCandiesDown();
      fillBlanks();
      setGrid([...grid]);
    }, 200);
    return () => clearInterval(timer);
  }, [grid]);

  // Initial loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  return (
    <div
      className="flex justify-center flex-col items-center h-screen bg-cover bg-center main relative"
      style={{ backgroundImage: `url(${gameBg})` }}
    >
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50">

          <Loader />
          <p className="text-white text-xl mt-4">LOADING...</p>
        </div>
      )}
  
      {/* Buy Feature Button */}
      <div className="absolute left-24 top-20">
        <button className="bg-orange-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-orange-500 border-4 border-yellow-300">
          BUY FEATURE
          <div className="text-2xl">$200</div>
        </button>
      </div>

      <RainbowCandyText />
  
      {/* Main Game Board */}
      <div className="w-[60%] h-[60%] relative mt-4 flex justify-center items-center">
        <div className="Game grid grid-cols-6 gap-2 bg-white bg-opacity-90 p-4 w-full h-full">
          {grid.map((candy, index) => (
            <div
              key={index}
              className={`w-full relative rounded-lg shadow-md ${
                isShuffling ? "animate-pulse" : ""
              }`}
            >
              <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${candy})` }}
              />
            </div>
          ))}
        </div>
      </div>
  
      {/* Controls */}
      <div className="h-20 w-full bg-black/50 mt-4 p-12 rounded-lg flex items-center justify-between px-6 shadow-lg border-black-600 backdrop-blur-sm">
        <div className="flex gap-4">
          <Settings className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Info className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
          <Volume2 className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
        </div>
        <div className="text-white">
          <div>Score: {score}</div>
          <div>CREDIT ${playerBalance.toFixed(2)}</div>
        </div>
        <button
          onClick={shuffleGrid}
          className="bg-purple-700 text-white px-6 py-3 rounded-full shadow-md hover:bg-purple-600 border-2 border-white"
        >
          {isShuffling ? "SPINNING" : "SPIN"}
        </button>
      </div>
    </div>
  );
}  

export default GameInterface;
