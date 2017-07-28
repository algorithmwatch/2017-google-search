import storage from './utils/storage';
import ext from './utils/ext';
import { appConfig } from './appConfig';
import axios from 'axios';

const defaultConfig = {
  "endDate": "2017-10-01T00:00:00+02:00",
  "endText": "Datenspende – Bundestagswahl 2017: Danke für die Unterstützung. Der Zeitraum für das Sammeln der Daten ist abgelaufen. Bitte das Plugin/Add-on deaktivieren oder deinstallieren.",
  "introPage": "https://datenspende.algorithmwatch.org/intro.html",
  "keywords": [
    "Angela Merkel",
    "Martin Schulz",
    "Christian Lindner",
    "Katrin Göring-Eckardt",
    "Cem Özdemir",
    "Sahra Wagenknecht",
    "Dietmar Bartsch",
    "Alice Weidel",
    "Alexander Gauland",
    "CDU",
    "CSU",
    "SPD",
    "FDP",
    "Bündnis90/Die Grünen",
    "Die Linke",
    "AfD"
  ],
  "landingPage": "https://datenspende.algorithmwatch.org/",
  "refreshConfigInterval": 1440,
  "runInterval": 240,
  "selectors": {
    "news": {
      "item": ".PaqQNc",
      "loginStatus": ".gb_xf",
      "medium": ".IH8C7b",
      "published": ".oM4Eqe",
      "sourceUrl": ".nuEeue",
      "text": "",
      "title": ".k3Pzib .kWyHVd .nuEeue"
    },
    "search": {
      "item": ".g",
      "loginStatus": ".gb_8a",
      "sourceUrl": ".r a",
      "storyMedium": "._NRj cite",
      "storyPublished": "._NRj span",
      "storySourceUrl": "a",
      "storyTitle": "._IRj",
      "text": ".st",
      "title": ".r",
      "topStories": "._KBh"
    }
  },
  "startDate": "2017-07-05T00:00:00+02:00",
  "timeoutForRequests": 5
};

export function getConfig() {
  return new Promise((resolve, reject) => {
    // check useServerUrl in app-config.json, return default config if false
    if(!appConfig.useServerConfig) {
      return resolve(defaultConfig);
    }

    storage.get('config', function(result) {
      if (ext.runtime.lastError) {
        console.log('Runtime error.');
        return resolve(defaultConfig);
      }

      // check if config is valid
      if (result.config && !(Object.keys(result.config).length === 0 && result.config.constructor === Object)) {
        return resolve(result.config);
      } else {
        return resolve(updateConfig());
      }
    });
  });
}



export function updateConfig() {

  function makeReq() {
    return axios.get(appConfig.configUrl)
        .then(function(response) {
          //updating config in storage
          storage.set({'config': response.data}, function() {
            console.log('config saved');
          });

          return response.data;
        }).catch(function (error) {
          console.log(error);
        });
  }

 return makeReq().then(res => {
   // check useServerUrl in app-config.json, return default config if false
   if(!appConfig.useServerConfig) {
     return defaultConfig;
   }
    //return data from server if valid, otherwise return defaultConfig
    if (!res || (Object.keys(res).length === 0 && res.constructor === Object)) {
      return defaultConfig;
    } else {
      return res;
    }
  });
}
