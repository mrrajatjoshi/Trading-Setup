
let lastHighlighted = null;
let linkIcon = null;

function getText(el) {
  return (el && typeof el.innerText === "string") ? el.innerText.trim() : "";
}

function removeLinkIcon() {
  if (linkIcon?.parentElement) {
    linkIcon.remove();
    linkIcon = null;
  }
  if (lastHighlighted) {
    lastHighlighted.style.outline = "";
    lastHighlighted = null;
  }
}

function createLinkIcon(el, text) {
  const rect = el.getBoundingClientRect();
  const iconSize = 18;

  linkIcon = document.createElement("img");
  linkIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAeUlEQVR4nO2UQQ6AIAwE0fj/L+NJDqTtdhvUGHeOdKSwNLYmhBB/Z0s4nfyO8vdC85XrsHm04Vxj/XJzy2H9gfU2Pah5LusPF83A7RyEm4l4BqbyqQSiefHqECuBa6Ns5FUf8sh/AJ0muhV6klQvNITeAVetCyHE+5zD3in9+n3jfwAAAABJRU5ErkJggg==";
  linkIcon.style.position = "absolute";
  linkIcon.style.top = `${rect.top + window.scrollY + 2}px`;
  linkIcon.style.left = `${rect.right + window.scrollX - iconSize - 2}px`;
  linkIcon.style.width = iconSize + "px";
  linkIcon.style.height = iconSize + "px";
  linkIcon.style.cursor = "pointer";
  linkIcon.style.zIndex = 999999;
  linkIcon.title = "Open links for " + text;
  linkIcon.style.backgroundColor = "white";
  linkIcon.style.borderRadius = "4px";
  linkIcon.style.boxShadow = "0 0 2px rgba(0,0,0,0.5)";

  linkIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    chrome.storage.sync.get(['linkTemplates'], (result) => {
      const templates = result.linkTemplates || [];
      const urls = templates.map(url => url.replace(/TICKERTEXT/g, text));
      chrome.runtime.sendMessage({ type: "OPEN_LINKS", links: urls, groupName: text });
    });
  });

  document.body.appendChild(linkIcon);
}

function handleMouseOver(event) {
  const el = event.target;
  const text = getText(el);

  if (text.length > 0 && text.length < 7 && el !== linkIcon && el !== lastHighlighted) {
    if (lastHighlighted) {
      lastHighlighted.style.outline = "";
    }
    if (linkIcon?.parentElement) {
      linkIcon.remove();
      linkIcon = null;
    }

    el.style.outline = "3px solid red";
    lastHighlighted = el;
    createLinkIcon(el, text);
  }
}

function handleMouseOut(event) {
  if (
    event.relatedTarget !== linkIcon &&
    lastHighlighted &&
    !lastHighlighted.contains(event.relatedTarget)
  ) {
    if (lastHighlighted) {
      lastHighlighted.style.outline = "";
    }
    if (linkIcon?.parentElement) {
      linkIcon.remove();
    }
    lastHighlighted = null;
    linkIcon = null;
  }
}

function handleClick(event) {
  const el = event.target;
  const text = getText(el);

  if (text.length > 0 && text.length < 7 && el !== linkIcon) {
    navigator.clipboard.writeText(text);
  }
}

chrome.storage.sync.get(['enabled'], (result) => {
  if (result.enabled ?? true) {
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick);
  }
});
