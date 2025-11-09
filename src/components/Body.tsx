function Body() {
  return (
    <div className="w-full max-w-lg rounded-xl border border-white/20 bg-white/10 p-8 text-center text-gray-100 shadow-2xl backdrop-blur-md transition duration-300 hover:bg-white/15 sm:p-10">
      <h2>This website collects your:</h2>

      <div className="card-container relative flex h-[180px] w-full max-w-[280px] flex-row overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition duration-300">
        <div className="slash-panel flex w-2/5 flex-shrink-0 flex-col items-center justify-center p-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-cyan-400/50 bg-white/20 shadow-inner backdrop-blur-sm transition duration-500 hover:scale-110">
            <svg
              className="h-8 w-8 text-cyan-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93h2c0 2.95 2.15 5.37 5 5.91v2.02zM19.93 11H17.91c-.54-2.85-2.96-4.99-5.91-5.37V4.07c3.95.48 7.09 3.84 7.09 7.93z" />
            </svg>
          </div>
          <p className="mt-1 text-center text-[8px] font-semibold tracking-widest text-gray-400 uppercase">
            STATUS
          </p>
        </div>

        <div className="content-panel flex w-3/5 flex-col justify-center p-3">
          <h1 className="glow-text mb-0.5 text-lg font-extrabold text-cyan-300">
            Critical Alert
          </h1>

          <p className="mb-2 text-[10px] leading-tight text-gray-100">
            Check module connectivity for low-level protocol failure.
          </p>

          <button className="transform self-start rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-gray-900 shadow-xl transition duration-300 hover:scale-[1.02] hover:bg-amber-500 focus:ring-4 focus:ring-amber-300/50 focus:outline-none">
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
}
export default Body;
