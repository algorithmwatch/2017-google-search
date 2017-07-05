export function injectScript(params, selectors) {
  let done = false;
  const selector = selectors.selectors;

  function checkLoginStatus() {
    // check for login Button
    console.log(selectors);
    const loginButtonVisible = window.document.querySelector(selector.loginStatus) !== null;

    return loginButtonVisible;
  }

  function onDOMChange() {
    const items = document.querySelectorAll(selector.item);
    const storyItems = document.querySelectorAll(selector.topStories);

    // when there are some articles in the dom, we send the result
    if (items.length && !done) {
      done = true;

      const loginStatus = checkLoginStatus();

      const data = []
        // we don't want do submit items that are injected by a plugin for example
        .filter.call(items, itemNode => itemNode.classList.length === 1)
        .map(itemNode => {
          const titleNode = itemNode.querySelector(selector.title);
          const textNode = itemNode.querySelector(selector.text);
          const sourceUrlNode = itemNode.querySelector(selector.sourceUrl);
          const title = titleNode ? titleNode.textContent : 'no title';
          const text = textNode ? textNode.textContent : 'no text';
          const sourceUrl = sourceUrlNode ? sourceUrlNode.href : 'no source';

          return { title, text, sourceUrl };
        });

      const topStories = []
        .filter.call(storyItems, itemNode => itemNode.classList.length === 1)
        .map(itemNode => {
          const titleNode = itemNode.querySelector(selector.storyTitle);
          const mediumNode = itemNode.querySelector(selector.storyMedium);
          const publishedNode = itemNode.querySelector(selector.storyPublished);
          const sourceUrlNode = itemNode.querySelector(selector.storySourceUrl);

          const title = titleNode ? titleNode.textContent : 'no title';
          const medium = mediumNode ? mediumNode.textContent : 'no medium';
          const published =publishedNode ? publishedNode.textContent : 'no publishing info';
          const sourceUrl = sourceUrlNode ? sourceUrlNode.href : 'no source';

          return { title, medium, published, sourceUrl };
        });

      chrome.runtime.sendMessage({
        action: 'search-data',
        data: data,
        topStories: topStories,
        html: document.body.innerHTML,
        params: params,
        loginStatus: loginStatus
      });
    }
  }

  // listen to dom modifications
  document.body.addEventListener('DOMSubtreeModified', onDOMChange, false);

  return params;
}
