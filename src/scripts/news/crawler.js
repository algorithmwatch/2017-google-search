import ext from '../utils/ext';
import Async from 'async';

import { injectScript } from './injection.js';
import { getTimeStamp, postToServer } from '../utils/helper';

const URL_GOOGLE_NEWS = 'https://news.google.com/';
let tabId = false;
let config = null;
let loggedIn = null;

function handleNewsPage(keyword, callback) {
  removeTab();

  const selectors = this.config.selectors.news;
  const windowId = this.windowId;

  // add delay for executing google news crawling
  setTimeout(() => createTab({keyword, windowId, selectors}, callback), this.timeoutForRequests * 1000);
}

function createTab(options, callback) {
  ext.tabs.create({ url: getUrl(options.keyword), windowId: options.windowId }, tab => {
    tabId = tab.id;

    ext.tabs.executeScript(tabId, {
        code: '(' + injectScript + ')(' + JSON.stringify({ selectors: options.selectors }) + ');'
      }, results => {
        if (ext.runtime.lastError || results === undefined) {
          return callback(ext.runtime.lastError.message);
        }

        loggedIn = results ? results[0].loginStatus : null;
        callback(null, { keyword: options.keyword, results: results[0].data });
      }
    );

  });
}

function getUrl(keyword) {
  return `${URL_GOOGLE_NEWS}news/search/section/q/${keyword}`;
}

function removeTab() {
  if (tabId) {
    // check if there is still a tab with the current tabId in case the window or tab was closed
    ext.tabs.get(tabId, tab => {
      if (ext.runtime.lastError) {
        return console.log(ext.runtime.lastError.message);
      }
      ext.tabs.remove(tabId);
    })
  }
}

export function crawlNews(_config, _windowId, mode) {
  config = _config;

  return callback => {
    tabId = false;
    // use waterfall, pass tabId
    Async.mapSeries(config.keywords, handleNewsPage.bind({
      config: config,
      windowId: _windowId
    }), (err, result) => {
      if (err) console.log("error: ", err);

      const res = {
        type: 'news',
        pluginId: ext.runtime.id,
        loggedIn,
        createdAt: getTimeStamp(),
        lang: navigator ? navigator.language : '',
        result
      };

      // only send to server if not in test mode
      if(mode !== 'test') {
        setTimeout(() => {
          postToServer(err, res);
        }, (Math.floor(Math.random() * 60)) * 1000);
      }

      removeTab();

      callback(err, res);
    });
  }
}
