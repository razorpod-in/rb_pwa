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
var reponseChap = [];
var moduleIDArray = [];
var sound = ""
var reponseQues = [];

const moduleContainer = document.getElementById('module-card-container');
const chapterContainer = document.getElementById('chapter-card-container');
const eachChapterContainer = document.getElementById('each-chapter-card-container');
const questionContainer = document.getElementById('question-card-container');

const getModulesFromNetwork = async () => {

   try {
      var reponseModules = await axios.get('/server/modules');
      reponseMod = reponseModules.data.payload;
      for (var i = 0; i < reponseMod.length; i++) {
         moduleIDArray.push(reponseMod[i]._id);
      }
      return reponseModules.data.payload;
   } catch (error) {
      console.log("You are offline bitch");
      console.error(error)
   }
}

const getChaptersFromNetwork = async () => {
   try {
      for (var i = 0; i < moduleIDArray.length; i++) {
         var url = '/server/chapters/' + moduleIDArray[i];
         var reponseChapters = await axios.get(url);
         reponseChap.push(reponseChapters.data.payload);
      }

      return reponseChap;
   } catch (error) {
      console.error(error)
   }
}

const getQuestionsFromNetwork = async () => {
   try {
      for (var i = 0; i < moduleIDArray.length; i++) {
         var url = '/server/questions/' + moduleIDArray[i];
         var reponseQuestion = await axios.get(url);
         reponseQues.push(reponseQuestion.data.payload);
      }
      return reponseQues;
   } catch (error) {
      console.error(error)
   }
}

var db;
var initialUserData = '';
var request = window.indexedDB.open("nutrition", version);
request.onerror = function (event) {
   console.log("error: ");
};



request.onsuccess = function (event) {
   db = request.result;
   var initialObjectStore = db.transaction("user").objectStore("user");
   initialObjectStore.getAll().onsuccess = function (event) {
      initialUserData = event.target.result;
   };
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
   if (!db.objectStoreNames.contains('user')) {
      var userStore = db.createObjectStore("user", {
         keyPath: "id"
      });
   }
}


function loadContentNetworkFirst() {
   getModulesFromNetwork()
      .then(dataFromNetwork => {
         addModules(dataFromNetwork)
         readAllModules()
         getChaptersFromNetwork()
            .then(chapters => {
               addChapters(chapters)
            }).catch(err => {});
         getQuestionsFromNetwork()
            .then(questions => {
               addQuestions(questions)
            }).catch(err => {});
      }).catch(err => {
         readAllModules()
      });


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

   })
   request.onsuccess = function (event) {
      // alert("Modules has been added to your database.");
   };

   request.onerror = function (event) {
      // alert("Unable to add data\r\n Module is aready exist in your database! ");
   }
}

