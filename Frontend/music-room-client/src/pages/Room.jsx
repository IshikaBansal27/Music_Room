import { useEffect, useState, useRef } from "react";
import { useParams , useNavigate } from "react-router-dom";
import api from "../api/axios";
import { connectSocket, getSocket, disconnectSocket } from "../socket";
import { useAuth } from "../context/AuthContext";
import YoutubePlayer from "../components/YouTubePlayer";
import Queue from "../components/Queue";
import Chat from "../components/chat";
import SongSearch from "../components/SongSearch";
import RoomTopBar from "../components/RoomTopBar";

const Room = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const playerRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [host, setHost] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false); // ← add this
  const [toast, setToast] = useState(null);
  const pendingSyncRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message) => {
    clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
  if (playerReady && pendingSyncRef.current) {
    const { timestamp, isPlaying } = pendingSyncRef.current;
    pendingSyncRef.current = null; // clear it after applying

    playerRef.current?.seekTo(timestamp);
    if (isPlaying) {
      playerRef.current?.play();
      setIsPlaying(true);
    }
  }
}, [playerReady]);

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      // Re-join on every (re)connect — a dropped connection (e.g. laptop sleep)
      // reconnects with a fresh server-side socket that isn't in the room yet,
      // so without this the client silently stops receiving broadcasts.
      socket.emit('join-room', { roomId });
    });
    socket.on('connect_error', (err) => console.log('❌ Socket error:', err.message));

    api.get(`/rooms/${roomId}`).then((res) => {
      const r = res.data.room;
      setRoom(r);
      setHost(r.host.username);
      setMembers(r.members.map((m) => m.username));
      setIsHost(r.host.username === user.username);
      setQueue(r.queue);
      setCurrentSong(r.currentSong);
    }).catch((err) => {
      alert(err.response?.data?.message || "Room not found");
      navigate('/');
    });

    socket.on('room-state', (state) => {
      setCurrentSong(state.currentSong);
      setQueue(state.queue);
      setMembers(state.members);
      setHost(state.host);

      if (state.currentSong?.videoId) {
        const { timestamp, isPlaying, lastUpdateAt } = state.currentSong;
        // A playing song keeps advancing after the server last recorded its
        // position, so add however long it's been since then; a paused one
        // hasn't moved, so use the stored position as-is.
        const elapsedSeconds = isPlaying && lastUpdateAt
          ? (Date.now() - lastUpdateAt) / 1000
          : 0;

        pendingSyncRef.current = {
          timestamp: timestamp + elapsedSeconds,
          isPlaying,
        };
      }
    });

    socket.on('play', ({ timestamp }) => {
      playerRef.current?.seekTo(timestamp);
      playerRef.current?.play();
      setIsPlaying(true);
    });

    socket.on('pause', ({ timestamp }) => {
      playerRef.current?.seekTo(timestamp);
      playerRef.current?.pause();
      setIsPlaying(false);
    });

    socket.on('seek', ({ timestamp }) => {
      playerRef.current?.seekTo(timestamp);
    });

    socket.on('song-changed', ({ currentSong, queue }) => {
      setCurrentSong(currentSong);
      setQueue(queue);
      setIsPlaying(true);
    });

    socket.on('queue-updated', ({ queue }) => {
      setQueue(queue);
    });

    socket.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('user-joined', ({ username }) => {
      setMembers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );
      setMessages((prev) => [
        ...prev,
        { username: '🎵 System', message: `${username} joined the room`, timestamp: new Date().toISOString() }
      ]);
    });

    socket.on('user-left', ({ username }) => {
      setMembers((prev) => prev.filter((m) => m !== username));
      setMessages((prev) => [
        ...prev,
        { username: '🎵 System', message: `${username} left the room`, timestamp: new Date().toISOString() }
      ]);
    });

    socket.on('room-closed', ({ message }) => {
      alert(message);
      navigate('/');
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err.message);
      showToast(err.message);
    });

    return () => {
      socket.emit('leave-room', { roomId });
      disconnectSocket();
      clearTimeout(toastTimeoutRef.current);
    };
    // eslint-disable-next-line
  }, [roomId]);

  const handlePlay = () => {
    const timestamp = playerRef.current.getCurrentTime();
    getSocket().emit("play", { roomId, timestamp });
    playerRef.current.play();
  };

  const handlePause = () => {
    const timestamp = playerRef.current.getCurrentTime();
    getSocket().emit("pause", { roomId, timestamp });
    playerRef.current.pause();
  };

  const handleSkip = () => {
    getSocket().emit("skip", { roomId });
  };

  const handleAddSong = (videoId, title) => {
    getSocket().emit("add-to-queue", { roomId, videoId, title });
  };

  const handleSendMessage = (message) => {
    getSocket().emit("chat-message", { roomId, message });
  };

  const handleLeaveRoom = () => {
    // Actually remove membership server-side (the socket 'leave-room' emit
    // below only notifies other clients in real time — it never touched the DB).
    // Not awaited: navigating away immediately unmounts this component anyway,
    // which triggers the effect cleanup's socket disconnect.
    api.post(`/rooms/leave/${roomId}`).catch((err) => {
      console.error('Failed to leave room:', err);
    });
    navigate('/');
  }

  if (!room) return <p>Loading room...</p>;

  // return (
  //   <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'sans-serif' }}>
  //     <h2>{room.name}</h2>
  //     <p>
  //       Room code: <strong>{room.code}</strong> — share this with friends!
  //     </p>

  //     <YoutubePlayer
  //       ref={playerRef}
  //       videoId={currentSong?.videoId}
  //       onReady={() => console.log("Player ready")}
  //     ></YoutubePlayer>

  //     {isHost && (
  //       <div style={{ margin: "16px 0", display: "flex", gap: 10 }}>
  //         <button onClick={handlePlay}>▶ Play</button>
  //         <button onClick={handlePause}>⏸ Pause</button>
  //         <button onClick={handleSkip}>⏭ Skip</button>
  //       </div>
  //     )}

  //     {!isHost && (
  //       <p style={{ color: "gray" }}>Only the host can control playback</p>
  //     )}

  //     <Queue queue={queue} onAddSong={handleAddSong} />
  //     <Chat messages={messages} onSendMessage={handleSendMessage} />

  //     <div>
  //       {/* <MemberList members={members} host={host} /> */}
  //       <div style={{ marginTop: 16 }}>
  //         <SongSearch onAddSong={handleAddSong} />
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-neutral-950 font-sans text-slate-900 dark:text-white antialiased overflow-y-auto lg:overflow-hidden transition-colors">
      
      {/* Background ambient lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-1/2 -right-24 h-[400px] w-[400px] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* Toast notifications (surfaces socket errors that used to be console-only) */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-xl border border-red-300 dark:border-red-900/50 bg-white dark:bg-neutral-900 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 shadow-2xl">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {toast}
        </div>
      )}

      {/* topbar */}
      <RoomTopBar
        room = {room}
        leaveRoom ={handleLeaveRoom}
        members={members}
        host={host}
        handleAddSong = {handleAddSong}
      />

      {/* Main Dashboard Grid */}
      <main className="relative z-10 flex flex-1 flex-col lg:flex-row gap-6 overflow-visible lg:overflow-hidden p-4 sm:p-6 max-w-[1600px] mx-auto w-full">

        {/* LEFT COLUMN: Media & Queue (Takes up 2/3 of space on large screens, full width on small) */}
        <div className="flex w-full lg:w-2/3 flex-col gap-6 overflow-y-auto pr-0 lg:pr-2 custom-scrollbar">
          
          {/* YouTube Player Section */}
          <div className="flex flex-col w-full rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 shadow-2xl backdrop-blur-md transition-colors">
            {/* 16:9 Aspect Ratio Container for Video */}
            <div className="relative w-full overflow-hidden rounded-t-2xl pt-[56.25%] bg-black">
              <div className="absolute inset-0 h-full w-full">
                  <YoutubePlayer
                    ref={playerRef}
                    videoId={currentSong?.videoId}
                    onReady={() => setPlayerReady(true)} 
                  ></YoutubePlayer>
              </div>
            </div>

            {/* Host Controls Area */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-neutral-800 p-4">
              <div>
                <h3 className="font-semibold text-lg">{currentSong?.title || 'Waiting for next song...'}</h3>
                <p className="text-sm text-slate-500 dark:text-neutral-400">Now Playing</p>
              </div>

              {isHost ? (
                <div className="flex items-center gap-3">
                  <button onClick={handlePlay} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                    <svg className="h-5 w-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <button onClick={handlePause} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  </button>
                  <button onClick={handleSkip} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-white hover:bg-blue-600 hover:text-white transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-neutral-800/50 px-3 py-1.5 border border-slate-200 dark:border-neutral-700/50">
                   <svg className="h-4 w-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs text-slate-600 dark:text-neutral-400 font-medium">Host controls playback</span>
                </div>
              )}
            </div>
          </div>

          {/* Search & Queue Section */}
          <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 p-5 shadow-xl backdrop-blur-md transition-colors">

            {/* Queue List Wrapper */}

            <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-neutral-800/50 bg-slate-50 dark:bg-neutral-950/30 p-2">
              <Queue queue={queue} onAddSong={handleAddSong} />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Social (Takes up 1/3 of space on large screens, full width on small) */}
        <div className="flex w-full lg:w-1/3 flex-col gap-6 pr-0 lg:pr-2 ">

          {/* Chat Box */}
          <div className="flex h-[480px] lg:h-full flex-col rounded-2xl border border-slate-200 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/70 shadow-xl backdrop-blur-md transition-colors">
            <div className="border-b border-slate-200 dark:border-neutral-800 p-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Room Chat
              </h3>
            </div>
            
            <div className="flex flex-1 flex-col overflow-hidden p-4 bg-slate-50 dark:bg-neutral-950/30">
              <Chat messages={messages} onSendMessage={handleSendMessage} />
            </div>
          </div>

        </div>
      </main>

      {/* Global styling for custom scrollbars to keep it looking clean */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(82, 82, 91, 0.5);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(113, 113, 122, 0.8);
        }
      `}} />
    </div>
  );
};


export default Room;
