define([
	'application',
	'ajaxAdapter'
], function(
	application,
	ajaxAdapter
){

	"use strict";

	var userStatus = "online";
	var offlineTimer;

	return {
		userOnlineCheck : function (controllerPr, actionPr) {
			var timeInverval15min = 900000; // 15 min

			function userGoOffline() {
				if (userStatus == "online") {
					ajaxAdapter.requestRestApi('/user/' + application.root().currentUser().id()+'/online', 'PUT', {'status':'offline', 'controller': controllerPr, 'action': actionPr});
				}
				userStatus = "offline";
			}

			window.onblur = function () {
				clearTimeout(offlineTimer);
                offlineTimer = setTimeout(userGoOffline, 3000);
			}

            window.onbeforeunload = function() {
                userGoOffline();
            }

			window.onfocus = function () {
                clearTimeout(offlineTimer);
				if (userStatus == "offline") {
					ajaxAdapter.requestRestApi('/user/' + application.root().currentUser().id()+'/online', 'PUT', {'status':'online', 'controller': controllerPr, 'action': actionPr});
				}
				userStatus = "online";
			}

			offlineTimer = setTimeout(userGoOffline, timeInverval15min);

			$("html").on("mousemove mouseup keyup", function() {
				clearTimeout(offlineTimer);
				if (userStatus == "offline") {
					ajaxAdapter.requestRestApi('/user/'+ application.root().currentUser().id()+'/online', 'PUT', {'status':'online', 'controller': controllerPr, 'action': actionPr});
				}
				userStatus = "online";
				offlineTimer = setTimeout(userGoOffline, timeInverval15min);
			});

			ajaxAdapter.requestRestApi('/user/' + application.root().currentUser().id()+'/online', 'PUT', {'status':'online', 'controller': controllerPr, 'action': actionPr});
		},
		destroyInstance: function(){
			//alert(1);
			window.onblur = undefined;
			window.onbeforeunload = undefined;
			window.onfocus = undefined;
			$("html").off();
		}
	}
});