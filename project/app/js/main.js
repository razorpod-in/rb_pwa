/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
console.log("main file ");
// TODO - register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log(`Service Worker registered! Scope: ${registration.scope}`);
      })
      .catch(err => {
        console.log(`Service Worker registration failed: ${err}`);
      });
  });
}

const container = document.getElementById('module-card-container');

Notification.requestPermission();

// TODO - create indexedDB database
const dbPromise = createIndexedDB();

loadContentNetworkFirst();

function saveEventDataLocally(modules) {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('modules', 'readwrite');
    const store = tx.objectStore('modules');
    return Promise.all(modules.map(module => store.put(module)))
    .catch(() => {
      tx.abort();
      throw Error('Modules were not added to the store');
    });
  });
}
function getLocalEventData() {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('modules', 'readonly');
    const store = tx.objectStore('modules');
    return store.getAll();
  });
}
// function loadContentNetworkFirst() {
//   getServerData()
//   .then(dataFromNetwork => {
//     saveEventDataLocally(dataFromNetwork)
//     .then(() => {
//       setLastUpdated(new Date());
//     }).catch(err => {
//       console.warn(err);
//     });

//     getLocalEventData()
//     .then(offlineData => {
//       if (!offlineData.length) {
//       } 
//       else {        
//         updateUI(offlineData); 
//       }
//     });
//   }).catch(err => {
//     console.log('Network requests have failed, this is expected if offline');
//     getLocalEventData()
//     .then(offlineData => {
//       if (!offlineData.length) {
//       } else {
//         updateUI(offlineData); 
//       }
//     });
//   });
// }
function loadContentNetworkFirst() {
  getServerData()
  .then(dataFromNetwork => {
    updateUI(dataFromNetwork);
    saveEventDataLocally(dataFromNetwork)
    .then(() => {
      setLastUpdated(new Date());
    }).catch(err => {
      console.warn(err);
    });
  }).catch(err => {
    console.log('Network requests have failed, this is expected if offline');
    getLocalEventData()
    .then(offlineData => {
      if (!offlineData.length) {
      } else {
        updateUI(offlineData); 
      }
    });
  });
}
function createIndexedDB() {
  if (!('indexedDB' in window)) {return null;}
  return idb.open('dashboardr', 1, function(upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('modules')) {
      const modulesOS = upgradeDb.createObjectStore('modules', {keyPath: 'id'});
    }
  });
}
/* Network functions */

function getServerData() {
  return fetch('api/getAll').then(response => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  });
}

/* UI functions */

function updateUI(events) {
  events.forEach(event => {
    const card = `
    <a href="chapter.html">
                        <div class="module-card">
                            <div class="row">
                                <div class="col-xs-6">
                                    <div class="module-card-image">
            
                                    </div>
                                </div>
                                <div class="col-xs-6">
                                    <p class="module-card-heading">${event.title}</p>
                                    <p class="module-card-sub-heading">${event.note}</p>
            
                                </div>
                            </div>
                        </div>
            
    </a>`;
    container.insertAdjacentHTML('beforeend', card);
  });
}

/* Storage functions */

function getLastUpdated() {
  return localStorage.getItem('lastUpdated');
}

function setLastUpdated(date) {
  localStorage.setItem('lastUpdated', date);
}
