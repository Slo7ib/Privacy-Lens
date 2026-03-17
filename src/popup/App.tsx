import { RatingBox } from "@/popup/components/RatingBox/RatingBox";
import { Header } from "@/popup/components/Header/Header";
import { DataCollectionCards } from "@/popup/components/DataCollectionCards/DataCollectionCards";
import { usePrivacyScan } from "@/popup/hooks/usePrivacyScan";
import { useEffect } from "react";
import { LicenseManager } from "@/popup/services/LicenseManager";

const App = () => {
  const { scan, loading, hasScanned } = usePrivacyScan();

  useEffect(() => {
    // Check license status on popup open (implementation handles 7-day interval)
    LicenseManager.checkLicenseStatus();
  }, []);

  return (
    <main className="bg-linear-to-r from-[#030c5c] to-[#004e92]">
      <Header />
      <RatingBox scan={scan} loading={loading} hasScanned={hasScanned} />
      <p className="text-center text-xs text-red-400 px-4 mt-2">
        Disclaimer: The summary is generated automatically and may not be fully
        accurate. Always refer to the website’s original privacy policy for
        complete and up-to-date information.
      </p>
      {hasScanned && (
        <div className="animate-[fadeIn_0.6s_ease-in]">
          <DataCollectionCards />
        </div>
      )}
    </main>
  );
};

export default App;