function readModules() {
   var transaction = db.transaction(["module"]);
   var objectStore = transaction.objectStore("module");
   var request = objectStore.get("00-03");

   request.onerror = function (event) {
      // alert("Unable to retrieve daa from database!");
   };

   request.onsuccess = function (event) {
      // Do something with the request.result!
      if (request.result) {
         // alert("Name: " + request.result.name + ", Age: " + request.result.age + ", Email: " + request.result.email);
      } else {
         // alert("Kenny couldn't be found in your database!");
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
   moduleContainer.innerHTML = '<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><center><p class="pick-screen-heading">निम्नलिखित चीज़ो का ध्यान रखें </p></center>';
   for (var i = 0; i < modules.length; i++) {
      if (i == modules.length - 1) {
         var moduleCard = `
      <div class="module-card" onclick="openChapter('${modules[i].id}')" style="margin-bottom: 100px;">
      <div class="row">
              <div class="col-xs-6">
                <img class="module-card-image" src="${modules[i].thumbnailPath}">
              </div>
              <div class="col-xs-6 module-title-container">
                <p class="module-card-heading">${modules[i].title}</p>
                <!-- <p class="module-card-sub-heading">${modules[i].description}</p> -->
              </div>
          
      </div>
  </div>`;
      } else {
         var moduleCard = `
         <div class="module-card" onclick="openChapter('${modules[i].id}')">
             
         <div class="row">
                 <div class="col-xs-6">
                   <img class="module-card-image" src="${modules[i].thumbnailPath}">
                 </div>
                 <div class="col-xs-6 module-title-container">
                   <p class="module-card-heading">${modules[i].title}</p>
                   <!-- <p class="module-card-sub-heading">${modules[i].description}</p> -->
                 </div>
             
         </div>
     </div>`;
      }

      moduleContainer.insertAdjacentHTML('beforeend', moduleCard);
   }
   chapterContainer.style.display = "none";
   moduleContainer.style.display = "block";
}

function addChapters(chapters) {
   for (var i = 0; i < chapters.length; i++) {
      var primaryId = '';
      chapterArray = [];
      primaryId = chapters[i][0].mid;
      for (var j = 0; j < chapters[i].length; j++) {
         chapterArray.push(chapters[i][j]);
      }
      var request = db.transaction(["chapters"], "readwrite")
         .objectStore("chapters")
         .add({
            id: primaryId,
            chapterArray: chapterArray,
         });
   }


}

function openChapter(mid) {
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var chaptersList = '';

   request.onsuccess = function (event) {
     
      var userTransaction = db.transaction(["user"], "readwrite");
      var userObjectStore = userTransaction.objectStore("user");
      var userRequest = userObjectStore.get(userId);
      
      userRequest.onsuccess = function (event) {
         var indexMid1 ='test';
         chaptersList = request.result.chapterArray;
         var userData = userRequest.result;

         for (var i = 0; i < userData.moduleVisited.length; i++) {
            if (userData.moduleVisited[i] == mid) {
               indexMid1 = i;
            }
         }
         console.log(indexMid1);
         if(indexMid1 != 'test'){
            if(userData.chapterVisited[indexMid1].length == chaptersList.length){
               updateQuestionUI();
            }
            else{
               updateChapterUI(chaptersList);
            }
         }
         else{
            updateChapterUI(chaptersList);
         }
         
         
         userData.lastModule = mid;
         if (userData.moduleVisited.includes(mid)) {
            console.log("Already Exists");
         } else {
            userData.moduleVisited.push(mid);
            userData.chapterVisited.push([]);
         }
         var userUpdateRequest = userObjectStore.put(userData);
         userUpdateRequest.onsuccess = function (event) {
            // Do something with the request.result!
         };
      };
   };

}

function openLastChapter(mid) {
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var chaptersList = '';

   request.onsuccess = function (event) {

      // Do something with the request.result!
      if (request.result) {
         chaptersList = request.result.chapterArray;
         updateLastChapterUI(chaptersList);
      }
      var userTransaction = db.transaction(["user"], "readwrite");
      var userObjectStore = userTransaction.objectStore("user");
      var userRequest = userObjectStore.get(userId);
      userRequest.onsuccess = function (event) {
         var userData = userRequest.result;
         userData.lastModule = mid;
         key = userData.number;
         var userUpdateRequest = userObjectStore.put(userData);
         userUpdateRequest.onsuccess = function (event) {
            // Do something with the request.result!
         };
      };
   };

}

function updateChapterUI(chaptersList) {
   chapterContainer.innerHTML = ' <div class="row"><a onclick=backNav("module")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" /><center><p class="pick-screen-heading"></p></center>';
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6" onclick="openEachChapter('${chaptersList[i].mid}','${chaptersList[i]._id}')"> 
            <img src="${chaptersList[i].thumb}" style="width:80%">
          <p class="chapter-card-heading">${chaptersList[i].title}</p>
        </div>`;
      chapterContainer.insertAdjacentHTML('beforeend', chapterCard);
   }
   moduleContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   chapterContainer.style.display = "block";
}

function updateLastChapterUI(chaptersList) {
   chapterContainer.innerHTML = ' <div class="row"><a onclick="readAllModules()"><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" /><center><p class="pick-screen-heading"></p></center>';
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6" onclick="openEachChapter('${chaptersList[i].mid}','${chaptersList[i]._id}')"> 
            <img src="${chaptersList[i].thumb}" style="width:80%">
          <p class="chapter-card-heading">${chaptersList[i].title}</p>
        </div>`;
      chapterContainer.insertAdjacentHTML('beforeend', chapterCard);
   }
   document.getElementById("splash-screen").style.display = "none";
   moduleContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   document.getElementById("tabs-screen").style.display = "block";
   chapterContainer.style.display = "block";
}

function addQuestions(questions) {
   for (var i = 0; i < questions.length; i++) {
      var primaryId = '';
      questionArray = [];
      if (questions[i].length > 0) {
         primaryId = questions[i][0].mid;
         for (var j = 0; j < questions[i].length; j++) {
            questionArray.push(questions[i][j]);
         }
         var request = db.transaction(["questions"], "readwrite")
            .objectStore("questions")
            .add({
               id: primaryId,
               questionArray: questionArray,
            });
      }
   }
}

function updateQuestionUI() {
   questionContainer.innerHTML = ' <div class="row"><a onclick=backNav("module")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" /><div class="task-screen"><center><p class="pick-screen-heading">Topic</p></center><center><h4 class="task-heading">इनमें से किसी भी प्रकार के लक्षण होने के मामले में आपको क्या करना चाहिए?</h4><p class="tast-text"></p><div class="options"><input type="radio" name="gender" id="" value="">घर में अन्य महिलाओं से पूछताछ करें। </div><div class="options"><input type="radio" name="gender" id="" value="">लक्षण अपने आप खत्म हो जाने की प्रतीक्षा करें।</div><div class="options"><input type="radio" name="gender" id="" value="">तुरंत निकटतम अस्पताल में जाएँ। </div><div class="options"><input type="radio" name="gender" id="" value="">ऊपर के सभी</div></center></div>';
   moduleContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   questionContainer.style.display = "block";
}

function openEachChapter(mid, id) {
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var thatChapter = [];
   request.onsuccess = function (event) {
      thatChapter = request.result.chapterArray
      var userTransaction = db.transaction(["user"], "readwrite");
      var userObjectStore = userTransaction.objectStore("user");
      var userRequest = userObjectStore.get(userId);
      var indexMid = '';
      userRequest.onsuccess = function (event) {
         var userData = userRequest.result;

         userData.lastChapter = id;
         for (var i = 0; i < userData.moduleVisited.length; i++) {
            if (userData.moduleVisited[i] == mid) {
               indexMid = i;
            }
         }

         for (var i = 0; i < thatChapter.length; i++) {
            if (thatChapter[i]._id == id) {
               var eachChapter = thatChapter[i];
               updateEachChapterUI(eachChapter);
            }
         }

         var chapterStatus = userData.chapterVisited[indexMid].includes(id);
         if (chapterStatus) {
            console.log("Chapter visited");
         } else {
            userData.chapterVisited[indexMid].push(id);
         }
         var userUpdateRequest = userObjectStore.put(userData);
         userUpdateRequest.onsuccess = function (event) {
            // Do something with the request.result!
         };
      };


   };
}

function openLastEachChapter(mid, id) {

   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   request.onsuccess = function (event) {

      // Do something with the request.result!
      if (request.result) {
         var thatChapter = request.result.chapterArray
         var eachChapter = '';
         for (var i = 0; i < thatChapter.length; i++) {
            if (thatChapter[i]._id == id) {
               eachChapter = thatChapter[i];
               updateLastEachChapterUI(eachChapter, mid);
            }
         }

         if (eachChapter == '') {
            openLastChapter(mid);
         }
      }
   };
}

function updateLastEachChapterUI(eachChapter, mid) {

   if (eachChapter.img != '') {
      var visualCard = `<img class="chapter-image" src=${eachChapter.img} alt="">`;
   } else if (eachChapter.vid != '') {
      var visualCard = ` <div class="row">
      <div class = "col-md-12">
      <video id='my-video' class='video-js' loop="loop" autoplay preload='auto' poster='' data-setup='{}'>
         <source src='${eachChapter.vid}' type='video/webm'>
      </video>
      </div>
      </div>`
   }

   if (eachChapter.aud != "") {
      $('.asha_didi').removeClass('hide_didi')
      sound = new Howl({
         src: [eachChapter.aud],
         preload: true,
         onend: function () {
            $('.asha_didi').addClass('hide_didi')
            console.log('Sound Over. Didi Hide')
         }
      });
      sound.play();
   }
   var eachChapterCard = `
   <center>
   <div class="row">
       <div class="single-image">
           ${visualCard}
           <div class="description-content last-element">
            ${eachChapter.desc}
           </div>
       </div>
   </div>
   <div >
       <img class="asha_didi hide_didi" src="assets/svg/asha_tai.svg" alt="">
   </div>
</center>`;
   var initialStateEachChapterContainer = '<div class="row"><a onclick=openChapter("' + mid + '")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" />';
   eachChapterContainer.innerHTML = initialStateEachChapterContainer;
   eachChapterContainer.insertAdjacentHTML('beforeend', eachChapterCard);

   document.getElementById("splash-screen").style.display = "none";
   moduleContainer.style.display = "none";
   document.getElementById("tabs-screen").style.display = "block";
   eachChapterContainer.style.display = "block";
}

function updateEachChapterUI(eachChapter) {
   if (eachChapter.img != '') {
      var visualCard = `<img class="chapter-image" src=${eachChapter.img} alt="">`;
   } else if (eachChapter.vid != '') {
      var visualCard = ` <div class="row">
      <div class = "col-md-12">
      <video id='my-video' class='video-js' loop="loop" autoplay preload='auto' poster='' data-setup='{}'>
         <source src='${eachChapter.vid}' type='video/webm'>
      </video>
      </div>
      </div>`
   }


   var eachChapterCard = `
   <center>
   <div class="row">
       <div class="single-image">
           ${visualCard}
           <div class="description-content last-element">
            ${eachChapter.desc}
           </div>
       </div>
   </div>
   <div >
       <img class="asha_didi hide_didi" src="assets/svg/asha_tai.svg" alt="">
   </div>
</center>`;
   var initialStateEachChapterContainer = '<div class="row"><a onclick=backNav("chapter")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" />';
   eachChapterContainer.innerHTML = initialStateEachChapterContainer;
   eachChapterContainer.insertAdjacentHTML('beforeend', eachChapterCard);

   chapterContainer.style.display = "none";
   eachChapterContainer.style.display = "block";
   if (eachChapter.aud != "") {
      $('.asha_didi').removeClass('hide_didi')
      sound = new Howl({
         src: [eachChapter.aud],
         preload: true,
         onend: function () {
            $('.asha_didi').addClass('hide_didi')
            console.log('Sound Over. Didi Hide')
         }
      });
      sound.play();

   }
}


/**
 * fullName - Required
 * phone - Required
 * lastModuleVisited - module id
 * lastChapterVisited - chapter id
 * bid - Browser ID 
 */

function insertUserInMongo() {
   /**
    * POST request axios - @Users
    */
   var userData = {
      bid: user_type,
      fullName: user_name,
      phone: user_number
   }

   axios.post('/api/users', userData)
      .then(response => response.data)
      .catch(error => console.log(error))
      .then(data => {
         if (data.status == "Success") {
            userId = data.payload._id;
            addUser(data.payload);
         } else {
            alert('Request Failed')
         }
      })
}

function addUser(userData) {
   var request = db.transaction(["user"], "readwrite")
      .objectStore("user")
      .add({
         id: userData._id,
         name: userData.fullName,
         number: userData.phone,
         type: userData.bid,
         lastModule: '',
         lastChapter: '',
         moduleVisited: [],
         chapterVisited: [],
      });
   request.onsuccess = function (event) {
      // alert("User has been added to your database.");
   };

   request.onerror = function (event) {
      // alert("Unable to add data\r\n Module is aready exist in your database! ");
   }
}

function remove() {
   var request = db.transaction(["employee"], "readwrite")
      .objectStore("employee")
      .delete("00-03");

   request.onsuccess = function (event) {
      // alert("Kenny's entry has been removed from your database.");
   };
}

// Main JS Function 

var user_type = '';
var selected = "none"
var timePeriodInMs = 2000;
var user_info_status = 0;
var user_name = '';
var user_number = '';
var userId = '';

// Functions 
setTimeout(function () {
      if (initialUserData.length > 0) {
         userId = initialUserData[0].id;
         if (initialUserData[0].lastModule != '' && initialUserData[0].lastChapter != '') {
            openLastEachChapter(initialUserData[0].lastModule, initialUserData[0].lastChapter)
         } else if (initialUserData[0].lastModule != '' && initialUserData[0].lastChapter == '') {
            openLastChapter(initialUserData[0].lastModule);
         }
      } else {
         document.getElementById("splash-screen").style.display = "none";
         document.getElementById("pick-screen").style.display = "block";
      }

   },
   timePeriodInMs);

sound = new Howl({
   src: ['assets/amr/intro.mp3'],
   preload: true,
   onend: function () {
      $('.asha_didi').addClass('hide_didi')
      console.log('Sound Over. Didi Hide')
   }
});

function select_one(id_select) {
   if (selected == "none") {
      $('.asha_didi').removeClass('hide_didi')

      sound.play()
   }
   if (id_select.id == "c1") {
      selected = "1"
      user_type = 'pregnant';
      document.getElementById(id_select.id).style.borderColor = "green";
      document.getElementById("c2").style.borderColor = "white";
   } else {
      selected = '2'
      user_type = 'mother';
      document.getElementById(id_select.id).style.borderColor = "green";
      document.getElementById("c1").style.borderColor = "white";
   }
   document.getElementById("b1").classList.add('clicked');
}

function router_registration() {
   var status = (selected == "none") ? null : 1;
   if (status) {
      document.getElementById("registration-screen").style.display = "block";
      document.getElementById("pick-screen").style.display = "none";
   }
}

function valid_form() {
   var num_user = document.getElementById("num_id").value;
   var name_user = document.getElementById("name_id").value;
   var accept_user = document.getElementById("accept_id").checked;
   if (num_user.length == 10 && name_user.length >= 4 && accept_user == true) {
      user_info_status = 1;
      user_name = name_user;
      user_number = num_user;
   } else {
      user_info_status = 0;
   }

   if (user_info_status > 0) {
      if (document.getElementById("b2").classList.contains('clicked')) {

      } else {
         document.getElementById('b2').className += " clicked";
      }
   }

   if (user_info_status == 0) {
      document.getElementById('b2').className = "pick-screen-button";
   }
}

function router_tabs_screen() {
   if (user_info_status > 0) {
      insertUserInMongo();
      document.getElementById("registration-screen").style.display = "none";
      document.getElementById("tabs-screen").style.display = "block";
   }
}

function open_tab(event, tabName) {

   var i, tabcontent, tablinks;
   tabcontent = document.getElementsByClassName("tab-content");

   for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
   }

   tablinks = document.getElementsByClassName("tab-link");
   var tab_id = "img-" + tabName;
   for (i = 0; i < tablinks.length; i++) {
      if (tablinks[i].id == tab_id) {
         tablinks[i].src = "images/nav-icons/selected-" + tablinks[i].id + ".png"
      } else {
         tablinks[i].src = "images/nav-icons/" + tablinks[i].id + ".png"
      }
   }
   document.getElementById(tabName).style.display = "block";
}

function backNav(pagename) {
   if (sound) {
      sound.stop();
   }
   sound.stop();
   if (pagename == 'module') {
      chapterContainer.style.display = "none";
      moduleContainer.style.display = "block";
   } else if (pagename == 'chapter') {
      chapterContainer.style.display = "block";
      eachChapterContainer.style.display = "none";
   }
}