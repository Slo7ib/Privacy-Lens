import { DataSharing } from "../DataSharing/DataSharing";
import { DataCollectionIcons } from "../DataCollectionIcons/DataCollectionIcons";
import { sections } from "../../types/sections";

export function DataCollectionCards() {
  return (
    <div className="mt-3.5 w-full max-w-lg p-0 px-8 text-center text-gray-100 sm:p-10">
      <div className="mt-2 flex flex-col space-y-2.5">
        <div className="rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <h3 className="glow-text flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
            🛡️ {sections[0]}
          </h3>
          <ul className="my-4 grid grid-cols-3 place-items-center justify-around gap-6">
            <DataCollectionIcons section="Personal Identifiers" />
          </ul>

          <div className="">
            <h3 className="glow-text my-5 mt-7 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
              🌐 {sections[1]}
            </h3>
            <ul className="my-4 grid grid-cols-3 place-items-center justify-center gap-6">
              <DataCollectionIcons section="Online Activity" />
            </ul>
          </div>

          <div className="">
            <h3 className="glow-text mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
              💻 {sections[2]}
            </h3>
            <ul className="my-4 grid grid-cols-3 place-items-center justify-center gap-6">
              <DataCollectionIcons section="Device Data" />
            </ul>
          </div>
        </div>
        <div className="mb-1.5 rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <DataSharing />
        </div>
      </div>
    </div>
  );
}

