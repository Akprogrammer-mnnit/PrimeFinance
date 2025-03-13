import React from "react";
import { Dashboard as DashboardComponent, Container } from "../componenets/index.js";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

function HomePage() {
    const status = useSelector((state) => state.auth.status);

    if (!status) {
        return (
            <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden px-4 sm:px-6">

                {/* Background Gradient & Animated Abstract Circles */}
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-40 h-40 sm:w-72 sm:h-72 bg-purple-500 rounded-full blur-3xl opacity-30 animate-bounce-slow"></div>
                    <div className="absolute bottom-10 right-6 w-48 h-48 sm:w-80 sm:h-80 bg-blue-500 rounded-full blur-3xl opacity-30 animate-bounce-slow delay-1000"></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 text-center flex flex-col items-center px-4">
                    <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-wide drop-shadow-lg opacity-0 animate-fade-in-up">
                        Prime<span className="text-yellow-400">Finance</span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 mt-4 max-w-xl opacity-0 animate-fade-in-up delay-300">
                        Take control of your finances with powerful insights and seamless tracking.
                    </p>

                    <Link
                        to="/login"
                        className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-red-500 rounded-full shadow-lg transition-all hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-400 animate-pulse hover:shadow-red-500 hover:scale-105"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Glassmorphic Info Card */}
                <div className="absolute bottom-10 sm:bottom-16 right-6 sm:right-16 p-4 sm:p-6 rounded-2xl shadow-2xl bg-white bg-opacity-10 backdrop-blur-md text-center border border-white/20 w-64 sm:w-80 opacity-0 animate-fade-in-up delay-500">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Why Choose Us?</h2>
                    <p className="text-gray-300 text-sm mt-2 sm:mt-3">
                        Secure, insightful, and easy-to-use finance management at your fingertips.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <Container>
            <DashboardComponent />
        </Container>
    );
}

export default HomePage;
