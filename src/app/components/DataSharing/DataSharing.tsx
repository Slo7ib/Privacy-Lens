const DataSharing = () => {
  return (
    <>
      <h2 className="glow-text mb-5 flex items-center justify-center gap-2 text-xl font-medium text-cyan-300">
        🔁 Usage & Sharing
      </h2>
      <div className="flex flex-col">
        <h3 className="mb-0 text-left text-xl font-medium">Usage</h3>
        <ul className="my-3 ml-6 flex list-disc flex-col items-start space-y-2 pl-4 text-sm">
          <li>Improving service and analytics</li>
          <li>Marketing and personalization</li>
        </ul>
      </div>

      <div className="flex flex-col">
        <h3 className="mb-0 text-left text-xl font-medium">Sharing</h3>
        <ul className="my-3 ml-6 flex list-disc flex-col items-start space-y-2 pl-4 text-sm">
          <li>Email + Device ID → Advertising Partners</li>
          <li>Payment Info → Payment Processors</li>
        </ul>
      </div>
    </>
  );
};

export default DataSharing;
