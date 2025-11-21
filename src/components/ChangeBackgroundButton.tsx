import React from "react";

interface ChangeBackgroundButtonProps {}
const ChangeBackgroundButton: React.FC = () => {
  // This function will find the current active tab, and do chrome.scripting on it, avoiding having to require too many unncessary permissons through Content Script
  const gettingTab = async () => {
    let queryOptions: chrome.tabs.QueryInfo = {
      active: true,
      lastFocusedWindow: true,
    };
    let [currentTab] = await chrome.tabs.query(queryOptions);
    const policyFind = () => {
      const keywords = ["privacy policy", "data policy", "privacy notice"];

      const selector = "a, button, [role='link]";

      const allPossibleLinks = document.querySelectorAll(selector);

      const foundPolicy = Array.from(document.querySelectorAll("a")).find((a) =>
        a.textContent?.toLowerCase().includes("privacy policy"),
      );

      let result = {
        found: false,
        url: "",
        text: "",
      };

      if (foundPolicy instanceof HTMLAnchorElement) {
        console.log("Found Policy Link successfully:", foundPolicy.href);
        result.found = true;
        result.url = foundPolicy.href;
        result.text = foundPolicy.textContent;
      } else {
        console.log("cant find");
      }
      return result;
    };

    if (currentTab?.id) {
      try {
        const injectionResults = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: policyFind,
        });
        const resultFromWebpage = injectionResults[0].result;

        chrome.runtime.sendMessage({
          type: "POLICY_RESULT",
          data: resultFromWebpage,
          tabId: currentTab.id,
        });
        console.log("Result sent to Service Worker:", resultFromWebpage);
      } catch (error) {
        console.error("Script execution failed:", error);
      }
    } else {
      console.error("Could not find current tab ID.");
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
