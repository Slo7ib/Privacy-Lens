import RatingBox from "./app/components/RatingBox/RatingBox";

import Header from "./app/components/Header/Header";
import Cards from "./app/components/Cards/Cards";
import userTab from "./app/hooks/userTab";

const App = () => {
  const { scan, loading, hasScanned } = userTab();
  
  return (
    <main className="bg-linear-to-r from-[#030c5c] to-[#004e92]">
      <Header />
      <RatingBox scan={scan} loading={loading} />
      {hasScanned && (
        <div className="animate-[fadeIn_0.6s_ease-in]">
          <Cards />
        </div>
      )}
    </main>
  );
};

export default App;
