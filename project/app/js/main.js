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
const chapterContainer = document.getElementById('chapter-card-container');

Notification.requestPermission();

// TODO - create indexedDB database
const dbPromise = createIndexedDB();

loadContentNetworkFirst();

function saveEventDataLocally(modules) {
  if (!('indexedDB' in window)) {
    return null;
  }
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
  if (!('indexedDB' in window)) {
    return null;
  }
  return dbPromise.then(db => {
    const tx = db.transaction('modules', 'readonly');
    const store = tx.objectStore('modules');
    return store.getAll();
  });
}

function loadContentNetworkFirst() {
  getServerData()
    .then(dataFromNetwork => {
      saveEventDataLocally(dataFromNetwork)
        .then(() => {
          setLastUpdated(new Date());
        }).catch(err => {
          console.warn(err);
        });

      getLocalEventData()
        .then(offlineData => {
          if (!offlineData.length) {} else {
            updateUI(offlineData);
            chapterUI(offlineData);
          }
        });
    }).catch(err => {
      console.log('Network requests have failed, this is expected if offline');
      getLocalEventData()
        .then(offlineData => {
          if (!offlineData.length) {} else {
            updateUI(offlineData);
            chapterUI(offlineData);
          }
        });
    });
}

function createIndexedDB() {
  if (!('indexedDB' in window)) {
    return null;
  }
  return idb.open('dashboardr', 1, function (upgradeDb) {
    if (!upgradeDb.objectStoreNames.contains('modules')) {
      const modulesOS = upgradeDb.createObjectStore('modules', {
        keyPath: 'id'
      });
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

function updateUI(modules) {
  modules.forEach(module => {
    var card = `
    <a href="chapter.html?id=${module.id}">
                        <div class="module-card">
                            <div class="row">
                                <div class="col-sm-12">
                                    
                                    <div class="col-sm-6">
                                      <p class="module-card-heading">${module.module_name}</p>
                                      <p class="module-card-sub-heading">${module.module_description}</p>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
    </a>`;
    if(container){
      container.insertAdjacentHTML('beforeend', card);
    }
  });
}

function chapterUI(modules) {
  var url_string = window.location.href;
  var url = new URL(url_string);
  var c = url.searchParams.get("id");
  var steps = ''
  var module_name = ''
  modules.forEach(module=> {
    if (c == module.id) {
      module_name = module.module_name
      steps = module.steps
    }
  });

  steps.forEach(step => {
    const card = `
      <div class="col-xs-6">
        <div class="chapter-card" onclick="wow('${step.id}','${module_name}')">
        </div>
        <p class="chapter-card-heading">${step.step_title}</p>
      </div>`;
    if(chapterContainer){
      chapterContainer.insertAdjacentHTML('beforeend', card);
    }
  });
}

/* Storage functions */

function getLastUpdated() {
  return localStorage.getItem('lastUpdated');
}

function setLastUpdated(date) {
  localStorage.setItem('lastUpdated', date);
}