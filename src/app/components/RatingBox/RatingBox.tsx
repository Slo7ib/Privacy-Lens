import { usePrivacyRating } from "../../hooks/usePrivacyRating";

interface RatingBoxProps {
  scan: () => Promise<void>;
  loading: boolean;
}

function RatingSkeleton() {
  return (
    <div className="card-container relative mx-auto flex h-[180px] w-full max-w-[280px] flex-row justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition duration-300">
      <div className="slash-panel flex w-2/5 shrink-0 flex-col items-center justify-center p-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-3 border-cyan-400/50 bg-white/20 shadow-inner backdrop-blur-sm">
          <div className="h-10 w-10 animate-pulse rounded bg-gray-700" />
        </div>
        <div className="mt-1 h-4 w-16 animate-pulse rounded bg-gray-700" />
      </div>

      <div className="content-panel flex w-3/5 flex-col justify-center p-3">
        <div className="mb-0.5 h-5 w-16 animate-pulse rounded bg-gray-700" />
        <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-700" />
        <div className="h-1/4 w-3/4 animate-pulse self-center rounded-md bg-gray-700" />
      </div>
    </div>
  );
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case "A":
      return "text-green-400";
    case "B":
      return "text-cyan-300";
    case "C":
      return "text-yellow-400";
    case "D":
      return "text-orange-400";
    case "F":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
}

function getStatusText(rating: string): string {
  switch (rating) {
    case "A":
      return "Excellent";
    case "B":
      return "Good";
    case "C":
      return "Moderate";
    case "D":
      return "Poor";
    case "F":
      return "Very Poor";
    default:
      return "Safe";
  }
}

export function RatingBox({ scan, loading: scanLoading }: RatingBoxProps) {
  const { rating } = usePrivacyRating();

  // Show skeleton only while actively scanning
  if (scanLoading) {
    return <RatingSkeleton />;
  }

  // Safety check - should never happen since rating is always calculated
  if (!rating) {
    return (
      <div className="card-container relative mx-auto flex h-[180px] w-full max-w-[280px] flex-row justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition duration-300">
        <div className="slash-panel flex w-2/5 shrink-0 flex-col items-center justify-center p-2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-3 border-cyan-400/50 bg-white/20 shadow-inner backdrop-blur-sm transition duration-500 hover:scale-110">
            <h1 className="text-4xl text-yellow-400">-</h1>
          </div>
          <p className="mt-1 text-center text-[15px] font-semibold tracking-widest text-gray-400 uppercase">
            RATING
          </p>
        </div>

        <div className="content-panel flex w-3/5 flex-col justify-center p-3">
          <h1 className="glow-text mb-0.5 text-lg font-extrabold text-cyan-300">
            Ready
          </h1>

          <p className="mb-2 text-[10px] leading-tight text-gray-100">
            Click scan to analyze privacy policy
          </p>

          <button
            onClick={scan}
            disabled={scanLoading}
            className="h-1/4 w-3/4 transform cursor-pointer self-center rounded-md bg-amber-400 px-3 py-1 text-center text-lg font-semibold text-gray-900 shadow-xl transition duration-300 hover:scale-[1.02] hover:bg-amber-500 focus:ring-4 focus:ring-amber-300/50 focus:outline-none"
          >
            Scan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-container relative mx-auto flex h-[180px] w-full max-w-[280px] flex-row justify-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition duration-300">
      <div className="slash-panel flex w-2/5 shrink-0 flex-col items-center justify-center p-2">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-3 border-cyan-400/50 bg-white/20 shadow-inner backdrop-blur-sm transition duration-500 hover:scale-110">
          <h1 className={`text-4xl ${getRatingColor(rating.rating)}`}>
            {rating.rating}
          </h1>
        </div>
        <p className="mt-1 text-center text-[15px] font-semibold tracking-widest text-gray-400 uppercase">
          RATING
        </p>
      </div>

      <div className="content-panel flex w-3/5 flex-col justify-center p-3">
        <h1 className={`glow-text mb-0.5 text-lg font-extrabold ${getRatingColor(rating.rating)}`}>
          {getStatusText(rating.rating)}
        </h1>

        <p className="mb-2 text-[10px] leading-tight text-gray-100">
          {rating.description}
        </p>

        <button
          onClick={scan}
          disabled={scanLoading}
          className="h-1/4 w-3/4 transform cursor-pointer self-center rounded-md bg-amber-400 px-3 py-1 text-center text-lg font-semibold text-gray-900 shadow-xl transition duration-300 hover:scale-[1.02] hover:bg-amber-500 focus:ring-4 focus:ring-amber-300/50 focus:outline-none"
        >
          Scan
        </button>
      </div>
    </div>
  );
}
