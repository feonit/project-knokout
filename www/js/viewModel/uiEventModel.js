define([
	'application',
	'knockout',
	'router',
	'WebinarModel',
	'MessagesCollection',
	'StreamerControlModel',
	'PlayerModel',
	'ajaxAdapter'
],
	function(
		application,
		ko,
		router,
        WebinarModel,
		MessagesCollection,
		StreamerControlModel,
		PlayerModel,
		ajaxAdapter
	){

	"use strict";

	return function uiEventModel(options) {
		var self = this;

		this.event_id = options.event_id;
		this.accessLevel = ko.observable('participant'); // FULL_CONTROL CONTROL NONE
		this.layer = ko.observable("DEFAULT");

		this.event = ko.observable(new WebinarModel());
		this.chat = ko.observable();
		this.player = ko.observable(new PlayerModel());
		this.opened = ko.observable(true);

		this.isOpenMemberField = ko.observable(false);
		this.isOpenLibraryField = ko.observable(false);

		this.cancelWebinar = function(){
			var  that = this;
			this.opened(false);
			if (this.event().isAuthor()){
				this.event().finish(function(){
//					router.page.redirect('/');
//					window.location = '/';
					that.player().hangup();
				});
			} else {
				this.player().hangup();
//				window.location = '/';
//				router.page.redirect('/')
			}
		};

		this.hasActiveUsers = ko.observable(); // enabled/disabled buttons for mic and ether
		this.isEnabledAllMic = ko.observable();
		this.isEnabledAllEther = ko.observable();

		/**
		 * AJAX
		 * @param {Object} object
		 * */
		this.toggleEnableAllMic = function(object){
			var toggleState = this.isEnabledAllMic() ? 0 : 1,
				that = this;
			return ajaxAdapter.requestRestApi('/webinar/'+ application.root().uiEvent().event().event_id()+'/control', 'POST', {'action':'micAll', enable: toggleState}, function(data){
				if (data.status == 'success') {
					that.isEnabledAllMic(!that.isEnabledAllMic())
				} else {
					console.warn('Error');
				}
			});
		};
		/**
		 * AJAX
		 * @param {Object} object
		 * */
		this.toggleEnableAllEther = function(object){
			var toggleState = this.isEnabledAllEther() ? 0 : 1,
				that = this;
			return ajaxAdapter.requestRestApi('/webinar/'+ application.root().uiEvent().event().event_id()+'/control', 'POST', {'action':'voteAll', enable: toggleState}, function(data){
				if (data.status == 'success') {
					that.isEnabledAllEther(!that.isEnabledAllEther())
				} else {
					console.warn('Error');
				}
			});
		};

		this.behaviorButtonsMicAndEther = ko.computed(function(){
			var usersList = this.event().participantsCollection().models(), //subscribe when userList has chane
				participantUsersCount = 0,
				voteUsersCount = 0,
				micOff = 0,
				micOn = 0, status, role;
			ko.utils.arrayForEach(usersList, function(item){
				status = item.status();
				role = item.role();
				if (status === 'ONLINE'){
					if(role === 'VOTE') voteUsersCount++;
					if(role === 'PARTICIPANT') participantUsersCount++;
					if(role === 'PARTICIPANT' || role === 'VOTE'){
						item.isEnabledMicrophone() === true ? micOn++ : micOff++;
					}
				}
			});
			if (participantUsersCount > 0 || voteUsersCount > 0){
				this.hasActiveUsers(true);
			} else {
				this.hasActiveUsers(false);
			}
			this.isEnabledAllMic(micOn >= micOff);
			this.isEnabledAllEther(voteUsersCount >= participantUsersCount);
		}, this);

		var savedTitle,
			previousElement;

		/**
		 *  It is used in the layout
		 *  function button handler
		 *  @this {uiEventModel}
		 * */
		this.onLibraryButtonClick = function (model, event){
			if (this.isOpenLibraryField()){
				this.closeLibrary(model, event);
			} else {
				this.openLibrary(model, event);
			}
		};

		this.__libraryButton = undefined; // МЕГАКОСТЫЛЬ, нужно рефакторить метод toggleDisplayCurtain принимающий на себя event.target чтобы переключить занавес
		/**
		 *  It is used in scripts
		 * */
		this.openLibrary = function(model, event){
			var that = this;

			this.__libraryButton = event.target;

			function sortByPlayableFile(){
				var idPlayedFile = application.root().uiEvent().player().streamerControlModel().file_id();

				if ( idPlayedFile ){
					var files = application.root().library().models();

					var isExist;

					files.some(function(file, index){
						isExist = (file.id() === idPlayedFile);

						if ( isExist ){
							var file = application.root().library().models.splice(index, 1)[0];
							application.root().library().models.unshift(file);
							return true;
						}

					});
				}
			}

			if ( !that.openLibrary.isInitizlizedLibrary ){
				that.openLibrary.isInitizlizedLibrary = true;
			} else {
				application.mediator.trigger('componentTabLibrary', 'command_reset_to_catalog');
			}

			toggleDisplayCurtain.call(event.target);
			this.isOpenLibraryField(true);
		};

		this.closeLibrary = function(model, event){
			var target;
			if (!event){
				target = this.__libraryButton;
			} else {
				target = event.target;
			}
			toggleDisplayCurtain.call(target);
			this.isOpenLibraryField(false);

			//componentTabLibrary
		};

		/**
		 * function button handler
		 * */
		this.onMemberButtonClick = function (model, event){
			var that = this;

			toggleDisplayCurtain.call(event.target, function(){
				var currentState = application.root().uiEvent().isOpenMemberField();
				application.root().uiEvent().isOpenMemberField(!currentState);
			});
		};

		this.closeMemberCurtain = function(){
			$('#member_field').click();
		};


		/**
		 * function callback
		 * */
		function toggleDisplayCurtain(callback) {
			if ($(this).hasClass("inside_image")) {
				var that = $(this).parent(".icon_btn");
			} else {
				var that = $(this);
			}
			var header_line = $(".header_line"),
					index = that.index(),
					curtain = $(".up_curtain");
				popUpScrollFix(curtain);

			if (that.hasClass("disabled_btn")) {
				return '';
			}

			callback = callback || function(){};

			if (that.hasClass("delete_btn")) {
				window.curtainOn = false;
				that.removeClass("delete_btn btns_red").attr("data-title", savedTitle);

				curtain
					.children()
					.eq(index)
					.animate({opacity: "hide"}, 200, function() {
						curtain.slideUp(200);
						callback();
					});
			} else {
				if (window.curtainOn == false) {
					previousElement = that;
					savedTitle = previousElement.attr("data-title");



					that
						.addClass("delete_btn btns_red")
						.attr("data-title", application.translation['close']);
					curtain
						.slideDown(200, function() {
							curtain
								.children()
								.eq(index)
								.animate({opacity: "show"}, 200, function() {
									checkInSight();
									callback();
								});
						}
					);
				} else {
					previousElement = that;
					previousElement.attr("data-title", savedTitle);
					savedTitle = previousElement.attr("data-title");

					$('.middle_main_content').css('overflow', 'auto');

					that
						.attr("data-title", application.translation['close'])
						.addClass("delete_btn btns_red")
						.siblings()
						.removeClass("delete_btn btns_red");

					var leftCss;

					curtain.children("div:visible").index() > index
						? (leftCss = "-300px")
						: (leftCss = "300px");

					curtain.children()
						.eq(index)
						.css({left: leftCss})
						.animate({left: "0", opacity: "show"}, 300, function(){



							callback && callback();
						})
						.siblings()
						.hide();

					checkInSight();
				}
				window.curtainOn = true;
			}
			return '';
		}

		/**
		 * function callback
		 * */
		function checkInSight() {
			var visibleSlide = $("div.slide_border:visible");
			var width_chl = visibleSlide.parent(".main_menu").children("div:first").width();

			if (visibleSlide.width() == 0) {
				visibleSlide.css("width", width_chl);
			}
		}

		/**
		 * handler confirm
		 * */
		this.onRemoveUserButtonClick = function(){
			if (this.event().banCondidate()){
				var object,
					that = this;

				this.event().participantsCollection().models().forEach(function(item){
					if (item.user().id() === that.event().banCondidate().id()){
						object = item;
					}
				});

				this.event().ban.call(this.event().banCondidate(), object);
				this.event().banCondidate('');
			}
			return true;
		};

		this.initializeInstance = function(){
			$('.middle_main_content').addClass('none_scroll');  // КОСТЫЛЬ
		};

		this.destroyInstance = function(){
			var urlChannelForClose = this.player() && this.player().connectionOptions && this.player().connectionOptions.channel;

			if (urlChannelForClose){
				application.$body.unsubscribeFromChannel(urlChannelForClose);
			}

			$('.middle_main_content').removeClass('none_scroll');  // КОСТЫЛЬ

		};

		/**
		 * API used by eventSource handler (subscribersList:reload)
		 * */
		this.fetchParticipantsCollection = function(){
			application.root().uiEvent().event().participantsCollection().fetch({
				setGETParameters: {
					showAuthor: 1,
					inviteLevel: 3,
					showGuests: 1
				}
			});
		};
	}
});