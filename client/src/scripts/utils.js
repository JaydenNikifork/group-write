export function toWebsocketUrl(/** @type {string} */ url) {
  const cssStartIndex = url.indexOf('://');
  const protocol = url.startsWith('https') ? 'wss' : 'ws';
  const newUrl = protocol + url.slice(cssStartIndex);
  return newUrl;
}

export function getCookies() {
  return document.cookie.split(';').reduce((cookies, cookie) => {
      const [key, value] = cookie.split('=').map(part => part.trim());
      cookies[key] = decodeURIComponent(value);
      return cookies;
  }, {});
}

export function getSessionId() {
  return getCookies()['session_id'];
}