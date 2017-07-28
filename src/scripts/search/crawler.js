import ext from '../utils/ext';
import Async from 'async';

import { injectScript } from './injection.js';
import { getTimeStamp, postToServer } from '../utils/helper';


const URL_GOOGLE_SEARCH = 'https://google.de/';
let onDoneCallback;
let result = [];
let config;
let windowId = null;
let id = null;

// listen to event that gets fired by injected script (sends scraped data)
ext.runtime.onMessage.addListener(requestListener);

function requestListener(request, sender, sendResponse) {
  switch (request.action) {
    case 'search-data': onDataUpdate(request, sender, sendResponse); break;
  }
}

function onDataUpdate(request, sender, sendResponse) {
  const keyword = request.params.keyword;
  const keywordIndex = config.keywords.indexOf(keyword);

  result.push({ keyword, results: request.data, topStories: request.topStories });

  if (keywordIndex === config.keywords.length - 1) {
    ext.tabs.remove(sender.tab.id);
    // ext.runtime.id The ID of the extension/app.

    const useragent = ext.runtime.getManifest().version_name || '';

    const res = {
      version: chrome.runtime.getManifest().version,
      userAgent: useragent,
      type: 'search',
      pluginId: id,
      loggedIn: request.loginStatus,
      createdAt: getTimeStamp(),
      lang: navigator ? navigator.language : '',
      result
    };

    setTimeout(() => {
      postToServer(null, res);
    }, (Math.floor(Math.random() * 60)) * 1000);

    return onDoneCallback(null, res);
  }

  setTimeout(() => handlePage(keywordIndex + 1, sender.tab.id), config.timeoutForRequests * 1000);
}


export function crawlSearch(_config, wId, _id) {
  config = _config;

  windowId = wId;
  id = _id;
  return callback => {
    onDoneCallback = callback;
    result = [];
    handlePage(0, false);
  }
}

function handlePage(keywordIndex, tabId = false, callback) {
  const keyword = config.keywords[keywordIndex];
  const selectors = config.selectors.search;
  const url = getUrl(keyword);

  if (tabId) {
    ext.tabs.remove(tabId);
  }

  ext.tabs.create({ url, windowId }, tab => {
    ext.tabs.executeScript({
      code: '(' + injectScript + ')(' + JSON.stringify({ keyword }) + ',' + JSON.stringify({ selectors }) + ');',
      runAt: 'document_end'
    }, results => {
      if (ext.runtime.lastError) {
        return onDoneCallback(ext.runtime.lastError.message);
      }
    });
  });
}

function getUrl(keyword) {
  return `${URL_GOOGLE_SEARCH}search?q=${keyword}`;
}
