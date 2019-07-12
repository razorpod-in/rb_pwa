// var version = 1;
var version = Date.now();
if ('serviceWorker' in navigator) {
   window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
         .then(registration => {
            // console.log(`Service Worker registered! Scope: ${registration.scope}`);
         })
         .catch(err => {
            // console.log(`Service Worker registration failed: ${err}`);
         });
   });
}

//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB ||
   window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction ||
   window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
   window.msIDBKeyRange

if (!window.indexedDB) {
   window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

var reponseMod = '';
var reponseChap = '';
var moduleIDArray = ["5d1f0a1093a3235fdcfa1977"];

const moduleContainer = document.getElementById('module-card-container');
const chapterContainer = document.getElementById('chapter-card-container');

const getModulesFromNetwork = async () => {

   try {
      var reponseModules = await axios.get('/server/modules');
      reponseMod = reponseModules.data.payload;
      return reponseModules.data.payload;
   } catch (error) {
      readAllModules();
      console.error(error)
   }
}

const getChaptersFromNetwork = async () => {
   try {
      for (var i = 0; i < moduleIDArray.length; i++) {
         var url = '/server/chapters/' + moduleIDArray[i];
         var reponseChapters = await axios.get(url);
         reponseChap = reponseChapters.data.payload;
      }

      return reponseChapters.data.payload;
   } catch (error) {
      readAll();
      console.error(error)
   }
}

const getQuestionsFromNetwork = async () => {
   try {
      var reponseQuestions = await axios.get('/server/questions');
      reponseQues = reponseQuestions.data.payload;
      return reponseQuestions.data.payload;
   } catch (error) {
      readAll();
      console.error(error)
   }
}

var db;
var request = window.indexedDB.open("nutrition", version);
request.onerror = function (event) {
   console.log("error: ");
};



request.onsuccess = function (event) {
   db = request.result;
   loadContentNetworkFirst();
};


request.onupgradeneeded = function (event) {
   var db = event.target.result;
   if (!db.objectStoreNames.contains('modules')) {
      var moduleStore = db.createObjectStore("modules", {
         keyPath: "id"
      });
   }
   if (!db.objectStoreNames.contains('chapters')) {
      var chapterStore = db.createObjectStore("chapters", {
         keyPath: "id"
      });
   }
   if (!db.objectStoreNames.contains('questions')) {
      var questionStore = db.createObjectStore("questions", {
         keyPath: "id"
      });
   }
}


function loadContentNetworkFirst() {
   getModulesFromNetwork()
      .then(dataFromNetwork => {
         addModules(dataFromNetwork)
         readAllModules()
      }).catch(err => {
         readAllModules()
      });

   getChaptersFromNetwork()
      .then(chapters => {
         addChapters(chapters)
      }).catch(err => {
         console.log("you are offline");
      });
   getQuestionsFromNetwork()
      .then(questions => {
         addQuestions(questions)
      }).catch(err => {});


}

function addModules(modules) {
   modules.forEach(module => {
      var request = db.transaction(["modules"], "readwrite")
         .objectStore("modules")
         .add({
            id: module._id,
            createdAt: module.createdAt,
            description: module.description,
            lastUpdatedBy: module.lastUpdatedBy,
            thumbnailPath: module.thumbnailPath,
            title: module.title,
            updatedAt: module.updatedAt,
         });
      moduleIDArray.push(module._id);
   })
   request.onsuccess = function (event) {
      alert("Modules has been added to your database.");
   };

   request.onerror = function (event) {
      alert("Unable to add data\r\n Module is aready exist in your database! ");
   }
}

function readModules() {
   var transaction = db.transaction(["module"]);
   var objectStore = transaction.objectStore("module");
   var request = objectStore.get("00-03");

   request.onerror = function (event) {
      alert("Unable to retrieve daa from database!");
   };

   request.onsuccess = function (event) {
      // Do something with the request.result!
      if (request.result) {
         alert("Name: " + request.result.name + ", Age: " + request.result.age + ", Email: " + request.result.email);
      } else {
         alert("Kenny couldn't be found in your database!");
      }
   };
}

function readAllModules() {
   var objectStore = db.transaction("modules").objectStore("modules");
   objectStore.getAll().onsuccess = function (event) {
      var modules = event.target.result;
      updateModuleUI(modules);
      return modules;
   };
}

function updateModuleUI(modules) {
   for (var i = 0; i < modules.length; i++) {
      var moduleCard = `
      <div class="module-card" onclick="openChapter('${modules[i].id}')">
          
      <div class="row">
              <div class="col-xs-6">
                <img class="module-card-image" src="${modules[i].thumbnailPath}">
              </div>
              <div class="col-xs-6">
                <p class="module-card-heading">${modules[i].title}</p>
                <p class="module-card-sub-heading">${modules[i].description}</p>
              </div>
          
      </div>
  </div>`;
      moduleContainer.insertAdjacentHTML('beforeend', moduleCard);
   }
}

function addChapters(chapters) {

   var primaryId = '';
   chapterArray = [];
   chapters.forEach(chapter => {
      primaryId = chapter.mid;
      chapterArray.push(chapter);
   })

   var request = db.transaction(["chapters"], "readwrite")
      .objectStore("chapters")
      .add({
         id: primaryId,
         chapterArray: chapterArray,
      });
}

function openChapter(mid) {
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var chaptersList = '';
   request.onsuccess = function (event) {
      // Do something with the request.result!
      if (request.result) {
         chaptersList = request.result.chapterArray;
         updateChapterUI(chaptersList);
      }
   };
}

function updateChapterUI(chaptersList) {
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6" onclick="alert('${chaptersList[i].title}')"> 
            <img src="${chaptersList[i].thumb}" style="width:100%">
          <p class="chapter-card-heading">${chaptersList[i].title} hello</p>
        </div>`;
      chapterContainer.insertAdjacentHTML('beforeend', chapterCard);
   }
   moduleContainer.style.display = "none";
   chapterContainer.style.display = "block";
}

function addQuestions(questions) {
   var primaryId = '';
   questionsArray = [];
   questions.forEach(question => {
      primaryId = question.mid;
      questionsArray.push(question);
   })

   var request = db.transaction(["questions"], "readwrite")
      .objectStore("questions")
      .add({
         id: primaryId,
         questionsArray: questionsArray,
      });
}

function openChapter(mid) {
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var chaptersList = '';
   request.onsuccess = function (event) {
      // Do something with the request.result!
      if (request.result) {
         chaptersList = request.result.chapterArray;
         updateChapterUI(chaptersList);
      }
   };
}

function updateChapterUI(chaptersList) {
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6"> 
            <img src="${chaptersList[i].thumb}" style="width:100%">
          <p class="chapter-card-heading">${chaptersList[i].title}</p>
        </div>`;
      chapterContainer.insertAdjacentHTML('beforeend', chapterCard);
   }
   moduleContainer.style.display = "none";
   chapterContainer.style.display = "block";
}

function openSingleChapter(mid,id){
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
}
function remove() {
   var request = db.transaction(["employee"], "readwrite")
      .objectStore("employee")
      .delete("00-03");

   request.onsuccess = function (event) {
      alert("Kenny's entry has been removed from your database.");
   };
}