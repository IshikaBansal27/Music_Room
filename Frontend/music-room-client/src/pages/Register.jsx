import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-950 font-sans antialiased transition-colors duration-300">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-300/40 dark:bg-purple-900/30 blur-[100px] transition-colors duration-500" />
        <div className="absolute top-1/2 right-1/4 h-72 w-72 rounded-full bg-blue-300/40 dark:bg-blue-900/30 blur-[100px] transition-colors duration-500" />
        <div className="absolute bottom-1/4 left-1/3 h-96 w-96 rounded-full bg-slate-300/50 dark:bg-zinc-900/30 blur-[120px] transition-colors duration-500" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-slate-200 dark:bg-neutral-900 dark:border-neutral-800 dark:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] transition-colors duration-300">
        {/* Headphone & Soundwave Logo and Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <svg
              className="absolute -inset-6 h-28 w-28 text-blue-400/30 dark:text-blue-500/30"
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
              className="h-16 w-16 text-blue-600 dark:text-blue-500"
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
              <path
                className="fill-current text-slate-900 dark:text-white"
                d="M10 8l6 4-6 4V8z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 transition-colors">
            Music Room
          </h1>
        </div>

        {/* <div className="dark:text-white items-center justify-center">
          <h3>Welcome New User!</h3>
        </div> */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-neutral-300 transition-colors"
            >
              UserName
            </label>
            <input
              id="user"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
              required
              className="w-full rounded-xl bg-white border border-slate-300 p-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-600 transition duration-150 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-neutral-300 transition-colors"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 10 }}
              required
              className="w-full rounded-xl bg-white border border-slate-300 p-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-600 transition duration-150 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-neutral-300 transition-colors"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-slate-300 p-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white dark:placeholder:text-neutral-600 transition duration-150 outline-none"
            />
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-md hover:bg-blue-700 transition duration-150 active:scale-[0.98]"
          >
            Register
          </button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-neutral-400 transition-colors">
          <span>Already have an account?</span>
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:underline transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
