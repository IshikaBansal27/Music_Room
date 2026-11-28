import { useState } from 'react';
import api from '../api/axios';

const SongSearch = ({ onAddSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDropdown, setDropdown] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) 
    {
      setDropdown(false);
      return;
    }

    setDropdown(true);
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await api.get('/youtube/search', { params: { q: query } });
      setResults(res.data.songs);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed to 'relative' so the absolute dropdown positions itself against this container
    <div className="relative font-sans w-full">
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 w-full">
        <input
          placeholder="Search for a song to add in queue..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Changed to w-full so it spans the flex container properly
          className="w-full rounded-xl border border-slate-300 dark:border-neutral-700/50 bg-white dark:bg-neutral-950/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-neutral-800 disabled:text-slate-400 dark:disabled:text-neutral-500"
        >
          {loading ? (
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Dropdown Results */}
      {openDropdown && (
        <div 
          className="absolute left-0 right-0 top-full mt-2 z-50 flex flex-col overflow-y-auto custom-scrollbar space-y-2 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-md max-h-[400px]"
        >

          {/* Error Message Display inside dropdown for better context */}
          {error && (
            <p className="shrink-0 rounded-lg border border-red-300 dark:border-red-900/50 bg-red-100 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {results.map((song) => (
            <div
              key={song.videoId}
              className="group flex items-center gap-3 rounded-lg border border-slate-200 dark:border-neutral-800/50 bg-slate-50 dark:bg-neutral-950/60 p-2 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800/80"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md bg-slate-200 dark:bg-neutral-800 shadow-sm">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Song Info (Title & Channel) */}
              <div className="flex flex-1 flex-col overflow-hidden">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{song.title}</p>
                <p className="truncate text-xs text-slate-500 dark:text-neutral-400">{song.channel}</p>
              </div>

              {/* Add to Queue Button */}
              <button
                onClick={() => {
                  onAddSong(song.videoId, song.title);
                  setDropdown(false); // Close dropdown after adding
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors hover:bg-blue-600 hover:text-white hover:shadow-[0_0_10px_rgba(37,99,235,0.5)] mr-1"
                title="Add to queue"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          ))}

          {/* Empty State (When no results are present) */}
          {results.length === 0 && !loading && !error && (
            <div className="flex h-32 flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
              <svg className="mb-2 h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
              </svg>
              <p className="text-sm">No songs found</p>
            </div>
          )}

          {/* Optional: A close button for the dropdown */}
          <button
            onClick={() => setDropdown(false)}
            className="w-full text-center text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-300 pt-1 pb-1 mt-1 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SongSearch;