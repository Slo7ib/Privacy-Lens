import React from "react";
// The policy find is a function to search for the privacy ploicy and then send it to a background worker to do the heavy work.
import { policyFind } from "../utils/policyFinder";
interface ChangeBackgroundButtonProps {}
const ChangeBackgroundButton: React.FC = () => {
  // This function will find the current active tab, and do chrome.scripting on it, avoiding having to require too many unncessary permissons through Content Script
  const gettingTab = async () => {
    let queryOptions: chrome.tabs.QueryInfo = {
      active: true,
      lastFocusedWindow: true,
    };
    let [currentTab] = await chrome.tabs.query(queryOptions);

    if (currentTab?.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: currentTab.id },
          func: policyFind,
        })
        .then(() => {
          console.log("Script successfully executed");
        });
    } else {
      console.error("Script failed");
    }
    return currentTab;
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
