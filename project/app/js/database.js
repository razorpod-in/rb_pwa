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
var rightAns = '';
var optionClickedStatus = 0;

const moduleContainer = document.getElementById('module-card-container');
const chapterContainer = document.getElementById('chapter-card-container');
const eachChapterContainer = document.getElementById('each-chapter-card-container');
const questionContainer = document.getElementById('question-card-container');
const rightAnswerContainer = document.getElementById('right-answer-card-container');
const wrongAnswerContainer = document.getElementById('wrong-answer-card-container');
const resetModuleContainer = document.getElementById('reset-module-card-container');
const profileContainer = document.getElementById('profile-container');

const getModulesFromNetwork = async (user_type) => {
   try {
      var url = '/server/modules/' + user_type;
      var reponseModules = await axios.get(url);
      reponseMod = reponseModules.data.payload;
      for (var i = 0; i < reponseMod.length; i++) {
         moduleIDArray.push(reponseMod[i]._id);
      }
      return reponseModules.data.payload;
   } catch (error) {
      console.log("You are offline");
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
   if (!db.objectStoreNames.contains('duplicate-questions')) {
      var questionStore = db.createObjectStore("duplicate-questions", {
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
   getModulesFromNetwork(user_type)
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
      updateProfileUI();
   };

}

function updateModuleUI(modules) {
   moduleContainer.innerHTML = '<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><center><p class="pick-screen-heading">शुरू करने के लिए निम्नलिखित में से चयन करें</p></center>';
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
   document.getElementById("pick-screen").style.display = "none";
   chapterContainer.style.display = "none";
   moduleContainer.style.display = "block";
   resetModuleContainer.style.display = "none";
   rightAnswerContainer.style.display = "none";
   wrongAnswerContainer.style.display = "none";
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
   if (sound) {
      sound.stop();
   }
   var transaction = db.transaction(["chapters"]);
   var objectStore = transaction.objectStore("chapters");
   var request = objectStore.get(mid);
   var chaptersList = '';

   request.onsuccess = function (event) {

      if (sound) {
         sound.stop();
      }
      var userTransaction = db.transaction(["user"], "readwrite");
      var userObjectStore = userTransaction.objectStore("user");
      var userRequest = userObjectStore.get(userId);

      userRequest.onsuccess = function (event) {

         chaptersList = request.result.chapterArray;
         var userData = userRequest.result;
         var indexMid1 = 'test';

         for (var i = 0; i < userData.moduleVisited.length; i++) {
            if (userData.moduleVisited[i] == mid) {
               indexMid1 = i;
            }
         }
         if (indexMid1 != 'test') {

            if (userData.chapterVisited[indexMid1].length == chaptersList.length) {
               var quesTransaction = db.transaction(["questions"], "readwrite");
               var quesObjectStore = quesTransaction.objectStore("questions");
               var quesrequest = quesObjectStore.get(mid);
               var quesList = '';
               quesrequest.onsuccess = function (event) {
                  if (quesrequest.result) {
                     quesList = quesrequest.result.questionArray;
                  }
                  if (quesList.length == 0) {
                     var userTransaction = db.transaction(["user"], "readwrite");
                     var userObjectStore = userTransaction.objectStore("user");
                     var userRequest = userObjectStore.get(userId);

                     userRequest.onsuccess = function (event) {
                        var userData = userRequest.result;
                        if (userData.rewards.includes(mid)) {
                           // console.log("Already Exists");
                        } else {
                           userData.rewards.push(mid);
                        }
                        var userUpdateRequest = userObjectStore.put(userRequest.result);
                        userUpdateRequest.onsuccess = function (event) {
                           // console.log("1 = ", userRequest.result);
                        };
                     }
                     resetModuleUI(mid);
                  } else {
                     var ques = quesrequest.result.questionArray[0];
                     quesList.splice(0, 1);
                     quesrequest.result.questionArray = quesList;
                     var quesUpdateRequest = quesObjectStore.put(quesrequest.result);
                     quesUpdateRequest.onsuccess = function (event) {};
                     var userTransaction = db.transaction(["user"], "readwrite");
                     var userObjectStore = userTransaction.objectStore("user");
                     var userRequest = userObjectStore.get(userId);

                     userRequest.onsuccess = function (event) {
                        userRequest.result.lastQuestion.push(ques);
                        updateQuestionUI(ques);
                        var userUpdateRequest = userObjectStore.put(userRequest.result);
                        userUpdateRequest.onsuccess = function (event) {
                           // console.log("1 = ", userRequest.result);
                        };
                     }
                  }
               }

            } else {
               updateChapterUI(chaptersList);
            }
         } else {
            updateChapterUI(chaptersList);
         }
         userData.lastModule = mid;
         if (userData.moduleVisited.includes(mid)) {
            // console.log("Already Exists");
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
   updateProfileUI();
   updateUserInMongo();
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

function resetModuleUI(mid) {
   resetModuleContainer.innerHTML = `<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><center>
      <p class="pick-screen-heading"> अपने मॉड्यूल पृष्ठ को रीसेट करें </p>
       <div class="next-screen-button" id="b1" onclick="clearChapterVisited('${mid}')">
       <p class="pick-screen-button-text"> मॉड्यूल रीसेट करें </p>
       </div>
       <div class="next-screen-button" id="b1" onclick="readAllModules()">
       <p class="pick-screen-button-text"> मॉड्यूल की सूची पर वापस जाएँ </p>
       </div>
       </center>`;
   moduleContainer.style.display = "none";
   chapterContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   rightAnswerContainer.style.display = "none";
   wrongAnswerContainer.style.display = "none";
   resetModuleContainer.style.display = "block";
}

function updateChapterUI(chaptersList) {
   if (sound) {
      sound.stop();
   }
   chapterContainer.innerHTML = ' <div class="row"><a onclick=readAllModules()><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" /><center><p class="pick-screen-heading"></p></center>';
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6" onclick="openEachChapter('${chaptersList[i].mid}','${chaptersList[i]._id}')"> 
            <img src="${chaptersList[i].thumb}" style="width:80%;height: 150px">
          <p class="chapter-card-heading">${chaptersList[i].title}</p>
        </div>`;
      chapterContainer.insertAdjacentHTML('beforeend', chapterCard);
   }
   resetModuleContainer.style.display = "none";
   moduleContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   rightAnswerContainer.style.display = "none";
   wrongAnswerContainer.style.display = "none";
   chapterContainer.style.display = "block";
}

function updateLastChapterUI(chaptersList) {
   if (sound) {
      sound.stop();
   }
   chapterContainer.innerHTML = ' <div class="row"><a onclick="readAllModules()"><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" /><center><p class="pick-screen-heading"></p></center>';
   for (var i = 0; i < chaptersList.length; i++) {
      var chapterCard = `
        <div class="col-xs-6" onclick="openEachChapter('${chaptersList[i].mid}','${chaptersList[i]._id}')"> 
            <img src="${chaptersList[i].thumb}" style="width:80%;height: 150px">
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
   for (var i = 0; i < questions.length; i++) {
      var primaryId = '';
      questionArray = [];
      if (questions[i].length > 0) {
         primaryId = questions[i][0].mid;
         for (var j = 0; j < questions[i].length; j++) {
            questionArray.push(questions[i][j]);
         }
         var request = db.transaction(["duplicate-questions"], "readwrite")
            .objectStore("duplicate-questions")
            .add({
               id: primaryId,
               questionArray: questionArray,
            });
      }
   }
}

function updateQuestionUI(ques) {
   optionClickedStatus = 0;
   rightAns = ques.answer;
   var optionArray = '';
   for (var i = 0; i < ques.options.length; i++) {
      var optionElement = `<div class="options" onclick="optionClicked('${ques.options[i]._id}')" id="${ques.options[i]._id}">${ques.options[i].text} </div>`;
      optionArray = optionArray + optionElement;
   }
   questionContainer.innerHTML = `<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><div class="task-screen"><center><p class="pick-screen-heading">सवाल</p></center><center><h4 class="task-heading"></h4><p class="tast-text">${ques.text}</p>${optionArray}<div class="options-submit" id="question_submit" onclick="questionSubmit('${rightAns}','${ques.mid}')">आगामी </div></center></div>`;

   moduleContainer.style.display = "none";
   eachChapterContainer.style.display = "none";
   questionContainer.style.display = "block";
   rightAnswerContainer.style.display = "none";
   wrongAnswerContainer.style.display = "none";
   resetModuleContainer.style.display = "none";

   document.getElementById("splash-screen").style.display = "none";
   document.getElementById("tabs-screen").style.display = "block";

}

function openEachChapter(mid, id) {
   sound.stop();
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
            if (i == (thatChapter.length - 1) && thatChapter[i]._id == id) {
               var eachChapter = thatChapter[i];
               updateEachEndChapterUI(eachChapter);
            } else if (thatChapter[i]._id == id) {
               var eachChapter = thatChapter[i];
               if (thatChapter[i + 1] && thatChapter[i + 1]._id) {
                  var next_id = thatChapter[i + 1]._id;
                  updateEachChapterUI(eachChapter, next_id);
               } else {
                  openChapter(mid);
               }
            }
         }

         var chapterStatus = userData.chapterVisited[indexMid].includes(id);
         if (chapterStatus) {
            // console.log("Chapter visited");
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
            if (i == (thatChapter.length - 1) && thatChapter[i]._id == id) {
               var eachChapter = thatChapter[i];
               updateLastEachEndChapterUI(eachChapter);
            } else if (thatChapter[i]._id == id) {
               var eachChapter = thatChapter[i];
               if (thatChapter[i + 1] && thatChapter[i + 1]._id) {
                  var next_id = thatChapter[i + 1]._id;
                  updateLastEachChapterUI(eachChapter, mid, next_id);
               } else {
                  openChapter(mid);
               }
            }
         }

         if (eachChapter == '') {
            openLastChapter(mid);
         }
      }
   };
}

function updateLastEachChapterUI(eachChapter, mid, next_id) {

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
         }
      });
      sound.play();
   }
   var eachChapterCard = `
   <center>
   <div class="row">
       <div class="single-image">
           ${visualCard}
           <div class="description-content">
            ${eachChapter.desc}
           </div>
       </div>
   </div>
   <div class="next-screen-button" onclick="openEachChapter('${eachChapter.mid}','${next_id}')">
        <p class="pick-screen-button-text">आगामी</p>
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

function updateEachChapterUI(eachChapter, next_id) {
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
   <div class="next-screen-button" onclick="openEachChapter('${eachChapter.mid}','${next_id}')">
        <p class="pick-screen-button-text">आगामी</p>
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
            // console.log('Sound Over. Didi Hide')
         }
      });
      sound.play();

   }
}

function updateEachEndChapterUI(eachChapter) {
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
   <div class="next-screen-button" onclick="openChapter('${eachChapter.mid}')">
        <p class="pick-screen-button-text"> आगामी </p>
      </div>
   <div >
       <img class="asha_didi hide_didi" src="assets/svg/asha_tai.svg" alt="">
   </div>
</center>`;
   var initialStateEachChapterContainer = '<div class="row"><a onclick=backNav("chapter")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" />';
   eachChapterContainer.innerHTML = initialStateEachChapterContainer;
   eachChapterContainer.insertAdjacentHTML('beforeend', eachChapterCard);
   resetModuleContainer.style.display = "none";

   chapterContainer.style.display = "none";
   eachChapterContainer.style.display = "block";
   if (eachChapter.aud != "") {
      $('.asha_didi').removeClass('hide_didi')
      sound = new Howl({
         src: [eachChapter.aud],
         preload: true,
         onend: function () {
            $('.asha_didi').addClass('hide_didi')
            // console.log('Sound Over. Didi Hide')
         }
      });
      sound.play();

   }
}

