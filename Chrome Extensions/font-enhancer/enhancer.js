(async () => {
  const hostname = window.location.hostname;
  const data = await chrome.storage.sync.get([hostname]);
  const settings = data[hostname];

  const styleId = "global-font-enhancer";
  let style = document.getElementById(styleId);

  // Remove any previously injected styles if present
  if (style) {
    style.remove();
  }

  // If settings are disabled or missing, exit early (after cleanup)
  if (!settings || (!settings.boldEnabled && !settings.fontEnabled)) {
    return;
  }

  // Recreate style tag and inject new rules
  const { boldEnabled, fontEnabled, fontSize } = settings;
  const fontMultiplier = parseFloat(fontSize || 1.0);

  const rules = [];
  if (boldEnabled) rules.push("font-weight: bold !important");
  if (fontEnabled && fontMultiplier !== 1.0) {
    rules.push(`font-size: ${fontMultiplier}rem !important`);
    rules.push("line-height: 1.4 !important");
  }

  const css = rules.length
    ? `p, span, a, li, td, div, h1, h2, h3, h4, h5, h6, button, label, th, strong, em { ${rules.join("; ")}; }`
    : "";

  style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
})();