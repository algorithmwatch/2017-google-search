import { handleLater, handleRun, handleOverlaySetting } from './index';

// for crawler countdown
var countDownIntervalTime = 10;
var countDownInterval = null;

export function initOverlay() {
  createOverlay();
  addCloseListener();
  addRunButtonListener();
  addLaterButtonListener();
  addOverlaySettingListener();
}

export function showOverlay() {
  var overlayNode = document.querySelector('#crawler__overlay');
  overlayNode.style.display = 'block';
  // start coutdown for run crawler
  startCountDown();
}

export function hideOverlay() {
  var overlayNode = document.querySelector('#crawler__overlay');
  overlayNode.style.display = 'none';
}

function createOverlay() {
  var overlayNode = document.createElement('div');
  overlayNode.id = 'crawler__overlay';
  overlayNode.style.display = 'none';

  var overlayContent = `
    <div class='overlay__wrapper'>
      <div class='overlay__header'>
        <a class='overlay__logo-wrapper' href='//algorithmwatch.org/de/datenspende/' target='_blank'>
          <img class='overlay__logo' src=${chrome.runtime.getURL('icons/ds-icon-64.png')} alt='Datenspende Logo'>
          <div class='logo__claim'>Datenspende</div>
        </a>
        <div class='overlay__close-button'>x</div>
      </div>

      <div class='overlay__content'>
        <div class='overlay__countdown'>Die nächste Suchanfrage startet in ${countDownIntervalTime} Sekunden.</div>
        <div class='input__wrapper'>
          <button id='overlay__run-btn' class='overlay__button'>Sofort starten</button>
          <button id='overlay__later-btn' class='overlay__button'>Jetzt nicht</button>
        <div></div>
        </div>
        <div class='input__wrapper'>
          <label class="overlay__setting" for='overlay__setting'><input type='checkbox' name='overlay__setting' id='overlay__setting'>Nicht wieder anzeigen.</label>
        </div>
      </div>
    </div>
  `

  overlayNode.insertAdjacentHTML( 'beforeend', overlayContent );

  document.body.appendChild(overlayNode);
}

function addCloseListener() {
  var closeBtnEl = document.querySelector('.overlay__close-button');
  closeBtnEl.onclick = () => {
    handleRun();
    setTimeout(closeOverlay, 200);
  }
}

function addRunButtonListener() {
  var runButton = document.querySelector('#overlay__run-btn');
  runButton.onclick = (e) => {
    handleRun();
    setTimeout(closeOverlay, 200);
  }
}

function addLaterButtonListener() {
  var laterButton = document.querySelector('#overlay__later-btn');
  laterButton.onclick = (e) => {
    handleLater();
    setTimeout(closeOverlay, 200);
  }
}

function addOverlaySettingListener(){
  var overlaySetting = document.querySelector('#overlay__setting');

  overlaySetting.onclick = (e) => {
    handleOverlaySetting(!overlaySetting.checked);
    setTimeout(closeOverlay, 200);
    overlaySetting.checked = false;
  }
}

function closeOverlay() {
  var overlayNode = document.querySelector('#crawler__overlay');
  hideOverlay();
  clearTimer();
}

function startCountDown() {
  var countDownNode = document.querySelector('.overlay__countdown');

  startTimer(countDownIntervalTime, countDownNode);
}

function startTimer(duration, display) {
    var timer = duration;
    var seconds = null;
    countDownInterval = setInterval(() => {
        seconds = timer;

        display.textContent = `Die nächste Suchanfrage startet in ${seconds} Sekunden.`;

        if (--timer < 0) {
          clearTimer();
          closeOverlay();
          return handleRun();
        }
    }, 1000);
}

function clearTimer() {
  // set to initial value
  var countDownNode = document.querySelector('.overlay__countdown');
  countDownNode.textContent = `Die nächste Suchanfrage startet in ${countDownIntervalTime} Sekunden.`;

  clearInterval(countDownInterval);
}
