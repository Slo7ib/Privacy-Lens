import React from "react";

const ScannerButton: React.FC = () => {
  // This function will find the current active tab, and do chrome.scripting on it, avoiding having to require too many unncessary permissons through Content Script
  const gettingTab = async () => {
    let queryOptions: chrome.tabs.QueryInfo = {
      active: true,
      lastFocusedWindow: true,
    };
    let [currentTab] = await chrome.tabs.query(queryOptions);
    const policyFind = () => {
      // 1. Define a list of common, relevant keywords
      const KEYWORDS = [
        "privacy policy",
        "terms of service",
        "terms and conditions",
        "terms of use",
        "legal notice",
        "data policy",
        "imprint",
        "privacy",
      ];

      // 2. Broaden the selector to include common interactive elements
      // We include <a>, <button>, and any element with a specific role like 'link'
      const SELECTOR = "a, button, [role='link']";

      // Also query divs and spans that are often used for footers, but be careful of performance.
      // We'll stick to a more precise selector for better performance first.
      const allPossibleLinks = document.querySelectorAll(SELECTOR);

      // 3. Find the first element whose text content contains any of the keywords
      const foundElement = Array.from(allPossibleLinks).find((el) => {
        // Get the element's text content, convert to lowercase, and check if it's truthy
        const text = el.textContent?.toLowerCase();

        // Check if the element's text includes ANY of the keywords
        return text && KEYWORDS.some((keyword) => text.includes(keyword));
      });

      let result = {
        found: false,
        url: "",
        text: "",
      };

      if (foundElement) {
        // If it's an anchor element, get the href directly
        if (
          foundElement.tagName === "A" &&
          foundElement instanceof HTMLAnchorElement
        ) {
          result.url = foundElement.href;
        } else {
          // If it's a button or other non-anchor element, the URL may not be available.
          // You could check for data-attributes or parent anchors here if needed.
          result.url = "N/A (Not an <a> tag)";
        }

        result.found = true;
        result.text = foundElement.textContent.trim();
      } else {
        // console.log("Can't find policy/terms link using broad search.");
      }

      return result;
    };

    if (currentTab?.id) {
      try {
        const injectionResults = await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          func: policyFind,
        });
        const privacyPageData = injectionResults[0].result;

        chrome.runtime.sendMessage({
          type: "POLICY_RESULT",
          data: privacyPageData,
          tabId: currentTab.id,
        });
        console.log("Result sent to Service Worker:", privacyPageData);
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

export default ScannerButton;

