import React from "react";

const Loading = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="relative">
                {/* Spinning Ring */}
                <div className="w-20 h-20 border-4 border-transparent border-t-blue-500 border-l-blue-500 rounded-full animate-spin"></div>

                {/* Pulsing Dot */}
                <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

                {/* Bouncing Text */}
                <div className="absolute top-full left-1/2 mt-4 text-white text-lg font-semibold tracking-widest animate-bounce">
                    Loading...
                </div>
            </div>
        </div>
    );
};

export default Loading;
