import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const TopBar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  }

  return (
    <header className="relative z-40 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-950/50 backdrop-blur-md transition-colors">
      {/* Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <svg
            className="absolute -inset-2 h-10 w-10 text-blue-500/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z"
            />
          </svg>
          <svg
            className="h-6 w-6 text-blue-500 relative z-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
            />
            <path className="fill-current text-white" d="M10 8l6 4-6 4V8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Music Room
        </h1>
      </div>

      {/* User Info & Dropdown */}

      <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800/80 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="hidden items-center gap-1 sm:flex">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {user?.username || "User"}
              </span>
              <svg
                className={`h-4 w-4 text-slate-400 dark:text-neutral-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/95 py-1 shadow-2xl backdrop-blur-md z-50
            ">
              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-neutral-300 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800/80 hover:text-slate-900 dark:hover:text-white"
              >
                {isDarkMode ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>

              <div className="mx-2 my-1 h-px bg-slate-200 dark:bg-neutral-800/80"></div>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800/80"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
    </header>
  );
};

export default TopBar;
