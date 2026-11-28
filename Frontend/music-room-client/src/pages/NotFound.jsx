import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-950 font-sans antialiased transition-colors duration-300 px-6">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-300/40 dark:bg-purple-900/30 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 h-72 w-72 rounded-full bg-blue-300/40 dark:bg-blue-900/30 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <svg className="h-16 w-16 text-blue-600 dark:text-blue-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
        </svg>
        <h1 className="text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">404</h1>
        <p className="text-lg font-medium text-slate-600 dark:text-neutral-300 mb-1">Page not found</p>
        <p className="text-sm text-slate-500 dark:text-neutral-500 mb-8 max-w-sm">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-500 transition duration-150 active:scale-[0.98] uppercase tracking-wide text-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
