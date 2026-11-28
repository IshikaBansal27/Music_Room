import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import SongSearch from "./SongSearch";

const RoomTopBar = ({
  room,
  members = [],
  leaveRoom,
  host,
  handleAddSong,
}) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  // State for dropdowns and copy feedback
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const userMenuRef = useRef(null);
  const membersMenuRef = useRef(null);

  // Close whichever dropdown is open when clicking outside of it
  useEffect(() => {
    if (!isUserMenuOpen && !isMembersOpen) return;

    const handleClickOutside = (e) => {
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (isMembersOpen && membersMenuRef.current && !membersMenuRef.current.contains(e.target)) {
        setIsMembersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isMembersOpen]);

  // Handle Copy Room Code
  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    }
  };

  // Toggle handlers (ensure only one dropdown is open at a time)
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsMembersOpen(false);
  };

  const toggleMembersMenu = () => {
    setIsMembersOpen(!isMembersOpen);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="relative z-40 flex flex-wrap items-center justify-between gap-y-3 px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-neutral-800/50 bg-white/70 dark:bg-neutral-950/50 backdrop-blur-md transition-colors">
      
      {/* 1. LEFT: Logo, Title, & Code (flex-1 ensures it balances the right side) */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
          <svg
            className="h-6 w-6 relative z-10"
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
        
        {/* Adjusted to stack name and code cleanly */}
        <div className="flex flex-col justify-center hidden sm:flex">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            {room?.name || "Music Room"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center bg-slate-100 dark:bg-neutral-900/60 border border-slate-300 dark:border-neutral-700/50 rounded px-1.5 py-0.5 shadow-inner">
              <span className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">
                Code
              </span>
            </div>
            <span className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold tracking-widest">
              {room?.code || "------"}
            </span>

            <button
              onClick={handleCopyCode}
              className="text-slate-400 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none ml-1"
              title="Copy Room Code"
            >
              {isCopied ? (
                <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CENTER: Add To Queue Song (flex-1 and justify-center keeps it dead center on large screens; full-width on its own row on small ones) */}
      <div className="order-3 w-full lg:order-none lg:flex-1 flex justify-center lg:px-4 lg:max-w-lg">
        <div className="w-full">
          <SongSearch onAddSong={handleAddSong} />
        </div>
      </div>

      {/* 3. RIGHT: Action Buttons & Dropdowns (flex-1 and justify-end balances the left side) */}
      <div className="flex items-center justify-end gap-3 flex-1">
        
        {/* MEMBERS DROPDOWN */}
        <div className="relative" ref={membersMenuRef}>
          <button
            onClick={toggleMembersMenu}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
              isMembersOpen
                ? "bg-blue-600/20 border-blue-500/50 text-blue-600 dark:text-blue-400"
                : "bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{members.length}</span>
          </button>

          {isMembersOpen && (
            <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/95 py-2 shadow-2xl backdrop-blur-md z-50">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-neutral-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Room Members</h3>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {members.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-neutral-500 text-center py-4">No other members</p>
                ) : (
                  members.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-neutral-800/50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-400 dark:bg-neutral-700 text-xs font-bold text-white">
                        {member.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-neutral-200 truncate">{member}</span>
                      {member === host && (
                        <svg className="h-4 w-4 text-yellow-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE DROPDOWN */}
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
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{user?.username || "User"}</span>
              <svg
                className={`h-4 w-4 text-slate-400 dark:text-neutral-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/95 py-1 shadow-2xl backdrop-blur-md z-50">
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
                onClick={() => {
                  setIsUserMenuOpen(false);
                  leaveRoom();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 dark:text-red-400 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800/80"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Leave Room
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default RoomTopBar;