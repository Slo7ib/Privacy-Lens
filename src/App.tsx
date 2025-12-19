import { RatingBox } from "./app/components/RatingBox/RatingBox";
import { Header } from "./app/components/Header/Header";
import { DataCollectionCards } from "./app/components/DataCollectionCards/DataCollectionCards";
import { usePrivacyScan } from "./app/hooks/usePrivacyScan";

const App = () => {
  const { scan, loading, hasScanned } = usePrivacyScan();

  return (
    <main className="bg-linear-to-r from-[#030c5c] to-[#004e92]">
      <Header />
      <RatingBox scan={scan} loading={loading} />
      {hasScanned && (
        <div className="animate-[fadeIn_0.6s_ease-in]">
          <DataCollectionCards />
        </div>
      )}
    </main>
  );
};

export default App;
