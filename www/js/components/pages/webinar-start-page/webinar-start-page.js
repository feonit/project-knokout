define([
	'knockout',
	'text!components/pages/webinar-start-page/webinar-start-page.html',
	'application',
	'router',
	'ajaxAdapter',
	'uiEventModel',
	'webinarTimeline',
	'PlayerModel',
	'MessagesCollection',

	'FileAPI',
	'WebinarModel',
	'video',
	'webinarTimeline'
], function (
	ko,
	template,
	application,
	router,
	ajaxAdapter,
	uiEventModel,
	webinarTimeline,
	PlayerModel,
	MessagesCollection
) {


	"use strict";

	/**
	 * function callback
	 * */
	function onEventSourceUiComponent(event, params) {
		var component = params.component,
			command = params.command,
			data = params.data;
		switch(component) {
			case 'system':
				switch (command) {
					case 'role':
						application.root().uiEvent().accessLevel(data.name);
						break;
					case 'state':
						application.root().uiEvent().layer(data.name);
						break;

					case 'hangup':
						if (application.root().uiEvent().event().event_id() == data.event_id) {
							application.root().uiEvent().player().hangup();
							window.location = "/";
						}
						break;
				}
				break;
			case 'subscribersList':
				switch (command) {
					case 'reload':
						application.root().uiEvent().fetchParticipantsCollection();
						break;
				}
				break;

			case 'player':
				switch (command) {
					case 'button':
						application.root().uiEvent().player().mainButton(data.state);

						if (application.root().uiEvent().accessLevel() === 'KING'){
							switch (data.state){
								case 'enable': application.root().uiEvent().player().buttonRole('enable'); break;
								case 'pressed': application.root().uiEvent().player().buttonRole('pressed'); break;
								case 'default': application.root().uiEvent().player().buttonRole('default'); break;
							}
						} else {
							switch (data.state){
								case 'enable': application.root().uiEvent().player().buttonRole('enable'); break;
								case 'pressed': application.root().uiEvent().player().buttonRole('pressed'); break;
							}
						}

						break;
					case 'mic':
						if (data.enable === '1') application.root().uiEvent().player().buttonMic('enable');
						if (data.enable === '0') application.root().uiEvent().player().buttonMic('disable');
						break;
					case 'overlay':
						if (data.status) {
							ownerLeave(data.text);
						} else {
							ownerBack();
						}
						break;

					case 'stream':
						switch (data.status) {
							case 'play': application.root().uiEvent().player().onEventStreamPlay(data);break;
							case 'stop': application.root().uiEvent().player().onEventStreamStop();break;
							case 'pause': application.root().uiEvent().player().onEventStreamPause();break;
						}
						break;
				}
				break;
		}
	}

	/**
	 * helpers
	 * */
	function ownerLeave(text) {
		ownerBack();
		$(".warning_message").show(300);
		$(".warning_note_block").html(text);
	}
	/**
	 * helpers
	 * */
	function ownerBack() {
		$(".warning_message").hide(300);
	}

	function onEventSourceSubscribersUpdate(event, data){
		if (application.root().uiEvent() && application.root().uiEvent().event()){
			if (data && data.webinar_id && data.subscriber){
				if (application.root().uiEvent().event().event_id() === data.webinar_id){
					application.root().uiEvent().event().participantsCollection().updateParticipant(data.subscriber);
				}
			} else {
				throw Error('params not found from eventSource')
			}
		}
	}

	/**
	 * update timeLine at pleer
	 * */
	function onResizeHandler(){
		if (onResizeHandler.processing) return;

		onResizeHandler.processing = true;

		setTimeout(function(){
			var $el = $(".time_line_webinar");

			if (!$el.length || !webinarTimeline.options) return;

			$el.updateTimeline(
				webinarTimeline.options.timeMaxGL,
				webinarTimeline.options.timeOffsetGL,
				webinarTimeline.options.loudArrayGL,
				webinarTimeline.options.ownerWebGL
			);
			onResizeHandler.processing = false;
		}, 300);

	}

	function onScrollLazyFetchChat(){
		application.root().uiEvent().chat().lazyFetch();
	}

	function onScrollLazyFetchFiles(){
	}

	function Component(params) {
		this.afterRender(params.route().webinarId);

		this.indexOfOpenedTab = ko.observable();
	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(event_id){
			var app = application.root();

			var uiEvent = new uiEventModel({
					event_id : event_id
				}),
				id = application.root().currentUser().id();

			app.uiEvent(uiEvent);
			app.currentUser().onLoad(function (user) {
				app.uiEvent().event().participantsCollection().id = event_id;// todo need ref eventmodel create
				app.uiEvent().event().load(event_id, function() {

					if (app.uiEvent().event().status() !== 'ONLINE'){
						router.redirectToWebinarViewPage(app.uiEvent().event().event_id());
						return;
					}

					var player = new PlayerModel(app.uiEvent().event());

					app.uiEvent().player(player);
					player.call();
					ajaxAdapter.requestRestApi("/webinar/" + app.uiEvent().event().event_id()+"/chat", "POST", {}, function( data ) {

						app.uiEvent().chat(new MessagesCollection({
							id: data.result,
							typeView: 'side_bar_chat'
						}));

						app.uiEvent().chat().lazyFetch();
					});

					app.uiEvent().event().loadTimelineParams(function(data){
						$(".time_line_webinar").webinarTimeline(
							app.uiEvent().event().duration(),
							app.uiEvent().event().offset(),
							data,
							(app.uiEvent().event().author().id() == app.currentUser().id())
						);
					});
				});

				app.uiEvent().accessLevel.subscribe(function (value) {
					app.uiEvent().player().role(value);
					app.uiEvent().player().mainButton('');
				})
			});

			application.mediator.subscribe('page_scrolled_top', onScrollLazyFetchChat);
			application.$body.eventRegister('ui_component', onEventSourceUiComponent);
			application.$body.eventRegister('event_subscriber_update', onEventSourceSubscribersUpdate);
			application.mediator.subscribe('page_scrolled_bottom', onScrollLazyFetchFiles);

			application.$window.on('resize', onResizeHandler);

			var that = this;
			application.$document.on('tabShow', '#participantsTab', function _handler(){
				that.indexOfOpenedTab(0);
			});

			application.$document.on('tabShow', '#inviteTab', function _handler(){
				that.indexOfOpenedTab(1);
			});

			application.$document.on('tabShow', '#userSourceTab', function _handler(){
				application.mediator.inQueue('componentTabParticipantsFromUsers', 'reset:participants:invite');
			});

			application.$document.on('tabShow', '#maximusSourceTab', function _handler(){
				application.mediator.inQueue('componentTabParticipantsFromMaximus', 'command:reset:maximus');
			});
		},

		dispose: function(){
			application.$document.off();
			application.root().uiEvent('');
			application.$body.eventUnRegister('ui_component', onEventSourceUiComponent);
			application.$body.eventRegister('event_subscriber_update', onEventSourceSubscribersUpdate);
			application.$window.off('resize', onResizeHandler);
			application.mediator.unsubscribe('page_scrolled_top');
			application.mediator.unsubscribe('page_scrolled_bottom');
		}
	};

	return { viewModel: Component, template: template }
});