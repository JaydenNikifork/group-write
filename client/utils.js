function toWebsocketUrl(/** @type {string} */ url) {
  const cssStartIndex = url.indexOf('://');
  const newUrl = `ws${url.slice(cssStartIndex)}`;
  return newUrl;
}