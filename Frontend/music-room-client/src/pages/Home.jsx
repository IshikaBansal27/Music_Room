import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import  TopBar  from '../components/topBar';

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [createError, setCreateError] = useState('');
  const [joinError, setJoinError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await api.post('/rooms/create', { name: roomName });
      navigate(`/room/${res.data.room._id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    try {
      const res = await api.post(`/rooms/join/${joinCode}`);
      navigate(`/room/${res.data.room._id}`);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to join room');
    }
  };

  const generateWaveHeight = (index) => {
    // Uses sine and cosine math to create a natural looking soundwave
    return 10 + Math.abs(Math.sin(index * 0.2) * 55) + Math.abs(Math.cos(index * 0.6) * 30);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 font-sans antialiased flex flex-col transition-colors">
      {/* Blurred background bokeh lights */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/40 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/40 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/2 h-[300px] w-[300px] rounded-full bg-indigo-500/15 blur-[100px]" />
      </div>

      {/* 2. THE MUSIC LIGHTS (Soundwave Spectrum at the bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none flex items-end justify-between gap-[2px] opacity-15">
        {[...Array(80)].map((_, i) => (
          <div 
            key={i} 
            className="w-full bg-gradient-to-t from-blue-700 to-indigo-300 rounded-t-md"
            style={{ height: `${generateWaveHeight(i)}%` }}
          />
        ))}
      </div>

      <TopBar/>
    
      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Card 1: Create a Room */}
          <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-10 shadow-2xl border border-slate-200 dark:border-neutral-800 transition-colors">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="mb-4 text-blue-500 flex items-center justify-center h-16 w-16">
                {/* Plus + Soundwave Icon */}
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" className="text-blue-400" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 10v4m-4-8v12m-4-10v8m-4-6v4" className="text-blue-600" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-widest mb-2">Start your Jam</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">Create your unique<br/>Music Room</h2>
              <p className="text-slate-500 dark:text-neutral-500 text-sm max-w-xs">Give your room a unique name and control the queue.</p>
            </div>

            <form onSubmit={handleCreate} className="mt-auto space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1">Room name</label>
                <input
                  type="text"
                  placeholder="My Vibez Room"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 p-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 outline-none shadow-inner"
                />
              </div>
              {createError && (
                <p className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
                  {createError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg hover:bg-blue-500 transition duration-150 active:scale-[0.98] uppercase tracking-wide text-sm"
              >
                Create Room
              </button>
            </form>
          </div>

          {/* Card 2: Join a Room */}
          <div className="flex flex-col rounded-3xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-10 shadow-2xl border border-slate-200 dark:border-neutral-800 transition-colors">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="mb-4 text-blue-500 relative flex items-center justify-center h-16 w-16">
                 {/* Headphones Icon */}
                 <svg className="absolute -inset-4 h-24 w-24 text-blue-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                <svg className="h-12 w-12 relative z-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 00-9-9 9 9 0 00-9 9v7c0 1.1.9 2 2 2h2v-7h-4v-2a7 7 0 1114 0v2h-4v7h2c1.1 0 2-.9 2-2v-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-widest mb-2">Join a Room</p>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Join an existing Room</h2>
              <p className="text-slate-500 dark:text-neutral-500 text-sm max-w-xs">Enter a 6-character code to jump in and listen together.</p>
            </div>

            <form onSubmit={handleJoin} className="mt-auto space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600 dark:text-neutral-300 ml-1">Room code</label>
                <input
                  type="text"
                  placeholder="X K 9 F 2 A"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  maxLength={6}
                  className="w-full rounded-xl bg-white dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 p-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 outline-none shadow-inner text-center text-xl tracking-[0.5em] font-mono"
                />
              </div>
              {joinError && (
                <p className="rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-500/50 px-3 py-2 text-center text-sm text-red-600 dark:text-red-400">
                  {joinError}
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg hover:bg-blue-500 transition duration-150 active:scale-[0.98] uppercase tracking-wide text-sm"
              >
                Join Room
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Home;