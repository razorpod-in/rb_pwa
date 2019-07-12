  // Global variables
  var user_type = '';
  var selected = "none"
  var timePeriodInMs = 2000;
  var user_info_status = 0;
  var user_name = '';
  var user_number = '';

  // Functions 
  setTimeout(function () {
      if (1 == 1) {
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("pick-screen").style.display = "block";
        // document.getElementById("splash-screen").style.display = "none";
        // document.getElementById("tabs-screen").style.display = "block";
      } else {
        document.getElementById("splash-screen").style.display = "none";
        document.getElementById("pick-screen").style.display = "block";
      }

    },
    timePeriodInMs);

  var sound = new Howl({
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
    if (num_user.length == 10 && name_user.length >= 4) {
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