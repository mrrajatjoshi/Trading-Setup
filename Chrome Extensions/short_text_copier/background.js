
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_LINKS") {
    const links = message.links || [];

    const createdTabs = [];

    function createTabsSequentially(index) {
      if (index >= links.length) {
        const tabIds = createdTabs.map(tab => tab.id);
        if (tabIds.length === 0) {
          console.warn("No tabs created, skipping tab grouping.");
          return;
        }

        chrome.tabs.group({ tabIds }, (groupId) => {
          if (!groupId || typeof groupId !== "number") {
            console.warn("Tab grouping failed or not supported.");
            return;
          }
          // No group update here — silently grouped without naming
        });

        return;
      }

      chrome.tabs.create({ url: links[index], active: false }, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          console.error("Failed to create tab:", chrome.runtime.lastError?.message);
        } else {
          createdTabs.push(tab);
        }
        createTabsSequentially(index + 1);
      });
    }

    createTabsSequentially(0);
  }
});
