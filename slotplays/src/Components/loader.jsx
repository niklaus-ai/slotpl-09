import React from 'react';

const Loader = () => {
  return (
    <div className="w-[100%] h-[100%] bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Logo Container */}
        <div className="relative">
          {/* Circle */}
          <div className="h-24 w-24 rounded-full border-4 border-orange-500 relative">
            {/* Crown */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="w-6 h-6 bg-orange-500 transform rotate-45" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Text */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-white text-xl font-bold">SLOT</span>
            <span className="text-white text-xl font-bold ml-2">PLAY</span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-gray-800 rounded-full mt-12 overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full animate-loading-bar" />
        </div>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;