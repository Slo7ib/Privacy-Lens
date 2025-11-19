import React from "react";
interface ChangeBackgroundButtonProps {}
const ChangeBackgroundButton: React.FC = () => {
  const policyFind = () => {
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
        .then((policy) => {
          console.log("success");
        });
    } else {
      console.error("failing");
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
