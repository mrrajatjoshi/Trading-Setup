document.addEventListener("DOMContentLoaded", async () => {
  const boldToggle = document.getElementById("enableBold");
  const fontToggle = document.getElementById("enableFontSize");
  const fontSizeInput = document.getElementById("fontSize");
  const domainList = document.getElementById("domainList");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const hostname = url.hostname;

  function renderDomainList() {
    chrome.storage.sync.get(null, (allData) => {
      domainList.innerHTML = "";
      Object.entries(allData).forEach(([domain, settings]) => {
        if (settings && (settings.boldEnabled || settings.fontEnabled)) {
          const li = document.createElement("li");
          li.textContent = domain;
          const btn = document.createElement("button");
          btn.textContent = "Remove";
          btn.onclick = () => {
            chrome.storage.sync.remove(domain, () => {
              if (domain === hostname) {
                chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: () => {
                    const style = document.getElementById("global-font-enhancer");
                    if (style) style.remove();
                  }
                });
              }
              renderDomainList();
            });
          };
          li.appendChild(btn);
          domainList.appendChild(li);
        }
      });
    });
  }

  chrome.storage.sync.get([hostname], (data) => {
    const siteSettings = data[hostname] || {};
    boldToggle.checked = siteSettings.boldEnabled ?? false;
    fontToggle.checked = siteSettings.fontEnabled ?? false;
    fontSizeInput.value = siteSettings.fontSize ?? 1.0;
  });

  function updateAndInject() {
    const settings = {
      boldEnabled: boldToggle.checked,
      fontEnabled: fontToggle.checked,
      fontSize: fontSizeInput.value
    };
    chrome.storage.sync.set({ [hostname]: settings }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["enhancer.js"]
      });
      renderDomainList();
    });
  }

  boldToggle.addEventListener("change", updateAndInject);
  fontToggle.addEventListener("change", updateAndInject);
  fontSizeInput.addEventListener("change", updateAndInject);

  renderDomainList();
});
