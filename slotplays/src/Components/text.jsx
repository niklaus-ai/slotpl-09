import React from 'react';

const RainbowCandyText = () => {
  const slotLetters = [
    { letter: 'S', color: 'text-pink-500' },
    { letter: 'L', color: 'text-purple-500' },
    { letter: 'O', color: 'text-yellow-400' },
    { letter: 'T', color: 'text-green-400' }
  ];

  const Play = [
    { letter: 'P', color: 'text-red-500' },
    { letter: 'L', color: 'text-yellow-500' },
    { letter: 'A', color: 'text-green-500' },
    { letter: 'Y', color: 'text-blue-500' },
  ];

  return (
    <div className="bg-transparent p-1  flex flex-col items-center justify-center">
      <div className="flex gap-6 text-6xl font-extrabold">
        <div className="flex">
          {slotLetters.map((item, index) => (
            <span
              key={index}
              className={`${item.color} transform hover:scale-90 transition-transform
                filter drop-shadow-lg
                [text-shadow:_2px_2px_0_rgb(255_255_255),_-2px_-2px_0_rgb(255_255_255),_2px_-2px_0_rgb(255_255_255),_-2px_2px_0_rgb(255_255_255)]
                relative`}
            >
              <span className="relative inline-block transform hover:rotate-6 transition-transform duration-200">
                {item.letter}
              </span>
            </span>
          ))}
        </div>

        <div className="flex">
          {Play.map((item, index) => (
            <span
              key={index}
              className={`${item.color} transform hover:scale-110 transition-transform
                filter drop-shadow-lg
                [text-shadow:_2px_2px_0_rgb(255_255_255),_-2px_-2px_0_rgb(255_255_255),_2px_-2px_0_rgb(255_255_255),_-2px_2px_0_rgb(255_255_255)]
                relative`}
            >
              <span className="relative inline-block transform hover:rotate-6 transition-transform duration-200">
                {item.letter}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RainbowCandyText;