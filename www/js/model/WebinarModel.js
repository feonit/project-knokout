define([
		'application',
		'router',
		'knockout',
		'ParticipantsCollection',
		'ajaxAdapter',
		'UserModel',
		'FileViewModel',
		'TimeModel',
		'knockout.validation'
	],
	function(
		application,
		router,
		ko,
		ParticipantsCollection,
		ajaxAdapter,
		UserModel,
		FileViewModel,
		TimeModel
	){

	"use strict";

	var WebinarModel = function (data) {

		var self = this;

		this.search_type = ko.observable();

		this.archive_movie_state = ko.observable(null);
		this.author = ko.observable('');
		this.buttons = ko.observableArray([]);
		this.description = ko.observable('');
		this.editMode = ko.observable('');
		this.enableRecord = ko.observable(true);
		this.event_id = ko.observable(0);
		this.fileList = ko.observableArray();
		this.finalCountdown = ko.observable("00:00:00");
		this.is_public = ko.observable(true);
		this.isAuthor = ko.observable(false);
		this.isCreateProcess = ko.observable(false);
		this.isExpress = ko.observable(false);
		this.promo_audio_file = ko.observable("");
		this.promo_file = ko.observable("");
		this.russian_date = ko.observable('');//todo delete
		this.russian_duration = ko.observable(''); //todo delete
		this.russian_endTime = ko.observable('');//todo delete
		this.russian_startTime = ko.observable('');//todo delete
		this.startTimestamp = ko.observable('');
		this.status = ko.observable('');
		this.test = ko.observable(false);
		this.timeline = ko.observableArray();

		this.participantsCollection = ko.observable(new ParticipantsCollection({id: this.event_id()}));

		this.currentUserIsParticipantOrAuthor = ko.computed(function(){
			if (this.author() && this.participantsCollection()){
				var idAuthor = this.author().id();
				var idCurrent = application.root().currentUser().id();

				return (idAuthor == idCurrent) || this.participantsCollection().models().some(function(participant){
					return participant.user().id() == idCurrent;
				});

			} else {
				return false;
			}
		}, this);

		this.webinar_static_id = ko.observable();

		this.loaded = ko.observable(false);

		this.currentUserIsKing = ko.computed(function(){
			if (application.root().currentUser()){
				var arrayOfUsers = this.participantsCollection().models();

				if (!arrayOfUsers || !arrayOfUsers.length) return;

				var findCurrentUser = ko.utils.arrayFirst(arrayOfUsers, function(participant){
					return participant.user().id() === application.root().currentUser().id();
				});

				return !!findCurrentUser && findCurrentUser.role() === 'KING';
			}
		}, this);

		this.sourceRecord = ko.computed(function(){
			return ajaxAdapter.getStaticUrlBaseUrl("/file/webinar/" + this.webinar_static_id() + ".webm");
		}, this);

		this.startTime = ko.observable().extend({ // unix format with out milliseconds
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});

		this.endTime = ko.observable().extend({ // unix format with out milliseconds
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});

		this.started = ko.computed(function(){
			return this.status() === "ONLINE";
		}, this);


		this.reloadTimeLine = function () {
			var that = this;

			that.loadTimelineParams(function(data){
				var key, value, time;

				that.timeline.removeAll();

				if (data.length){
					data.forEach(function(value){
						time = new TimeModel(Math.round(value.time), that);
						time.message(value.message);
						that.timeline.push(time);

						$(time.time.domElement()).mask("99:99");
						// 2
						that._initDragbleTimeLIne();
					});
				}
			});
		};

		this.loadTimelineParams = function(callback){
			ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/timeline', 'GET', {}, function (res) {
				var data = res.result;
				callback(data);
			});
		};

		this.title = ko.observable("").extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					},

					{
						type: "length",
						length: 84,
						message: application.translation.nameIsTooLong
					}
				]
			}
		});

		function _createCustomDate(){
			var now = new Date();
			var day = ("0" + (new Date()).getDate()).slice(-2);
			var month = ("0" + ((new Date()).getMonth() + 1)).slice(-2);
			var customDate = now.getFullYear() + "-" + month + "-" + day;
			return customDate;
		}

		this.createDate = ko.observable(_createCustomDate()).extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});

		this.formattedCreateDate = ko.computed(function() {
	        var dateArray = self.createDate().split('-');
	        var date = new Date(dateArray[0],(Math.round(dateArray[1])-1),dateArray[2]);
	        return  ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' +  date.getFullYear();
	    });

		this.load = function (id, callback) {
			var that = this;

			ajaxAdapter.getRequestRestApi("/webinar/"+id, function( res ) {
				that._setAdaptedData(res.result);
				that.isAuthor(that.author().id() == application.root().currentUser().id());
				callback && callback(that);
				that.loaded(true);
			});
		};

		this._setAdaptedData = function(data){
			//this parameter is crashed for computed property
			//delete data.duration;
			data.isExpress = data.is_express;
			data.enableRecord = data.record;
			data.startTimestamp = data.startTime;
			data.endTime = this.convertHHMMtoCountOfMinutesFn(data.russian_endTime);
			data.startTime = this.convertHHMMtoCountOfMinutesFn(data.russian_startTime);
			ko.mapping.fromJS(data, {}, this);
			this.duration(Math.abs(this.endTime() - this.startTime()));
		};

		this.duration = ko.observable().extend({
			validate: {
				deferredMode: true, // Если TRUE, то отображать ошибки только в случаи вызова чек функции
				rules: [
					{
						type: "required",
						message: application.translation.fieldIsEmpty
					}
				]
			}
		});

		this._initDragbleTimeLIne = function(){
			var that = this;

			$(".time_line_field").dragble((656/that.duration()), function (obj, min) {
				var index = $(obj).attr('data-index');
				that.timeline()[index].time(min);
				that.timeline.sort(function(left, right) {
					return left.time() == right.time() ? 0 : (left.time() < right.time() ? -1 : 1)
				});
			});
		};

		this.joinAndRedirectToWebinar = function(){
			var that = this;
			this.join(function(){
				application.router.redirect(that.getHrefToWebinar());
			});
		};

		this.locationToWebinar = function () {
			var that = this;
			this.join(function() {
				window.location = that.getHrefToWebinar();
			});
		};

		this.getHrefToWebinar = function () {
			return '/webinar/start/'+self.event_id();
		};

		this.maxElementOffset = function (checkError) {
			var hasError = false;
			var maxTimePosition = 0, i;

			for (i in self.timeline()) {
				if (
					checkError == true &&
						(
							!self.timeline()[i].message.check()
								||
								!self.timeline()[i].time.check()
							)
					) {
					hasError = true;
				}
				if (hasError == false && self.timeline()[i].time() > maxTimePosition) {
					maxTimePosition = self.timeline()[i].time();
				}
			}
			return !hasError?maxTimePosition:false;
		};

		this.addTimeline = function () {
			if (self.timeline().length >= 10) { return; }

			var maxElementOffset = self.maxElementOffset(true);
			if (maxElementOffset !== false) {
				var elementOffset = maxElementOffset+(self.duration()/100*10);
				if ((maxElementOffset+(self.duration()/100*20)) <= self.duration()) {
					var currentTime = self.timeline().length > 0 ? parseInt(elementOffset, 10) : 0;
					var model = new TimeModel( currentTime, self);
					self.timeline.push(model);
					$(model.time.domElement()).mask("99:99");
					// 3
					self._initDragbleTimeLIne();
				} else {
					return;
				}
			}
			application.mediator.trigger('PAGES_FRAME', 'scroll:down');
		};

		this.removeTimeline = function (item) {
			self.timeline.remove(item);
		};

		this.doFinishConfirm = function(){
			this.finish(function() {
				application.router.redirectToGeneralPage();
			});
		};

		this.getHrefToEdit = function () {
			return '/webinar/edit/'+self.event_id();
		};

		//this.doUserCancel = function(){
		//	this.inviteCancel(window.location.reload.bind(window.location))
		//};

		this.banCondidate = ko.observable('');


		this.recreateWeibinar = function(){
			application.router.redirectToCreateWebinarPage(this.event_id());
		};
		/**
		 * POPUP
		 * */
		this.openPreview = function () {
			var isValid = this.validate();

			if (isValid) {
				application.api.popupModule.createPopup({
					templateName : 'popup-webinar-create-template'
				});
			} else {
				application.api.tabs.findBySelector('#event_create_tabs').reRenderTabs();
			}
		};
		/**
		 * POPUP
		 * */
		this.showPopupWithCancelConfirm = function (callback) {
			application.api.popupModule.createPopup({
				templateName : 'popup-webinar-start-cancel',
				onConfirm: callback
			});
		};
		/**
		 * POPUP
		 * */
		this.finishConfirm = function () {
			application.api.popupModule.createPopup({
				templateName : 'popup-webinar-finish-template'
			});
		};
		/**
		 * POPUP
		 * */
		this.userCancel = function (callback) {
			application.api.popupModule.createPopup({
				templateName : 'popup-webinar_user_cancel',
				onConfirm: (function(){
					this.inviteCancel(window.location.reload.bind(window.location)); // для перезагрузки страницы описания вебинара после отказа от участия в нем
				}).bind(this)
			});
		};
		/**
		 * POPUP
		 * @this {ParticipantModel} object
		 * */
		this.showPopupWithRemovalUserConfirm = function (object) {
			var userModel = object.user();
			application.root().uiEvent().event().banCondidate(userModel);
			application.api.popupModule.createPopup({
				templateName : 'popup-webinar-remove-user'
			});
		};

		/**
		 * AJAX
		 * */
		this.reloadFilelist = function () {
			var that = this;

			return ajaxAdapter.getRequestRestApi('/webinar/'+self.event_id()+'/file',function (data) {
				that.fileList.removeAll();
				var data = data.result;
				for (var key in data) {

					var data_model = new FileViewModel(data[key]);
					that.fileList.push(data_model);
				}
			});
		};

		/**
		 * AJAX
		 * */
		this.save = function () {
			if (this.isCreateProcess() === true){
				return '';
			}
			var self = this;

			this.isCreateProcess(true);

			var url = !this.editMode()?'/webinar':'/webinar/' + this.event_id(),
				method = !this.editMode()?'post':'put';

			var data = {
				title: this.title(),
				endTime: this.endTime(),
				description: this.description(),
				is_public: this.is_public(),
				timeline: ko.toJSON(this.timeline()),
				users: ko.toJSON(this.participantsCollection().selectedUsers()),
				isExpress: this.isExpress(),
				record: this.enableRecord()
			};

			if (!this.isExpress()){
				data.startTime = this.startTime();
				data.createData = this.createDate();
			}

			var xhr = ajaxAdapter.requestRestApi(url, method, data, function (data) {
				if (data.status == 'success') {
					if (data.result.status == 'ONLINE') {
						application.router.redirect('/webinar/start/'+data.result.event_id)
					} else if (self.editMode()) {
						application.router.redirect('/webinar/view/'+self.event_id());
					} else {
						application.router.redirect('/');
					}
				}
			});

			if (xhr){
				xhr.always(function(){
					self.isCreateProcess(false);
				});
				xhr.fail(function(){
					application.router.redirect('/webinar/view/' + self.event_id()); // catch 500 error from server
				})
			}
			return xhr;
		};
		/**
		 * AJAX
		 * */
		this.finish = function (callback) {
			return ajaxAdapter.requestRestApi('/webinar/'+ self.event_id() + '/control', 'POST', { action : 'finish'}, function (data) {
				callback && callback();
			});
		};

		/**
		 * AJAX
		 * */
		this.join = function (callback) {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/subscribers', 'POST', {'type':'join', 'user_id': application.root().currentUser().id()}, function (data) {
				callback && callback();
			});
		};
		/**
		 * AJAX
		 * @return {jqXHR}
		 * */
		this.inviteCancel = function (callback) {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/subscribers', 'POST', {'type':'cancel', 'user_id': application.root().currentUser().id()}, function (data) {
				callback && callback();
			});
		};
		/**
		 * AJAX
		 * */
		this.cancel = function () {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id(), 'DELETE', {}, function (data) {
				application.router.redirect('/');
			});
		};
		/**
		 * AJAX
		 * @this {UserModel}
		 * @param {ParticipantModel} object
		 * */
		this.ban = function (object) {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'ban', 'subscriber_id': object.subscriber_id(), enable: 1}, function(data){
				if (data.status == 'success') {
					object.status('BANNED');
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.unBunUser = function(object){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'ban', 'subscriber_id': object.subscriber_id(), enable: 0}, function(data){
				if (data.status == 'success') {
					object.status('WAIT');
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.giveVoteUser = function(object){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'vote', 'subscriber_id': object.subscriber_id(), enable: 1}, function(data){
				if (data.status == 'success') {
					object.role('VOTE');
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.forbidVoteUser = function(object){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'vote', 'subscriber_id': object.subscriber_id(), enable: 0}, function(data){
				if (data.status == 'success') {
					object.role('PARTICIPANT');
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.disableUserMic = function(object){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'mic', 'subscriber_id': object.subscriber_id(), enable: 0}, function(data){
				if (data.status == 'success') {
					object.isEnabledMicrophone(false);
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.enableUserMic = function(object){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'mic', 'subscriber_id': object.subscriber_id(), enable: 1}, function(data){
				if (data.status == 'success') {
					object.isEnabledMicrophone(true);
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * */
		this.enableAutoVoice = function (model) {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'voteAuto', 'enable':'1'}, function(data){
			//	if (data.status == 'success') {
				//	app.uiEvent().player().buttonRole('pressed')
				//}
			});
		};
		/**
		 * AJAX
		 * */
		this.disableAutoVoice = function (model) {
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'voteAuto', 'enable':'0'}, function(data){
				//if (data.status == 'success') {
				//	app.uiEvent().player().buttonRole('enable')
				//}
			});
		};
		/**
		 * AJAX
		 * */
		this.askVote = function (model) {
			application.root().uiEvent().player().buttonRole('disabled');
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'requestVote'}, function(data){
				if (data.status == 'success') {
					//app.uiEvent().player().buttonRole('pressed');
				}
			});
		};
		/**
		 * AJAX
		 * */
		this.disableVote = function (model) {
			application.root().uiEvent().player().buttonRole('disabled');
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'vote', 'enable':'0'}, function(data){
				if (data.status == 'success') {
					//app.uiEvent().player().buttonRole('enable');
				}
			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.disableUserMicModification = function(){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'mic', enable: 0}, function(data){

			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} object
		 * */
		this.enableUserMicModification = function(){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'mic', enable: 1}, function(data){

			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} participant
		 * */
		this.toggleActivitySound = function(participant){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'speaker', 'subscriber_id': participant.subscriber_id(), enable: Number(!participant.isEnabledSound())}, function(data){

			});
		};
		/**
		 * AJAX
		 * @param {ParticipantModel} participant
		 * */
		this.enableOnTopStateOfUser = function(participant){
			return ajaxAdapter.requestRestApi('/webinar/'+self.event_id()+'/control', 'POST', {'action':'top', 'subscriber_id': participant.subscriber_id(), enable: 1}, function(data){

			});
		};

		this.validate = function (callback) {
			var tabsComponent = application.api.tabs.findBySelector('#event_create_tabs'),
				hasErrorMainTab = false,
				hasErrorUsers = false,
				hasErrorTimeline = false;

			if (!tabsComponent){
				return true;
			}
			tabsComponent.tabs()[0].counter('');
			tabsComponent.tabs()[1].counter('');

			for (var opt in this) {
				if (ko.isObservable(this[opt]) && typeof(this[opt].check)== 'function') {
					console.log('check', opt);
					if (!this[opt].check()) {
						hasErrorMainTab = true;
					}
				}
			}

			for (var i in this.timeline()) {
				if (!this.timeline()[i].message.check() || !this.timeline()[i].time.check()) {
					hasErrorTimeline = true;
				}
			}
			var currentDate = new Date();
			currentDate.setHours(0,0,0,0);

			var dateArray = this.createDate().split('-');
			var selectedData = new Date(dateArray[0],(Math.round(dateArray[1])-1),dateArray[2]);
			selectedData.setHours(0,0,0,0);

			if (selectedData.valueOf() == currentDate.valueOf() && hasErrorMainTab == false) {
				var currentDate = new Date();

				if (this.startTime() < ((currentDate.getHours()*60)+currentDate.getMinutes())) {
					this.startTime.validationMessage(application.translation.settingTimeMoreCurError);
					hasErrorMainTab = true;
				}

				if (this.startTime() == this.endTime()) {
					this.startTime.validationMessage('');
					this.endTime.validationMessage(application.translation.settingTimeAsCurError);
					hasErrorMainTab = true;
				}
			}

			if (this.is_public() == false && this.participantsCollection().selectedUsers().length == 0) {
				hasErrorUsers = true;
			}

			if (hasErrorMainTab) {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[0].isValid(false);
			} else {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[0].isValid(true);
			}

			if (hasErrorUsers) {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[1].isValid(false);
			} else {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[1].isValid(true);
			}

			if (hasErrorTimeline) {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[2].isValid(false);
			} else {
				application.api.tabs.findBySelector('#event_create_tabs').tabs()[2].isValid(true);
			}

			if (typeof(callback) == 'function') {
				callback(hasError);
			}

			return !(hasErrorMainTab || hasErrorUsers || hasErrorTimeline);
		};

		this.convertHHMMtoCountOfMinutesFn= function (sourceString) {
			if (sourceString == '') return null;

			var timeArray = sourceString.split(":");
			return (Math.round(timeArray[0]*60) + Math.round(timeArray[1]));
		};

		this.convertCountOfMinutesToHHMMFn = function (minutes) {
			if (typeof minutes === 'undefined') return;
			var seconds = parseInt(minutes * 60, 10);
			return this.convertCountOfSecondsToHHMMSSFn(seconds, false, false);
		};

		this.convertCountOfSecondsToHHMMSSFn = function(seconds, dateTransfer, showSeconds){
			dateTransfer = typeof dateTransfer === 'undefined' ? true : dateTransfer;
			showSeconds = typeof showSeconds === 'undefined' ? true : showSeconds;

			if (seconds === 86400){
				return '00:00';
			}
			// Hours, minutes and seconds
			var hrs = Math.floor(seconds / 3600);
			var mins = Math.floor((seconds % 3600) / 60);
			var secs = (seconds % 60);
			var ret = "";

			if (hrs > 0) {
				if ((typeof dateTransfer == 'undefined' || dateTransfer == true) && hrs > 24) {
					hrs = hrs-(24*~~(hrs/24));
				}

				ret += "" + (hrs<=9?"0"+hrs:hrs) + ":";
			} else {
				ret += "00:";
			}
			ret += (mins < 10 ? "0" : "") + mins;
			if (showSeconds == true) {
				ret += ":" + (secs < 10 ? "0" : "") + secs;
			}
			return ret;
		};

		this.getCssClass = function (){
			var self = this;
			switch (self.status()) {
				case "CANCELED":
					return 'web_canceled';
					break;
				case "PLANNED":
					return 'web_wait';
					break;
				case "ONLINE":
					return 'web_online';
					break;
				case "CLOSED":
					return 'web_success';
					break;
			}
			return '';
		};

		this.getTextStatus = function (){
			var self = this;
			switch (self.status()) {
				case "CANCELED":
					return application.translation.canceled;
					break;
				case "PLANNED":
					return application.translation.expected;
					break;
				case "ONLINE":
					return application.translation.onEther;
					break;
				case "CLOSED":
					return application.translation.completed;
					break;
				default:
					return '';
			}
		};

		if (typeof(data) !== 'undefined') {
			this._setAdaptedData(data);
		}

		this.isFilledTime = ko.computed(function(){
			return !!(this.startTime() && this.endTime() && this.duration());
		}, this);

		this.behaviorClearTimeline = ko.computed(function(){
			if (application.root().eventModel()){
				if ( !this.isFilledTime() ){                                                //At least if no one
					if (this.timeline() !== undefined && this.timeline().length !== 0)      //If fields have been filled earlier
						this.timeline([]);                                                  //reset
				}
			}
		}, this);

		this.hideButton = function(model, jqEvent){
			$(jqEvent.target).fadeOut()
		};

		this.showButton = function(model, jqEvent){
			$(jqEvent.target).fadeIn()
		};


	};

	return WebinarModel;
});