function updateLastEachEndChapterUI(eachChapter) {
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
   <div class="next-screen-button" onclick="openChapter('${eachChapter.mid}')">
        <p class="pick-screen-button-text"> आगामी </p>
      </div>
   <div >
       <img class="asha_didi hide_didi" src="assets/svg/asha_tai.svg" alt="">
   </div>
</center>`;
   var initialStateEachChapterContainer = `<div class="row"><a onclick=openChapter("${eachChapter.mid}")><div class="col-xs-3"><img src="images/back_arrow.png" class="back-button" /></div></a><div class="col-xs-9"><img src="images/NIP Logo Unit.svg" alt="main-logo" class="chapter-screen-logo" /></div></div><hr class="top_bar" />`;
   eachChapterContainer.innerHTML = initialStateEachChapterContainer;
   eachChapterContainer.insertAdjacentHTML('beforeend', eachChapterCard);

   resetModuleContainer.style.display = "none";
   document.getElementById("splash-screen").style.display = "none";
   moduleContainer.style.display = "none";
   document.getElementById("tabs-screen").style.display = "block";
   eachChapterContainer.style.display = "block";

   if (eachChapter.aud != "") {
      $('.asha_didi').removeClass('hide_didi')
      sound = new Howl({
         src: [eachChapter.aud],
         preload: true,
         onend: function () {
            $('.asha_didi').addClass('hide_didi')
            // console.log('Sound Over. Didi Hide')
         }
      });
      sound.play();

   }
}

function clearChapterVisited(mid) {
   var indexMid1 = 'test';
   var userTransaction = db.transaction(["user"], "readwrite");
   var userObjectStore = userTransaction.objectStore("user");
   var userRequest = userObjectStore.get(userId);
   userRequest.onsuccess = function (event) {
      var userData = userRequest.result;
      for (var i = 0; i < userData.moduleVisited.length; i++) {
         if (userData.moduleVisited[i] == mid) {
            indexMid1 = i;
         }
      }
      userData.chapterVisited[indexMid1] = [];

      var userUpdateRequest = userObjectStore.put(userData);
      userUpdateRequest.onsuccess = function (event) {
         openChapter(mid);
         var quesdupTransaction = db.transaction(["duplicate-questions"], "readwrite");
         var quesdupObjectStore = quesdupTransaction.objectStore("duplicate-questions");
         var quesdupRequest = quesdupObjectStore.get(mid);
         quesdupRequest.onsuccess = function (event) {
            var quesTransaction = db.transaction(["questions"], "readwrite");
            var quesObjectStore = quesTransaction.objectStore("questions");
            var quesRequest = quesObjectStore.get(mid);
            quesRequest.onsuccess = function (event) {
               if (quesRequest.result) {
                  var quesUpdateRequest = quesObjectStore.put(quesdupRequest.result);
                  quesUpdateRequest.onsuccess = function (event) {}
               }

            }
         }
      };
   }
}

function insertUserInMongo() {
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

function updateUserInMongo() {
   var userTransaction = db.transaction(["user"], "readwrite");
   var userObjectStore = userTransaction.objectStore("user");
   var userRequest = userObjectStore.get(userId);
   userRequest.onsuccess = function (event) {
      userData = userRequest.result;
      console.log('USER')
      console.log(userData)
      var url = '/api/user/'+userData.id;
      axios.put(url, userData)
      .then(response => response.data)
      .catch(error => console.log(error))
      .then(data => {
         if (data.status == "Success") {
            userId = data.payload._id;
         } else {
            alert('Request Failed')
         }
      })

   }
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
         lastQuestion: [],
         moduleVisited: [],
         chapterVisited: [],
         rewards: [],
      });
   request.onsuccess = function (event) {
      updateProfileUI();
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

function updateProfileUI() {
   open_tab(event, 'book');
   var UI = '';
   var userTransaction = db.transaction(["user"], "readwrite");
   var userObjectStore = userTransaction.objectStore("user");
   var userRequest = userObjectStore.get(userId);
   var moduleIDArray = [];
   userRequest.onsuccess = function (event) {
      userData = userRequest.result;
      var imageArray = '';
      var objectStore = db.transaction("modules").objectStore("modules");
      objectStore.getAll().onsuccess = function (event) {
         var modules = event.target.result;
         for (var i = 0; i < modules.length; i++) {
            moduleIDArray.push(modules[i].id);
         }
         for (var i = 0; i < moduleIDArray.length; i++) {
            if (userData.rewards) {
               if (userData.rewards.includes(moduleIDArray[i])) {
                  imageArray = imageArray + `<div class="col-xs-3"><img src = "../images/color/${moduleIDArray[i]}.png" class="profile-chapter-icons" /> </div>`
               } else {
                  imageArray = imageArray + `<div class="col-xs-3"><img src = "../images/grey/${moduleIDArray[i]}.png" class="profile-chapter-icons" onclick="openChapter('${moduleIDArray[i]}')"></div>`
               }
            }
         }
         if (userData.number) {
            UI = ` <div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><div class="profile-screen"><div class="row"><div class="col-xs-5 profile-padding"><center><img src="images/profile_dummy.svg" alt="Avatar" style="width:100%"></center></div><div class="col-xs-7 profile-padding" style="margin-top: 3%;"><center class="profile-info name"><svg width="11%" height="11%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12C0 18.6 5.4 24 12 24C18.6 24 24 18.6 24 12C24 5.4 18.6 0 12 0ZM12 3.6C14.04 3.6 15.6 5.16 15.6 7.2C15.6 9.24 14.04 10.8 12 10.8C9.96 10.8 8.4 9.24 8.4 7.2C8.4 5.16 9.96 3.6 12 3.6ZM12 20.64C9 20.64 6.36 19.08 4.8 16.8C4.8 14.4 9.6 13.08 12 13.08C14.4 13.08 19.2 14.4 19.2 16.8C17.64 19.08 15 20.64 12 20.64Z" fill="#DD137B" /></svg> &nbsp &nbsp ${userData.name}</center><center class="profile-info phone"><svg width="11%" height="11%" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.99823 8.66726C5.55163 11.7785 8.22154 14.3336 11.3327 16.0018L13.7776 13.5569C14.113 13.2215 14.5543 13.1112 14.8897 13.3363C16.1121 13.782 17.4448 14.0027 18.8879 14.0027C19.5543 14.0027 20 14.4484 20 15.1147V18.8923C20 19.5587 19.5543 20.0044 18.8879 20.0044C8.44219 20 0 11.5534 0 1.11209C0 0.445719 0.445719 0 1.11209 0H5C5.66637 0 6.11209 0.445719 6.11209 1.11209C6.11209 2.44484 6.33274 3.77758 6.77846 5.11033C6.88879 5.44572 6.77846 5.88703 6.55781 6.22242L3.99823 8.66726Z" fill="#0093DD" /></svg> &nbsp &nbsp ${userData.number}</center></div></div><center><p class="pick-screen-heading">आपकी प्रगति</p>
            </center><div class="row">${imageArray}</div><center><p class="pick-screen-heading">आपका पुरस्कार</p></center></div>`;
            profileContainer.innerHTML = UI;
         }
      }
   }

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
   lastActivityTrack();
}, timePeriodInMs);

sound = new Howl({
   src: ['assets/amr/intro.mp3'],
   preload: true,
   onend: function () {
      $('.asha_didi').addClass('hide_didi')
      // console.log('Sound Over. Didi Hide')
   }
});

function lastActivityTrack() {
   document.getElementById("pick-screen").style.display = "none";
   open_tab(event, 'book');
   var initialUserData = '';
   var initialObjectStore = db.transaction("user").objectStore("user");
   initialObjectStore.getAll().onsuccess = function (event) {
      initialUserData = event.target.result;
      if (initialUserData.length > 0) {
         document.getElementById("home_page_content").innerHTML = "" + initialUserData[0].name + " आरबी न्यूट्रिशन इंडिया ऐप में आपका स्वागत है";
         userId = initialUserData[0].id;

         if (initialUserData[0].lastQuestion.length > 0) {
            updateQuestionUI(initialUserData[0].lastQuestion[0]);
         } else if (initialUserData[0].lastModule != '' && initialUserData[0].lastChapter != '') {
            openLastEachChapter(initialUserData[0].lastModule, initialUserData[0].lastChapter)
         } else if (initialUserData[0].lastModule != '' && initialUserData[0].lastChapter == '') {
            openLastChapter(initialUserData[0].lastModule);
         } else {
            readAllModules();
            document.getElementById("splash-screen").style.display = "none";
            document.getElementById("tabs-screen").style.display = "block";
         }
         updateProfileUI();
      } else {
         document.getElementById("splash-screen").style.display = "none";
         document.getElementById("pick-screen").style.display = "block";
      }
   };
}

function select_one(id_select) {
   if (selected == "none") {
      $('.asha_didi').removeClass('hide_didi')

      sound.play()
   }
   if (id_select.id == "c1img") {
      selected = "1"
      user_type = 'pregnancy';
      document.getElementById(id_select.id).src = "../assets/png/pregnantWomanselected.png";
      document.getElementById("c2img").src = "../assets/png/youngMother.png";
   } else {
      selected = '2'
      user_type = 'motherhood';
      document.getElementById("c1img").src = "../assets/png/pregnantWoman.png";
      document.getElementById(id_select.id).src = "../assets/png/youngMotherselected.png";
   }
   document.getElementById("b1").classList.add('clicked');
}

function router_registration() {
   var status = (selected == "none") ? null : 1;
   if (status) {
      loadContentNetworkFirst(user_type);
      document.getElementById("registration-screen").style.display = "block";
      document.getElementById("pick-screen").style.display = "none";
   }
}


function valid_form() {
   var num_user = document.getElementById("num_id").value;
   var name_user = document.getElementById("name_id").value;
   var accept_user = document.getElementById("accept_id").checked;

   if (num_user.length == 10 && name_user.length >= 2 && accept_user == true && !isNaN(num_user)) {
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
      document.getElementById("home_page_content").innerHTML = "" + user_name + " आरबी न्यूट्रिशन इंडिया ऐप में आपका स्वागत है";

      document.getElementById("registration-screen").style.display = "none";
      document.getElementById("tabs-screen").style.display = "block";
   }
}

function open_tab(event, tabName) {

   if (tabName === "home") {
      sound.stop();
      sound = new Howl({
         src: ['images/home_screen.mp3'],
         preload: true
      })
      sound.play();
   }
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
var optionCheck = '';

function optionClicked(id) {
   optionClickedStatus = 1;
   var optionSelected = document.getElementById(id);
   var options = document.getElementsByClassName("options");

   for (var i = 0; i < options.length; i++) {
      options[i].style.backgroundColor = "white";
      options[i].style.color = "black";

   }
   optionSelected.style.backgroundColor = "#0093DD";
   optionSelected.style.color = "white";
   document.getElementById("question_submit").className = 'options-submit-2'
   optionCheck = id;
}

function questionSubmit(rightAnswer, mid) {

   if (optionClickedStatus == 1) {
      var userTransaction = db.transaction(["user"], "readwrite");
      var userObjectStore = userTransaction.objectStore("user");
      var userRequest = userObjectStore.get(userId);

      userRequest.onsuccess = function (event) {
         userRequest.result.lastQuestion = [];
         var userUpdateRequest = userObjectStore.put(userRequest.result);
         userUpdateRequest.onsuccess = function (event) {};
      }
      if (rightAnswer == optionCheck) {
         // Right / Correct Answer Logic

         sound = new Howl({
            src: ['images/CORRECT.mp3'],
            preload: true
         });
         sound.play();
         rightAnswerContainer.innerHTML = `<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><center>
         <p class = "pick-screen-heading"> मुबारक हो आपका उत्तर सही है </p>
         <img src="./images/CORRECT.gif" class="congo-lady"/>
          <div class="next-screen-button" id="b1" onclick="openChapter('${mid}')">
          <p class="pick-screen-button-text"> आगामी </p>
          </div>
          </center>`;
         rightAnswerContainer.style.display = "block";
         questionContainer.style.display = "none";

      } else {
         sound = new Howl({
            src: ['images/WRONG.ogg'],
            preload: true
         });
         sound.play();
         wrongAnswerContainer.innerHTML = `<div><center><img src="images/NIP Logo Unit.svg" alt="main-logo" class="pick-screen-logo" /></center></div><hr class="top_bar" /><center>
         <p class="pick-screen-heading"> शायद आपको ये जानकारी ठीक से समझ नहीं आयी | </p>
          <img src="./images/WRONG.gif" class="congo-lady"/>
          <div class="next-screen-button" id="b1" onclick="clearChapterVisited('${mid}')">
          <p class="pick-screen-button-text"> आइये एक और बार कोशिश करते हैं </p>
          </div>
          </center>`;
         wrongAnswerContainer.style.display = "block";
         questionContainer.style.display = "none";
      }
   }

}