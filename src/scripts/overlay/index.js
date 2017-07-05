import ext from '../utils/ext';
import { initOverlay, showOverlay } from './injection';

ext.runtime.onMessage.addListener(requestListener);

// load selected config
initOverlay();

function requestListener(request, sender, sendResponse) {
  switch (request.action) {
    case 'show-overlay': showOverlay(); break;
  }
}

export function handleRun() {
  ext.runtime.sendMessage({
    action: 'run'
  });
};

export function handleLater() {
  ext.runtime.sendMessage({
    action: 'run-later'
  });
};

export function handleOverlaySetting(visible) {
  // if user sets dont show overlay we automaticly set crawling to auto
  ext.runtime.sendMessage({
    action: 'set-overlay-settings',
    visible: visible
  });
  handleRun();
};
