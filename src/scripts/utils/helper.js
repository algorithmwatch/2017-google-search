import axios from 'axios';

import storage from './storage';
import ext from './ext';
import { appConfig } from '../appConfig';
import moment from 'moment';
import { getConfig } from '../config';

export function getCrawlerOption() {
  return new Promise((resolve, reject) => {
    storage.get('option', function(result) {
      if (ext.runtime.lastError) {
        console.log('Runtime error.');
        return resolve('auto');
      }

      const crawlerOption = result.option !== undefined ? result.option : 'auto';
      return resolve(crawlerOption);
    });
  });
}

export function setCrawlerOption(option) {
  storage.set({ option }, function() {
    console.log('option saved');
  });
}

export function getOverlaySetting() {
  return new Promise((resolve, reject) => {
    storage.get('overlayVisible', function(result) {
      if (ext.runtime.lastError) {
        console.log('Runtime error.');
        return resolve(true);
      }
      const overlayVisible = result.overlayVisible !== undefined ? result.overlayVisible : true;
      return resolve(overlayVisible);
    });
  });
}

export function setOverlaySetting(option) {
  storage.set({'overlayVisible': option}, () => {
    console.log('overlay Setting saved');
  });
}

export function getDate() {
  return new Promise((resolve, reject) => {
    storage.get('date', function(result) {
      if (ext.runtime.lastError) {
        console.log('Runtime error.');
        return resolve('later');
      }
      return resolve(result.date || 0);
    });
  });
}

export function getTimeStamp() {
  const unixDate = moment.utc().unix();

  return unixDate;
}


export function postToServer(err, res) {
  console.log('post to server', err, res);
  getConfig()
    .then(config => {
      axios.post(appConfig.resultUrl, res, {'timeout': config.timeoutForRequests * 1000 || 10000})
        .then(function (response) {
          console.log('posting result successful',  response);
        })
        .catch(function (error) {
          console.log('error with posting result', error);
        });
    })
    .catch(console.log('error while loading config'));


}
