import { useState } from "react";

const Queue = ({ queue, isHost , onSkip }) => {

  // return (
  //   <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
  //     <h3>Queue</h3>
  //     {queue.length === 0 ? (
  //     <p style={{ color: '#888', fontSize: 14 }}>
  //       Queue is empty — search and add a song!
  //     </p>
  //     ) : (
  //       <ul>
  //         {queue.map((song, i) => (
  //           <li key={i}>
  //             <span>{i + 1}</span>
  //             <div>
  //               <p>{song.title}</p>
  //               <p>added by {song.addedBy}</p>
  //             </div>
  //           </li>
  //         ))}
  //       </ul>
  //     )}
  //   </div>
  // );

  return (
    <div className="flex h-full flex-col font-sans">
      
      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Queue <span className="text-sm font-normal text-slate-500 dark:text-neutral-400">({queue.length})</span>
        </h3>

        {/* Skip Button for Host */}
        {isHost && queue.length > 0 && (
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-neutral-800/80 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-white transition-colors hover:bg-blue-600 hover:text-white hover:shadow-[0_0_10px_rgba(37,99,235,0.5)]"
            title="Skip current song"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
            Skip
          </button>
        )}
      </div>

      {/* Scrollable Queue List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {queue.length === 0 ? (
          
          /* Empty State */
          <div className="flex h-32 flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
            <svg className="mb-2 h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
            </svg>
            <p className="text-sm font-medium text-center">
              Queue is empty<br/>Search and add a song!
            </p>
          </div>
          
        ) : (
          
          /* Populated List */
          <ul className="space-y-2">
            {queue.map((song, i) => (
              <li
                key={i}
                className={`group flex items-center gap-4 rounded-xl border p-3 transition-colors ${
                  i === 0
                    ? 'border-blue-500/30 bg-blue-100/60 dark:bg-blue-900/20 shadow-inner' // Active/First song highlight
                    : 'border-slate-200 dark:border-neutral-800/50 bg-white dark:bg-neutral-950/40 hover:bg-slate-100 dark:hover:bg-neutral-800/80'
                }`}
              >

                {/* Index / Playing Indicator */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                  i === 0
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-200 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 group-hover:text-slate-700 dark:group-hover:text-neutral-200'
                }`}>
                  {i === 0 ? (
                    // Show a play icon for the top song
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Song Info */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  <p className={`truncate text-sm font-medium ${i === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                    {song.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-neutral-400">
                    added by <span className="text-slate-700 dark:text-neutral-300 font-medium">{song.addedBy}</span>
                  </p>
                </div>
                
              </li>
            ))}
          </ul>
        )}
      </div>
      
    </div>
  );
};

export default Queue;
