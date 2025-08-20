document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension');
  const textarea = document.getElementById('linkTemplates');
  const saveBtn = document.getElementById('saveLinks');

  chrome.storage.sync.get(['enabled', 'linkTemplates'], (result) => {
    toggle.checked = result.enabled ?? true;
    textarea.value = (result.linkTemplates || []).join('\n');
  });

  toggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });

  saveBtn.addEventListener('click', () => {
    const links = textarea.value.split('\n').map(line => line.trim()).filter(Boolean);
    chrome.storage.sync.set({ linkTemplates: links });
  });
});
