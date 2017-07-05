import storage from './utils/storage';
import ext from './utils/ext';
import { appConfig } from './appConfig';
import axios from 'axios';

const defaultConfig = {
  "startDate": "2017-07-05T00:00:00+02:00",
  "runInterval": 120,
  "endDate": "2017-10-01T00:00:00+02:00",
  "refreshConfigInterval": 1440,
  "introPage": "https://datenspende.algorithmwatch.org/intro.html/",
  "endText": "Datenspende – Bundestagswahl 2017: Danke für die Unterstützung. Der Zeitraum für das Sammeln der Daten ist abgelaufen. Bitte das Plugin/Add-on deaktivieren oder deinstallieren.",
  "selectors": {
    "news": {
      "medium": ".IH8C7b",
      "title": ".k3Pzib .kWyHVd .nuEeue",
      "text": "",
      "item": ".PaqQNc",
      "sourceUrl": ".k3Pzib .kWyHVd .nuEeue",
      "loginStatus": ".gb_xf",
      "published": ".oM4Eqe"
    },
    "search": {
      "sourceUrl": ".r a",
      "topStories": "._KBh",
      "title": ".r",
      "text": ".st",
      "storySourceUrl": "a",
      "item": ".g",
      "loginStatus": ".gb_8a",
      "storyMedium": "._NRj cite",
      "storyTitle": "._IRj",
      "storyPublished": "._NRj span"
    }
  },
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
  "landingPage": "https://datenspende.algorithmwatch.org",
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
