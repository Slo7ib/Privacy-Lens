import React from "react";
interface ChangeBackgroundButtonProps {}
const ChangeBackgroundButton: React.FC = () => {
  const gettingTab = async () => {
    let queryOptions: chrome.tabs.QueryInfo = {
      active: true,
      lastFocusedWindow: true,
    };
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log(tab);
    return tab;
  };

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={gettingTab}
        className="rounded-xl bg-blue-600 px-4 py-2 text-white shadow-lg transition hover:bg-blue-700"
      >
        Change Page Background
      </button>
    </div>
  );
};

export default ChangeBackgroundButton;
