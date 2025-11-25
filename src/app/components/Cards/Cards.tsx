import { IconCircle } from "./IconCircle";
import { Phone, KeyRound, UserRound, Mail, History, Link } from "lucide-react";

function Cards() {
  return (
    <div className="w-full max-w-lg p-8 text-center text-gray-100 sm:p-10">
      <div className="mt-2 flex flex-col space-y-2.5">
        <div className="rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <h3 className="glow-text flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
            🛡️ Personal Identifiers
          </h3>
          <ul className="my-4 flex flex-row justify-center space-x-6">
            <IconCircle
              label="Collects Email"
              icon={<Mail size={24} color="#ffdd00" />}
            />
            <IconCircle
              label="Collects Personal Information"
              icon={<UserRound size={24} color="#ffdd00" />}
            />
            <IconCircle
              label="Collects Phone number"
              icon={<Phone size={24} color="#ffdd00" />}
            />
            <IconCircle
              label="Collects Account Credentials"
              icon={<KeyRound size={24} color="#ffdd00" />}
            />
          </ul>

          {/* Online Activity section */}
          <div className="">
            <h3 className="glow-text my-5 mt-7 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
              🌐 Online Activity
            </h3>
            <ul className="my-4 flex flex-row justify-center space-x-6">
              <IconCircle
                label="Collects pages viewed"
                icon={<History size={24} color="#ffdd00" />}
              />
              <IconCircle
                label="Collects links clicked"
                icon={<Link size={24} color="#ffdd00" />}
              />
            </ul>
          </div>

          {/* Device Data section */}
        </div>

        <div className="space-y-2 rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <h3 className="flex items-center gap-2 font-medium">
            💻 Device Data
          </h3>
          <ul className="ml-6 list-disc text-sm">
            <li>IP Address, Device Type</li>
            <li>Cookie usage</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/0 p-4 text-gray-100 shadow-xl backdrop-blur-md backdrop-brightness-50 backdrop-contrast-100">
          <h2 className="text-lg font-semibold">How They Use & Share Data</h2>

          <div>
            <h3 className="mb-1 font-medium">Usage</h3>
            <ul className="ml-6 list-disc text-sm">
              <li>Improving service and analytics</li>
              <li>Marketing and personalization</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-1 font-medium">Sharing</h3>
            <ul className="ml-6 list-disc text-sm">
              <li>Email + Device ID → Advertising Partners</li>
              <li>Payment Info → Payment Processors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cards;

