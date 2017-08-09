define([
	'application',
	'knockout',
	'StreamerControlModel',
	'ajaxAdapter',
	'FileViewModel',
	'jssip'], function(
	application,
	ko,
	StreamerControlModel,
	ajaxAdapter,
	FileViewModel,
	JsSIP
){

	"use strict";

	var SIP_AGENT = 'JsSIP';

	window.JsSIP = JsSIP;
	//JsSIP.setDebugLevel("warn");

	JsSIP.instances = JsSIP.instances || {};

	JsSIP.instances = {
		stack: undefined,
		session: undefined
	};

	function showPopup(){
		application.api.popupModule.createPopup({
			templateName : 'popup-enable-media-device',
			onConfirm: function(){ location.reload() },
			onFailure: function(){ application.router.redirectToMainPage() }
		});
	}

	function createSession(target){
		var peerconnection_config = {
			"iceServers": [
				{
					"urls": ["stun:stun.l.google.com:19302"]
				}
			],
			"gatheringTimeout": 2000
		};

		var eventHandlers = {
			'progress':   function(data){ /* Your code here */ },
			'failed':     function(data){
				showPopup()
			},
			'confirmed':  function(data){ /* Your code here */ },
			'ended':      function(data){ /* Your code here */ }
		};

		var configuration = {
			'eventHandlers': eventHandlers,
			pcConfig: peerconnection_config,
			mediaConstraints: { audio: true, video: true },
			extraHeaders: [
				'X-Can-Renegotiate: true'
			],
			rtcOfferConstraints: {
				offerToReceiveAudio: 1,
				offerToReceiveVideo: 1
			}
		};

		return JsSIP.instances.session = JsSIP.instances.stack.call(target, configuration)
	}

	function createAgent(connectionOptions){
		var configuration = {
			authorization_user: "",
			connection_recovery_max_interval: 30,
			connection_recovery_min_interval: 2,
			display_name: connectionOptions.displayName,
			hack_ip_in_contact: false,
			hack_via_tcp: false,
			hack_via_ws: false,
			log: { level: 'debug' },
			no_answer_timeout: 60,
			password: connectionOptions.password,
			register: true,
			register_expires: 600,
			registrar_server: "",
			session_timers: false,
			uri: 'sip:'+connectionOptions.username+'@'+connectionOptions.realm,
			use_preloaded_route: false,
			ws_servers: connectionOptions.proxy
		};

		return new JsSIP.UA(configuration);
	}

	return function PlayerModel(event) {
		var self = this;

		this.mainButton = ko.observable();
		this.role = ko.observable('participant');
		this.event = event;
		this.status = ko.observable('webinar');
		this.fullscreen = ko.observable(false);
		this.connectionOptions = undefined;
		this.buttonRole = ko.observable();//'default'
		this.buttonMic = ko.observable();//todo //'enable'
		this.streamerControlModel = ko.observable(new StreamerControlModel());


		/**
		 * @public API
		 * */
		this.hangup = function (){
			// Terminate the current session regardless its direction or state.
			if (JsSIP.instances.session && !JsSIP.instances.session.isEnded()){
				JsSIP.instances.session.terminate();
			}
			// disconnects from the WebSocket server
			if (JsSIP.instances.stack){
				if (JsSIP.instances.stack.isRegistered()){
					JsSIP.instances.stack.unregister();
				}
				if (JsSIP.instances.stack.isConnected()){
					JsSIP.instances.stack.stop();
				}
			}
			JsSIP.instances.session = null;
			JsSIP.instances.stack = null;
		};

		/**
		 * @public API
		 * @this {PlayerModel}
		 * */
		this.call = function () {
			var that = this;

			ajaxAdapter.getRequestRestApi("/webinar/" + self.event.event_id() + "/connectInfo", afterReceivingData);

			function afterReceivingData ( data ) {
				that.connectionOptions = data.result;
				console.log(that.connectionOptions);
				application.$body.subscribeToChannel(that.connectionOptions.channel, afterSubscriptionToChat);// todo отписку от канала
			}

			function afterSubscriptionToChat(){
				if (!JsSIP.instances.stack){
					JsSIP.instances.stack = createAgent(that.connectionOptions);
				}
				JsSIP.instances.stack.on('registered', onStartedHandlerSIP);
				JsSIP.instances.stack.start();
			}

			function onStartedHandlerSIP(){
				var session = createSession(that.connectionOptions.number);

				session.on('addstream', function(e){
					var remoteView = document.getElementById('video-remote');
					var remoteStream = e.stream;
					remoteView.src = window.URL.createObjectURL(remoteStream);
					remoteView = JsSIP.rtcninja.attachMediaStream(remoteView, remoteStream);
				});

				session.on('accepted', function(e){
					//Attach the streams to the views if it exists.
					if (session.connection.getLocalStreams().length > 0) {
						session.connection.addStream(session.connection.getLocalStreams()[0]);
					}
				});

				session.on('failed', function(){

					if (JsSIP.C.causes.USER_DENIED_MEDIA_ACCESS === arguments[0].cause){

						showPopup();

					}
					that.hangup();
				});

				session.on('ended', function(e){
					that.hangup();
				});
			}
		};

		/**
		 * @public API
		 * */
		this.toggleFullScreen = function (element) {
			var element = document.getElementById('fullScrintoggle');
			
			if((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
				if(document.cancelFullScreen) {
					document.cancelFullScreen();
				} else if(document.mozCancelFullScreen) {
					document.mozCancelFullScreen();
				} else if(document.webkitCancelFullScreen) {
					document.webkitCancelFullScreen();
				}
				element.className = "";
			} else {
				if (element.requestFullScreen) {
					element.requestFullScreen();
				} else if (element.webkitRequestFullScreen) {
					element.webkitRequestFullScreen();
				} else if (element.mozRequestFullScreen) {
					element.mozRequestFullScreen();
				} else if (element.msRequestFullScreen) {
					element.msRequestFullScreen();
				}
				element.className = "fullScreen";
			}
		};

		/**
		 * handler for eventSource event Play
		 * @this {PlayerModel}
		 * */
		this.onEventStreamPlay = function(data){
			var that = this, params, fileModel;

			fileModel = new FileViewModel();

			fileModel.fetch({
				id : data.file_id,
				ownerId : application.root().currentUser().id(),
				callback: function () {

					params = {
						event_id : parseInt(that.event.event_id(), 10),
						file_id: parseInt(data.file_id, 10),
						pageCount: parseInt(data.options.pageCount, 10),
						position: parseInt(data.options.position, 10),
						fileModel : fileModel,
						type: data.options.type,
						statusMedia: 'MEDIA_PLAYING'
					};

					that.streamerControlModel().setParams(params);
				}
			});
		};

		/**
		 * @this {PlayerModel}
		 * @param {FileModel} fileModel
		 * */
		this.onStopFileButtonClick = function(fileModel){
			if (this.streamerControlModel()){
				this.streamerControlModel().destroy();
				application.root().uiEvent().closeLibrary(); //TODO кинуть событие чтоли
			}
		};
		/**
		 * @this {PlayerModel}
		 * @param {FileModel} fileModel
		 * */
		this.onStartFileButtonClick = function(fileModel){
			var that = this;

			if (this.streamerControlModel()){
				that.streamerControlModel().file_id(fileModel.id());
				that.streamerControlModel().event_id(that.event.event_id());
				var xhr = this.streamerControlModel().startStream();
				xhr.done(function(){
					that.streamerControlModel().statusMedia('MEDIA_RESOLVING');
					application.root().uiEvent().closeLibrary(); //TODO кинуть событие чтоли
				});

			}
		};
		/**
		 * handler for eventSource event Pause
		 * @this {PlayerModel}
		 * */
		this.onEventStreamPause = function(){
//			if (this.streamerControlModel()){
//				this.streamerControlModel().pauseStream();
//			}
		};
		/**
		 * handler for eventSource event Stop
		 * @this {PlayerModel}
		 * */
		this.onEventStreamStop = function(){
			if (this.streamerControlModel()){
				this.streamerControlModel().destroyOnlyInterface();
			}
		};

		this.onClickDisableVote = function () {
			application.api.popupModule.createPopup({
				templateName : 'popup-webinar-disable-vote',
				onConfirm: function(){
					application.root().uiEvent().event().disableVote();
				}
			})
		}
	}
});
