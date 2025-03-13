
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bot, Menu, X, User, LogIn, Settings, Home, LogOut, Search, BadgeIndianRupee, Banknote, PiggyBank, HandCoins, MessageCircleMore, Moon, Sun } from "lucide-react";
import { logout, toggleMode } from "../../store/authSlice";
import { disconnectSocket } from "../../lib/socket.js";

const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dispatch = useDispatch();

  const { userData, status, mode } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      setSidebarOpen(window.innerWidth >= 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSearch = () => {
    if (query) {
      navigate(`/searchedUsers?query=${query}`);
      setQuery("");
      setMobileSearchVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        disconnectSocket(userData._id);
        dispatch(logout());
        navigate("/login");
      }
    } catch (error) {
      console.error("Error while logging out:", error);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  const handleThemeToggle = () => {
    dispatch(toggleMode());
  };

  return (
    <div className="h-screen flex flex-col dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4 shadow-lg">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}

          <Link
            to="/"
            className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 hover:text-blue-500 transition duration-300"
          >
            Prime<span className="text-yellow-400">Finance</span>
          </Link>
        </div>

        {/* Desktop Search and Right Section */}
        <div className="flex items-center space-x-4">
          {status && (
            <>
              <div className="hidden sm:flex items-center space-x-2 bg-white dark:bg-gray-700 shadow-lg rounded-full px-4 py-1">
                <input
                  type="text"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none rounded-full px-2 py-1"
                />
                <button
                  onClick={handleSearch}
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
                >
                  <Search size={20} />
                </button>
              </div>
              <button
                onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
                className="sm:hidden text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
              >
                <Search size={24} />
              </button>
            </>
          )}

          <button
            onClick={handleThemeToggle}
            className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
          >
            {mode === "light" ? <Moon size={24} /> : <Sun size={24} />}
          </button>

          {status ? (
            <Link to="/profile">
              <div className="flex items-center space-x-2">
                {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <User
                    size={32}
                    className="text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-500 transition duration-300"
                  />
                )}
              </div>
            </Link>
          ) : (
            <Link to="/login">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-lg transition duration-300">
                <LogIn size={20} />
                <span>Login</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchVisible && (
        <div className="sm:hidden p-2 bg-gray-100 dark:bg-gray-800">
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-full px-4 py-1">
            <input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-grow text-gray-700 dark:text-gray-200 bg-transparent focus:outline-none rounded-full px-2 py-1"
            />
            <button
              onClick={handleSearch}
              className="text-gray-700 dark:text-gray-200 hover:text-blue-500 transition duration-300"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            x: isMobile ? (isSidebarOpen ? 0 : -300) : 0,
            width: isMobile ? 256 : (isSidebarOpen ? 256 : 64),
          }}
          className={`fixed sm:relative h-full bg-gradient-to-b from-gray-800 to-gray-700 text-white shadow-lg z-50`}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-600">
            <span className={`text-lg font-bold ${isSidebarOpen ? "block" : "hidden"}`}>
              Menu
            </span>
            <button
              onClick={toggleSidebar}
              className="text-white hover:bg-gray-600 p-2 rounded-full hidden sm:block"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="flex-1 flex flex-col mt-4 space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300"
            >
              <Home size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </Link>
            {status && (
              <>
                <Link to='/budget' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <BadgeIndianRupee size={20} />
                  {isSidebarOpen && <span>Budget</span>}
                </Link>
                <Link to='/debt' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <Banknote size={20} />
                  {isSidebarOpen && <span>Debt</span>}
                </Link>
                <Link to='/saving' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <PiggyBank size={20} />
                  {isSidebarOpen && <span>Savings</span>}
                </Link>
                <Link to='/recurringPayment' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <HandCoins size={20} />
                  {isSidebarOpen && <span>Recurring Payment</span>}
                </Link>
                <Link to='/chat' className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <MessageCircleMore size={20} />
                  {isSidebarOpen && <span>Chat</span>}
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-600 rounded transition duration-300">
                  <LogOut size={20} />
                  {isSidebarOpen && <span>Logout</span>}
                </button>
              </>
            )}
          </div>
        </motion.div>

        {/* Overlay for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="fixed inset-0 bg-black z-40"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;