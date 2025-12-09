// app/components/ScannerButton/ScannerButton.tsx
import userTab from "../../hooks/userTab";

function ScannerButton() {
  const { scan, loading } = userTab();

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={scan}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-700"
      >
        {loading ? "Scanning..." : "Scan For the Privacy Policy"}
      </button>
    </div>
  );
}

export default ScannerButton;
