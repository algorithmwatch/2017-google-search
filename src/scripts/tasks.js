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

  if (state === 'active' &&  previousState === 'locked') {
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
  startDate = _config.startDate;
  endDate = _config.endDate;
  // alarm for running crawl. should be done every 4 hours
  // if auto is set as option: runCrawl
  // else: display overlay

  ext.alarms.create('runcrawl', {
    when: getNextTime(_config.runInterval),
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
{params} interval in minutes(i.e 240)
{returns} timestamp in ms
 */
function getNextTime(interval) {
  //USE THIS FOR FINAL VERSION: INTERVAL >= 60
  const currentTime = moment();

  // example: time now 10:50 
  // hoursOffset = 240 / 60 = 4
  // currentHours = 10 + 1 = 11
  // timeWithOffset = 
  //  moment.hours(Math.ceil(11 / 4) * 4) = 12
  //   .minutes(0)
  //   .seconds(0)
  // so next startingpoint will be at 12:00:00 (hh/mm/ss)


  // get hours between alarms
  const hoursOffset = interval / 60;
  // round to next full hour
  const currentHours = currentTime.hours() + 1;
  // round to next full interval
  // Round(11 / 4) = ~3
  // 3 * 4 = 12
  const timeWithOffset = moment().hours(Math.ceil(currentHours / hoursOffset) * hoursOffset);
  timeWithOffset.minutes(0);
  timeWithOffset.seconds(0);

  console.log("timeWithOffset", timeWithOffset, timeWithOffset.valueOf());

  return timeWithOffset.valueOf();
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
        // check if it´s an past alarm, difference shouldn´t be more than a half a minute
        // then ignore old alarm
        if ((Math.abs(moment().valueOf() - alarms.scheduledTime)) < 30000) {
          console.log('crawling at scheduled:', alarms.scheduledTime);

          handleCrawlingAlarm();
        } else {
          ext.alarms.getAll((alarms) => { console.log(alarms); });
        }
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
