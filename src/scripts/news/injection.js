export function injectScript(selectors) {
  const selector = selectors.selectors;

  function checkLoginStatus() {
    // check for login Button
    const loginButtonVisible = window.document.querySelector(selector.loginStatus) !== null;

    return loginButtonVisible;
  }

  const items = document.querySelectorAll(selector.item);
  const loginStatus = checkLoginStatus();

  const data = [].map.call(items, itemNode => {
    const title = itemNode.querySelector(selector.title).textContent;
    const sourceUrl = itemNode.querySelector(selector.sourceUrl).href;
    const medium = itemNode.querySelector(selector.medium).textContent;
    const published = itemNode.querySelector(selector.published).textContent;

    return {
      title,
      sourceUrl,
      medium,
      published
    };
  });
  return { data, loginStatus };
}
