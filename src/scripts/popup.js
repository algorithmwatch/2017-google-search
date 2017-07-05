import ext from './utils/ext';
import { getOverlaySetting, setOverlaySetting } from './utils/helper';
import { getConfig } from './config';

const startButton = document.querySelector('#popup__test-btn');
const aboutButton = document.querySelector('#popup__about-btn');
const setOverlayCheckBox = document.querySelector('#popop__overlay--setting');

function init() {
  var logoNode = document.querySelector('.popup__logo');
  logoNode.src = chrome.runtime.getURL('icons/ds-icon-64.png');

  startButton.addEventListener('click', startCrawler('test-crawl'));

  aboutButton.addEventListener('click', () => {
    getConfig().then(config => {
      ext.tabs.create({ url: config.landingPage});
    });
  });

  getOverlaySetting().then(option => {
    setOverlayCheckBox.checked = option;
  })

  setOverlayCheckBox.addEventListener('click', function(e) {
    setOverlaySetting(this.checked);
  });

}

function startCrawler(action) {
  return () => {
    ext.runtime.sendMessage({ action });
  }
}

init();
