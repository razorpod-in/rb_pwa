var version = 1;
// var version = Date.now();

console.log("index file called");
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

const getModules1 = async () => {
   
   try {
      console.log("function called");
      var reponseModules = await axios.get('/server/modules');
      console.log("function called");
      reponseMod = reponseModules.data.payload;
      console.log(reponseMod);
      return reponseModules.data.payload;
   } catch (error) {
      console.error(error)
   }
}
const moduleContainer = document.getElementById('module-card-container');

const employeeData = [{
      id: "00-01",
      name: "gopal",
      age: 35,
      email: "gopal@tutorialspoint.com"
   },
   {
      id: "00-02",
      name: "prasad",
      age: 32,
      email: "prasad@tutorialspoint.com"
   }
];
var db;
var request = window.indexedDB.open("nutrition", version);

request.onerror = function (event) {
   console.log("error: ");
};

request.onsuccess = function (event) {
   db = request.result;
   console.log("success: " + db);
};

request.onupgradeneeded = function (event) {
   var db = event.target.result;
   if (!db.objectStoreNames.contains('modules')) {
      var moduleStore = db.createObjectStore("modules", {keyPath: "id"});
   }
   if (!db.objectStoreNames.contains('chapters')) {
      var chapterStore = db.createObjectStore("chapters", {keyPath: "id"});
   }   
}

loadContentNetworkFirst();

function loadContentNetworkFirst() {
   getModules1()
     .then(dataFromNetwork => {
         addModules(dataFromNetwork)
         readAllModules()
     }).catch(err => {
        console.log(err);
     });
 }

function addModules(modules) {
   console.log("Adding the modules");
   modules.forEach(module => {
      var request = db.transaction(["modules"], "readwrite")
      .objectStore("modules")
      .add({
         id: module._id,
         createdAt:module.createdAt,
         description:module.description,
         lastUpdatedBy:module.lastUpdatedBy,
         thumbnailPath:module.thumbnailPath,
         title:module.title,
         updatedAt:module.updatedAt,
      });
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
   console.log("Reading the modules");
   var objectStore = db.transaction("modules").objectStore("modules");
   objectStore.openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      updateModuleUI(cursor.value);
      return cursor.value;
   };
}

function updateModuleUI(module){
   console.log(module);
      var card = `
        <a href="chapter.html?id=${module.id}">
          <div class="module-card">
          
              <div class="row">
                      <div class="col-xs-6">
                        <img class="module-card-image" src="${module.thumbnailPath}">
                      </div>
                      <div class="col-xs-6">
                        <p class="module-card-heading">${module.title}</p>
                        <p class="module-card-sub-heading">${module.description}</p>
                      </div>
                  
              </div>
          </div>
        </a>
      `
      if (moduleContainer) {
         moduleContainer.insertAdjacentHTML('beforeend', card);
      }
}

function remove() {
   var request = db.transaction(["employee"], "readwrite")
      .objectStore("employee")
      .delete("00-03");

   request.onsuccess = function (event) {
      alert("Kenny's entry has been removed from your database.");
   };
}