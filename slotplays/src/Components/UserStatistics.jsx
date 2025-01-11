import React, { useState } from "react";

const UserStatistics = () => {
  const [statistics, setStatistics] = useState({
    spins: 0,
    wins: 0,
    losses: 0,
  });

  const updateStats = (type) => {
    setStatistics((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Statistics</h2>
      <div className="space-y-2">
        <p>Spins: {statistics.spins}</p>
        <p>Wins: {statistics.wins}</p>
        <p>Losses: {statistics.losses}</p>
      </div>
      <div className="mt-4 space-x-2">
        <button
          onClick={() => updateStats("spins")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Simulate Spin
        </button>
        <button
          onClick={() => updateStats("wins")}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Simulate Win
        </button>
        <button
          onClick={() => updateStats("losses")}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Simulate Loss
        </button>
      </div>
    </div>
  );
};

export default UserStatistics;
