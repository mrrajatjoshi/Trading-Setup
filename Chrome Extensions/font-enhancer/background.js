chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const hostname = new URL(tab.url).hostname;

    chrome.storage.sync.get([hostname], (data) => {
      const settings = data[hostname];
      if (settings && (settings.boldEnabled || settings.fontEnabled)) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["enhancer.js"]
        });
      }
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url) {
        const hostname = new URL(tab.url).hostname;
        chrome.storage.sync.get([hostname], (data) => {
          const settings = data[hostname];
          if (settings && (settings.boldEnabled || settings.fontEnabled)) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["enhancer.js"]
            });
          }
        });
      }
    });
  });
});
