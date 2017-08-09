define([
	'knockout',
	'text!components/pages/webinar-view-page/webinar-view-page.html',
	'application',
	'ajaxAdapter',
	'WebinarModel',
], function (
	ko,
	template,
	application,
	ajaxAdapter,
	WebinarModel
) {

	"use strict";

	function buttonEventHandler(event, params) {
		var component = params.component,
			command = params.command,
			data = params.data,
			eventModel = application.root().eventModel();

		switch(component) {
			case 'system':
				switch (command) {
					case 'start':
						if (eventModel.event_id() == data.event_id) {
							eventModel.locationToWebinar();
						}
						break;
				}
				break;
		}
	}

	function onEventSourceSubscribersUpdate(event, data){
		if (!application.root().eventModel()) return;

		if (application.root().eventModel() && data && data.webinar_id && data.subscriber){
			if (application.root().eventModel().event_id() === data.webinar_id){
				application.root().eventModel().participantsCollection().updateParticipant(data.subscriber);
			}
		} else {
			throw Error('params not found from eventSource')
		}
	}

	function Component(params) {
		this.afterRender(params.route().id);
	}

	Component.prototype = {
		constructor: Component,


		afterRender: function(event_id){

			var eventModel = new WebinarModel();

			application.root().eventModel(eventModel);

			function _reloadButton() {
				eventModel.buttons.removeAll();

				if (eventModel.author().id() !== application.root().currentUser().id()) {

					var curUser = eventModel.participantsCollection().userExist(application.root().currentUser().id());

					if (curUser == false) {
						if (!eventModel.is_public()) {
							// Button OFF
							switch (eventModel.status()) {
								case "ONLINE":  // В эфире
									// Timer OFF
									break;
								case "CLOSED": // Завершен
								case "CANCELED": // Отменен
									// Timer OFF
									break;

								case "PLANNED": // Запланирован
									// Timer ON
									break;
							}
						} else {
							switch (eventModel.status()) {
								case "ONLINE":  // В эфире
									// Timer OFF
									eventModel.buttons.push('invite');
									// Присоединится
									break;

								case "CLOSED": // Завершен
								case "CANCELED": // Отменен
									// Timer OFF
									// Button OFF
									eventModel.buttons.removeAll();
									break;

								case "PLANNED": // Запланирован
									// Timer ON
									eventModel.buttons.push('join');
									// Участвовать
									break;
							}
						}
					} else if (curUser.status() != 'BANNED') {
						if (curUser.confirmed() == 0) {
							switch (eventModel.status()) {
								case "ONLINE": // В эфире
									// Timer OFF
									eventModel.buttons.push('invite');
									eventModel.buttons.push('reject');
									// Присоединится
									// Отказаться
									break;
								case "CLOSED": // Завершен
								case "CANCELED": // Отменен
									eventModel.buttons.removeAll();
									// Timer OFF
									// Button OFF
									break;

								case "PLANNED": // Запланирован
									// Timer ON
									eventModel.buttons.push('join');
									eventModel.buttons.push('reject');
									// Участвовать
									// Отказаться
									break;
							}
						} else if (curUser.confirmed() == 2) {
							switch (eventModel.status()) {
								case "ONLINE": // В эфире
								case "CLOSED": // Завершен
								case "CANCELED": // Отменен
									eventModel.buttons.removeAll();
									// Timer OFF
									// Button OFF
									break;

								case "PLANNED":
									if (eventModel.is_public()) {
										eventModel.buttons.push('join');
									}
									// Timer ON
									// Отказаться
									break;
							}
						} else {
							switch (eventModel.status()) {
								case "ONLINE": // В эфире
									// Timer OFF
									// Присоединится
									eventModel.buttons.push('invite');
									break;
								case "CLOSED": // Завершен
								case "CANCELED": // Отменен
									eventModel.buttons.removeAll();
									// Timer OFF
									// Button OFF
									break;

								case "PLANNED":
									eventModel.buttons.push('reject');
									// Timer ON
									// Отказаться
									break;
							}
						}
					}
				} else {
					switch (eventModel.status()) {
						case "ONLINE": // В эфире
							// Timer OFF
							eventModel.buttons.push('done');
							eventModel.buttons.push('invite');
							// Завершить
							// Присоединится
							break;
						case "CLOSED": // Завершен
						case "CANCELED": // Отменен
							// Timer OFF
							// Button OFF
							eventModel.buttons.removeAll();
							break;

						case "PLANNED": // Запланирован
							// Timer ON
							// Отменить
							// Редактировать
							eventModel.buttons.push('cancel');
							eventModel.buttons.push('edit');
							break;
					}
				}
			}

			application.root().currentUser().onLoad(function () {
				eventModel.load(event_id, function  () {

					eventModel.participantsCollection().id = event_id;//todo
					eventModel.participantsCollection().fetch({
						setGETParameters: {
							inviteLevel: 3
						},
						callback: function(){
							eventModel.status.subscribe(_reloadButton);
							_reloadButton();
						}
					});


					function onOpenFilesTab(){
						application.root().eventModel().reloadFilelist();
					}

					if (eventModel.status() === "CLOSED"){
						application.$document.on('tabShow', '#filesWebinarTab', onOpenFilesTab);
					}

					var timerCallback = function(currentStatus) {
						if (currentStatus == 'PLANNED') {
							var timer,
								seconds,
								presentation,
								SECONDS_DAY = 60 * 60 * 24,
								fullDays,
								remainingTime;

							timer = setInterval(function() {
								seconds = eventModel.startTimestamp() - Math.round(Date.now()/1000);

								if (seconds <= 0) {
									eventModel.status('ONLINE');
									clearInterval(timer);
								}

								if (seconds > SECONDS_DAY){
									fullDays = Math.floor(seconds/SECONDS_DAY);
									remainingTime = (seconds - SECONDS_DAY * fullDays);
									presentation = fullDays + application.translation.daysPresent + ' ' + eventModel.convertCountOfSecondsToHHMMSSFn(remainingTime);
								}

								if (seconds < SECONDS_DAY){
									presentation = eventModel.convertCountOfSecondsToHHMMSSFn(seconds);
								}

								eventModel.finalCountdown( presentation );
							}, 1000);
						}
					};

					timerCallback(eventModel.status());
					eventModel.status.subscribe(timerCallback);
					application.$body.eventRegister('ui_component', buttonEventHandler);
					application.$body.eventRegister('event_subscriber_update', onEventSourceSubscribersUpdate);

				});
			});
		},

		dispose: function(){
			application.$body.eventUnRegister('ui_component', buttonEventHandler);
			application.$body.eventRegister('event_subscriber_update', onEventSourceSubscribersUpdate);
			application.$document.off('tabShow', '#filesWebinarTab');
			application.root().colleagues('');
			application.root().eventModel('');
		}
	};

	return { viewModel: Component, template: template }
});