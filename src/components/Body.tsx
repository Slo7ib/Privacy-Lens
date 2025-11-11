import Cards from "./Cards";

function Body() {
  return (
    <div className="w-full max-w-lg p-8 text-center text-gray-100 sm:p-10">
      <div className="card-container relative mx-auto flex h-[180px] w-full max-w-[280px] flex-row justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition duration-300">
        <div className="slash-panel flex w-2/5 flex-shrink-0 flex-col items-center justify-center p-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-3 border-cyan-400/50 bg-white/20 shadow-inner backdrop-blur-sm transition duration-500 hover:scale-110">
            <h1 className="text-4xl text-yellow-400">A</h1>
          </div>
          <p className="mt-1 text-center text-[15px] font-semibold tracking-widest text-gray-400 uppercase">
            RATING
          </p>
        </div>

        <div className="content-panel flex w-3/5 flex-col justify-center p-3">
          <h1 className="glow-text mb-0.5 text-lg font-extrabold text-cyan-300">
            Safe
          </h1>

          <p className="mb-2 text-[10px] leading-tight text-gray-100">
            This website collects and cleans your info afterwards
          </p>

          <button className="h-1/4 w-3/4 transform cursor-pointer self-center rounded-md bg-amber-400 px-3 py-1 text-center text-lg font-semibold text-gray-900 shadow-xl transition duration-300 hover:scale-[1.02] hover:bg-amber-500 focus:ring-4 focus:ring-amber-300/50 focus:outline-none">
            Scan
          </button>
        </div>
      </div>
      <Cards />
    </div>
  );
}
export default Body;
