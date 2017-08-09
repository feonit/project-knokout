define(['jquery'], function($){

	"use strict";

	var buss = $('body');

	var register = {};

	window.eventSourceRegister = register;

	$.fn.eventRegister = function(events, callback) {
		if (typeof events === "object"){
			for (var key in events){
				buss.on(key, events[key]);
			}
		} else {
			buss.on(events, callback);
		}
	};

	$.fn.eventUnRegister = function(events, callback) {
		if (typeof events === "object"){
			for (var key in events){
				buss.off(key, events[key]);
			}
		} else {
			buss.off(events, callback);
		}
	};

	$.fn.subscribeToChannel = function(url, callback) {

		if (register[url]){
			return;
		}

		var eventSource = new EventSource(url);

		register[url] = eventSource;

		eventSource.onopen = function(e) {
			callback && callback();
		};

		eventSource.onerror = function(e) {
			if (this.readyState == EventSource.CONNECTING) {
				console.log("Соединение порвалось, пересоединяемся...");
			} else {
				console.log("Ошибка, состояние: " + this.readyState);
			}
		};

		eventSource.onmessage = function( e ) {
			var json = JSON.parse(e.data),
				json_eventName = json.event,
				event_params_obj = json.text,
				key;

			console.log('EventSource:', '\"'+json_eventName+'\"', event_params_obj);
			buss.trigger(json_eventName, event_params_obj);
		}
	};

	$.fn.unsubscribeFromChannel = function(url){
		if (!register[url]){
			return;
		}
		register[url].close();
		delete register[url];
	}
});