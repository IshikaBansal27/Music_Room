import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EMOJIS = [
  '😀', '😂', '🥹', '😍', '😎', '🤩', '🥳', '😢',
  '😡', '🤔', '🙌', '👏', '👍', '👎', '🙏', '💪',
  '❤️', '🔥', '🎉', '✨', '🎵', '🎶', '🎤', '🎧',
  '💃', '🕺', '🪩', '⭐', '💯', '😴', '😭', '🤯',
];

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = ({ messages, onSendMessage }) => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const pickerRef = useRef(null);

  useEffect(() => {
    // Scroll only the message list itself, not scrollIntoView (which would
    // bubble up and scroll the whole page when the page itself can scroll,
    // e.g. the stacked mobile layout).
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText('');
  };

  const handleEmojiClick = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col font-sans">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-slate-400 dark:text-neutral-500">
            <svg className="mb-2 h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs text-slate-400 dark:text-neutral-600">Say hi to the room!</p>
          </div>
        )}

        {messages.map((m, i) => {
          const isSystem = m.username === '🎵 System';
          const isOwn = !isSystem && m.username === user?.username;

          if (isSystem) {
            return (
              <div key={i} className="flex justify-center">
                <span className="rounded-full bg-slate-200/70 dark:bg-neutral-800/60 px-3 py-1 text-xs text-slate-500 dark:text-neutral-400">
                  {m.message}
                </span>
              </div>
            );
          }

          return (
            <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                  <span className="px-1 text-xs font-semibold text-blue-600 dark:text-blue-400">{m.username}</span>
                )}
                <div
                  className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                    isOwn
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm border border-slate-200 dark:border-neutral-800/80 bg-slate-100 dark:bg-neutral-800/80 text-slate-800 dark:text-neutral-100'
                  }`}
                >
                  <span className="break-words">{m.message}</span>
                </div>
                {m.timestamp && (
                  <span className="px-1 text-[10px] text-slate-400 dark:text-neutral-500">{formatTime(m.timestamp)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="relative mt-3 flex items-center gap-2">
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full left-0 mb-2 grid w-64 grid-cols-8 gap-1 rounded-xl border border-slate-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-md z-50"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-base hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowEmojiPicker((v) => !v)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg transition-colors ${
            showEmojiPicker ? 'bg-blue-600/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-neutral-800/80 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Add emoji"
        >
          🙂
        </button>

        <input
          ref={inputRef}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full flex-1 rounded-xl border border-slate-300 dark:border-neutral-700/50 bg-white dark:bg-neutral-950/80 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-md transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 dark:disabled:bg-neutral-800 disabled:text-slate-400 dark:disabled:text-neutral-500"
          title="Send"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7v4C7 9 4 14 3 19c3-2 5.5-2.5 9-2.5V19z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default Chat;
