function Cards() {
  return (
    <div>
      <div className="rounded-2xl p-4 shadow">
        <h3 className="flex items-center gap-2 font-medium">
          🛡️ Personal Identifiers
        </h3>
        <ul className="ml-6 list-disc text-sm text-gray-700">
          <li>Email, Name, Phone Number</li>
          <li>Account Credentials</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 font-medium">
          🌐 Online Activity
        </h3>
        <ul className="ml-6 list-disc text-sm text-gray-700">
          <li>Pages viewed, links clicked</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="flex items-center gap-2 font-medium">💻 Device Data</h3>
        <ul className="ml-6 list-disc text-sm text-gray-700">
          <li>IP Address, Device Type</li>
          <li>Cookie usage</li>
        </ul>
      </div>

      <div className="rounded-2xl p-4 shadow">
        <h2 className="text-lg font-semibold">How They Use & Share Data</h2>

        <div>
          <h3 className="mb-1 font-medium">Usage</h3>
          <ul className="ml-6 list-disc text-sm text-gray-700">
            <li>Improving service and analytics</li>
            <li>Marketing and personalization</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-1 font-medium">Sharing</h3>
          <ul className="ml-6 list-disc text-sm text-gray-700">
            <li>Email + Device ID → Advertising Partners</li>
            <li>Payment Info → Payment Processors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
