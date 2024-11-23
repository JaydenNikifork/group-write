function toWebsocketUrl(/** @type {string} */ url) {
  const cssStartIndex = url.indexOf('://');
  const newUrl = `ws${url.slice(cssStartIndex)}`;
  return newUrl;
}

function getCookies() {
  return document.cookie.split(';').reduce((cookies, cookie) => {
      const [key, value] = cookie.split('=').map(part => part.trim());
      cookies[key] = decodeURIComponent(value);
      return cookies;
  }, {});
}

function getSessionId() {
  return getCookies()['session_id'];
}