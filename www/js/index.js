var username = null;

function updateInfoFromStorage() {
	var name = localStorage.getItem("name");
	if(name.length)
		$('#namenavi').text(name + "'s Navigator");
	else
		$('#namenavi').text("My Navigator");
	var img = localStorage.getItem("pic");
	if(img.length) {
		$('#logo').attr("src", img);
		$('#mymarkericon').css('background-image', 'url(' + img + ')');
	}
}

function showLoginDialog(callback) {
	$.UIPopup({ selector: "#main",
				id: "welcome",
				title: 'Welcome!',
				message: '<input style="width: 300px;" id="initiallogin" src="img/fblogin.png" alt="Login" type="image">' +
						 '<div style="text-align: center;font-size: 40px;margin-bottom: 25px;">' +
						 'or' + 
						 '</div>' +
						 '<input style="width: 100%; text-align: center;font-size: 35px;" id="username" placeholder="Enter your name" type="text">',
				continueButton: 'Done',
				callback: function() {
					// save username and pic
					localStorage.setItem("name", username);
					localStorage.setItem("pic", "img/avatar.jpg");
					localStorage.setItem("facebook", false);
					callback();
				}
	});
	// workaround to get the username
	$("#username").keyup(function() {
		username = $(this).val();
	}).keyup();
  
	$("#initiallogin").click(function(){ 
		facebookConnectPlugin.login(["public_profile"], function() {
			localStorage.setItem("facebook", true);
			facebookConnectPlugin.api("/me?fields=picture,name", ["public_profile"], function(data){
				localStorage.setItem("name", data.name);
				localStorage.setItem("pic", data.picture.data.url);
				callback();
				getEvents();
			}, function(error) {
				window.console.log( "" + error);
				localStorage.setItem("name", "");
				localStorage.setItem("pic", "img/avatar.jpg");
				localStorage.setItem("name", data.name);
				callback();
				getEvents();
			});
		}, function(error) { 
			alert(error); 
			showLoginDialog(callback); 
		});
		$('#welcome').UIPopupClose();
	});
}

function showSlideOut() {
	$.UISlideout();
	$.UISlideout.populate([{myhsl:'My HSL'},{navigate:'Navigate to location'},{events:"My Events"},{settings:'Settings'},{contacts:'My Contacts'}, {notifications:'My Notifications'}]);
}

function onPageLoad() {
	localStorage.clear();
	// first time use?
	// show login dialog
	// on done -> set and save name and pic, show slideout
	// else if facebooklogin:
	//  check status if not -> relogin
	// set name and pic, show slideout
	if(!localStorage.getItem("initialized")) {
		showLoginDialog(function(){
			localStorage.setItem("initialized", true);
			updateInfoFromStorage();
		});
	} else {
		if(localStorage.getItem("facebook")) {
			facebookConnectPlugin.getLoginStatus(function(response){
				if(response.status !== 'connected') {
					facebookConnectPlugin.login(["public_profile"], getEvents, function(error) { 
						window.console.log( "" + error);
					});
				} else {
					getEvents();
				}
			}, function(){
				facebookConnectPlugin.login(["public_profile"], getEvents, function(error) { 
					window.console.log( "" + error);
				});
			});
		}
		updateInfoFromStorage();
		var noti = localStorage.getItem("notifications");
		if(noti) {
			notifications = JSON.parse(noti);
		}
		updateNotifications();
	}
}

// cordova hack for browser
if (window.cordova.platformId == "browser")
	$(function(){
		showSlideOut();
		setTimeout(function(){
			facebookConnectPlugin.browserInit("768653219896880", "v2.3");
			onPageLoad();
	   }, 1000);
	});
else {
	$(function(){
		showSlideOut();
		onPageLoad();
	});
}

document.addEventListener("deviceready", function() {
	document.addEventListener("pause",  function(){
		// save state:
		localStorage.setItem("lastvisibleevent", $('#notifyme').data("event"));
		
	});
	document.addEventListener("resume", function(){
		// load state:
		$('#notifyme').prop('checked', localStorage.getItem('lastvisibleevent'));
		var noti = localStorage.getItem("notifications");
		if(noti) {
			notifications = JSON.parse(noti);
		}
	});
	document.addEventListener("menubutton", function(){
		if($('.slide-out').hasClass('open')) {
			$('.slide-out').removeClass('open');
		} else {
			$('.slide-out').addClass('open');
		}
	});
	document.addEventListener("backbutton", function(){
		if($('#mappage').hasClass('show')) {
			$('#mappage').removeClass('show');
			$('#events').addClass('show');
		}
	});
});

