import ext from './utils/ext';
import storage from './utils/storage';
import axios from 'axios';

import Async from 'async';

import { crawlNews, newsPlayground } from './news/crawler';
import { crawlSearch, searchPlayground } from './search/crawler';
import Tasks from './tasks';

import { appConfig } from './appConfig';
import { getConfig, updateConfig } from './config';
import { getOverlaySetting, setOverlaySetting, setCrawlerOption } from './utils/helper';

let isCrawling = false;

Tasks.init();

ext.runtime.onInstalled.addListener(function(reason) {
  getConfig().then(config => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const options = isFirefox ? { url: config.introPage } : {};
    ext.tabs.create({ url: config.introPage }, tab => {
      setTimeout(showOverlay, 2000);
    });
  });
});

ext.runtime.onMessage.addListener(requestListener);

function requestListener(request, sender, sendResponse) {
  switch (request.action) {
    case 'test-crawl': handleCrawlRequest('test'); break;
    case 'handle-crawl': handleCrawlRequest(); break;
    case 'handle-search': searchPlayground(); break;
    case 'handle-news': newsPlayground(); break;
    case 'update-config': updateConfig(); break;
    case 'set-overlay-settings': setOverlaySetting(rexquest.visible); break;
    case 'run': handleRun(); break;
    case 'run-later': setCrawlerOption('later'); break;
  }
}

// set mode = 'test' for testing the crawling function, don't set mode for crawling and sending data to server
export function handleCrawlRequest(mode) {
  // updating config in storage
  storage.set({'date': Date.now()}, () => {
    console.log('date saved');
  });

  ext.windows.getCurrent(window => {
    ext.windows.create({
      width: 400,
      height: 400,
      top: window.height - 20
    }, newWindow => {
      newWindow.focused = false;
      updateCrawlingStatus();
      getConfig().then((config) => {
        Async.series([crawlNews(config, newWindow.id, mode), crawlSearch(config, newWindow.id, mode)], onCrawlDone.bind({
          id: newWindow.id,
          mode: mode
        }));
      });
    });
  });
}


function onCrawlDone(err, res) {
  updateCrawlingStatus();
  ext.windows.remove(this.id);
}

function updateCrawlingStatus() {
  isCrawling = !isCrawling;
}

export function showOverlay() {
  getOverlaySetting().then(visible => {
    if (visible == null || visible) {
      ext.tabs.query({active: true, currentWindow: true}, tabs => {
        ext.tabs.sendMessage(tabs[0].id, { action: 'show-overlay' });
      });
    }
  });
}

function handleRun() {
  setCrawlerOption('auto');
  handleCrawlRequest();
}
