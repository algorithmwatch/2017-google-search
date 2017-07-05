import ext from './utils/ext';
import storage from './utils/storage';
import moment from 'moment-timezone';

import { getCrawlerOption, setCrawlerOption, getOverlaySetting, getDate } from './utils/helper';
import { showOverlay, handleCrawlRequest } from './background';

import { updateConfig, getConfig } from './config';

// crawl in this timeframe
// init with defaults, get from config
let startDate = "2017-06-26T00:00:00+02:00";
let endDate = "2017-06-26T10:49:00+02:00";
let localConfig = {};
let previousState = '';

ext.idle.onStateChanged.addListener((state) => {
  if (state === 'locked') {
    // clear alarm
    cancelAlarm('runcrawl');
  }

  if (state === 'active' && previousState === 'locked') {
    // start again
    createCrawlerAlarm(localConfig);
  }

  previousState = state;
})

function init() {
  getConfig()
    .then(config => {
      localConfig = config;
      createAlarms(config);
    })
    .catch((err) => {
      console.log('error while loading config', err);
      createAlarms(localConfig);
    });
}

function createCrawlerAlarm(_config) {
  // date now
  const currentTime = moment();
  startDate = _config.startDate;
  endDate = _config.endDate;
  // alarm for running crawl. should be done every 4 hours
  // if auto is set as option: runCrawl
  // else: display overlay

  ext.alarms.create('runcrawl', {
    when: getNextTime(currentTime, _config.runInterval),
    periodInMinutes: _config.runInterval
  });
}

function createConfigAlarm(_config) {
  ext.alarms.create('config', {
    delayInMinutes: 0.1,
    periodInMinutes: _config.refreshConfigInterval
  });
}

function createAlarms(_config) {
  ext.alarms.clearAll(() => { console.log('alarms cleared'); });

  createCrawlerAlarm(_config);
  createConfigAlarm(_config);

  registerAlarmsListener(_config);
}

/*
{params} current Time Obj (Moment js),
         interval in minutes
{returns} time in ms(current Timezone)
 */
function getNextTime(currentTime, interval) {
  //USE THIS FOR FINAL VERSION: INTERVAL >= 60
  const hoursOffset = interval / 60;
  const currentHours = currentTime.hours() + 1;
  const timeWithOffset = moment().hours(Math.ceil(currentHours / hoursOffset) * hoursOffset).minutes(0);
  timeWithOffset.seconds(0);

  const currentTimeZone = moment.tz.guess();
  return timeWithOffset.tz(currentTimeZone).valueOf();
}

function cancelAlarm(alarmName) {
   ext.alarms.clear(alarmName, (alarm) => { console.log('alarm cleared', alarm); });
}

function registerAlarmsListener(_config) {
  ext.alarms.onAlarm.addListener(alarms => handleAlarms(alarms, _config));
}

function handleAlarms(alarms, _config) {
  switch (alarms.name) {
    case 'config': updateConfig(); break;
    case 'runcrawl':
      if (inTimeFrame()) {
        handleCrawlingAlarm();
      } else {
        alert(_config.endText);
      }
      break;
  }
}

function handleCrawlingAlarm() {
  getOverlaySetting()
    .then(overlayVisible => {
      if (overlayVisible) {
        showOverlay();
      } else {
        handleCrawlRequest();
      }
    });
}

// check if current time is between defined start- and endDate
function inTimeFrame() {
  const currentTime = moment().tz(moment.tz.guess());

  return moment(startDate).isBefore(currentTime) && moment(endDate).isAfter(currentTime);
}

export default {
  init
}
