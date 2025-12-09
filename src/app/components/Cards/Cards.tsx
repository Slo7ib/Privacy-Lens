import { useState, useEffect } from "react";
import DataSharing from "../DataSharing/DataSharing";
import IconRender from "./IconRender";
import { sections, type SectionName } from "../../types/sections";
import SkeletonCard, { SkeletonLine } from "./SkeletonCard";
function Cards() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="mt-3.5 w-full max-w-lg p-0 px-8 text-center text-gray-100 sm:p-10">
      <div className="mt-2 flex flex-col space-y-2.5">
        <div className="rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <h3 className="glow-text flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
            🛡️ {sections[0]}
          </h3>
          <ul className="my-4 grid grid-cols-3 place-items-center justify-around gap-6">
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <IconRender section="Personal Identifiers" />
            )}
          </ul>

          {/* Online Activity section */}
          <div className="">
            <h3 className="glow-text my-5 mt-7 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
              🌐 {sections[1]}
            </h3>
            <ul className="my-4 grid grid-cols-3 place-items-center justify-center gap-6">
              {isLoading ? (
                <SkeletonCard />
              ) : (
                <IconRender section="Online Activity" />
              )}
            </ul>
          </div>

          {/* Device Data section */}
          <div className="">
            <h3 className="glow-text mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
              💻 {sections[2]}
            </h3>
            <ul className="my-4 grid grid-cols-3 place-items-center justify-center gap-6">
              {isLoading ? (
                <SkeletonCard />
              ) : (
                <IconRender section="Device Data" />
              )}
            </ul>
          </div>
        </div>
        {/* Sharing Info part */}
        <div className="mb-1.5 rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          {isLoading ? <SkeletonLine /> : <DataSharing />}
        </div>
      </div>
    </div>
  );
}

export default Cards;
