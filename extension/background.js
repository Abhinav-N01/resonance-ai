const DISTRACTING_SITES = [
  "youtube.com",
  "reddit.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com"
];

// Keep track of tabs we've already nudged so we don't spam the user
const nudgedTabs = new Set();

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only inject when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const urlObj = new URL(tab.url);
      const isDistracting = DISTRACTING_SITES.some(site => urlObj.hostname.includes(site));

      if (isDistracting && !nudgedTabs.has(tabId)) {
        nudgedTabs.add(tabId);
        
        // Wait 2.5 seconds before nudging to let the user realize what they just opened
        setTimeout(async () => {
          try {
            const currentTab = await chrome.tabs.get(tabId);
            if (currentTab) {
              await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
              });
            }
          } catch (e) {
            // Tab was closed before the nudge could fire
          }
        }, 2500);
      }
    } catch (e) {
      // Invalid URL (like chrome://)
    }
  }
});

// Clean up memory
chrome.tabs.onRemoved.addListener((tabId) => {
  nudgedTabs.delete(tabId);
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "close_tab" && sender.tab) {
    chrome.tabs.remove(sender.tab.id);
  }
});
