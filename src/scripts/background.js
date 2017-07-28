import ext from './utils/ext';
import storage from './utils/storage';
import axios from 'axios';

import Async from 'async';

import { crawlNews, newsPlayground } from './news/crawler';
import { crawlSearch, searchPlayground } from './search/crawler';
import Tasks from './tasks';

import { appConfig } from './appConfig';
import { getConfig, updateConfig } from './config';
import { getOverlaySetting, setOverlaySetting, setCrawlerOption, makeId } from './utils/helper';


Tasks.init();

ext.runtime.onInstalled.addListener(function(reasonInfo) {
  getConfig().then(config => {
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    const options = isFirefox ? { url: config.introPage } : {};
    ext.tabs.create({ url: config.introPage }, tab => {
      setTimeout(showOverlay, 2000);
    });
  });

  const id = makeId();

  if (reasonInfo.reason === 'install') {
    storage.set({'uniqueId': id}, () => {
      console.log('uniqueId set');
    });
  }
});

ext.runtime.onMessage.addListener(requestListener);

function requestListener(request, sender, sendResponse) {
  switch (request.action) {
    case 'test-crawl': handleCrawlRequest(); break;
    case 'handle-crawl': handleCrawlRequest(); break;
    case 'handle-search': searchPlayground(); break;
    case 'handle-news': newsPlayground(); break;
    case 'update-config': updateConfig(); break;
    case 'set-overlay-settings': setOverlaySetting(rexquest.visible); break;
    case 'run': handleRun(); break;
    case 'run-later': setCrawlerOption('later'); break;
  }
}

export function handleCrawlRequest() {
  // updating config in storage
  storage.set({'date': Date.now()}, () => {
    console.log('date saved');
  });

  storage.get('uniqueId', function(id){
    ext.windows.getCurrent(window => {
      ext.windows.create({
        width: 400,
        height: 400,
        top: window.height - 20
      }, newWindow => {
        newWindow.focused = false;
        getConfig().then((config) => {
          Async.series([crawlNews(config, newWindow.id, id.uniqueId), crawlSearch(config, newWindow.id, id.uniqueId)], onCrawlDone.bind({
            id: newWindow.id
          }));
        });
      });
    });
  });
}

function onCrawlDone(err, res) {
  console.log('============ DONE ============', err, res);
  ext.windows.remove(this.id);
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
