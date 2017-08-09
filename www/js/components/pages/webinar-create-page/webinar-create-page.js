define([
	'ajaxAdapter',
	'knockout',
	'text!components/pages/webinar-create-page/webinar-create-page.html',
	'application',
	'WebinarModel',
	'FileAPI',
	'FilesCollection',
	'jquery.maskedinput',
	'timeline',
	'video'
], function (
	ajaxAdapter,
	ko,
	template,
	application,
	WebinarModel
) {

	"use strict";

	function resetSearchAll(){
	}

	function lazyFetchForActiveTab(){
		if (application.root().colleagues() && !application.root().colleagues().initSearch())
			application.root().colleagues().lazyFetch();
	}

	function Component(params) {
		this.afterRender(params.route().editWebinarId, params.route().repeatWebinarId);
	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(editWebinarId, repeatWebinarId){
			var oldWebinar;

			var eventModel = new WebinarModel();
			application.root().eventModel(eventModel);

			eventModel.editMode(false);

			if (repeatWebinarId){
				eventModel.editMode(false);

				oldWebinar = new WebinarModel();

				oldWebinar.load(repeatWebinarId, function () {
					oldWebinar.participantsCollection().id = repeatWebinarId;// todo need ref eventmodel create
					oldWebinar.participantsCollection().fetch({
						setGETParameters: {
							//showAuthor: 1
						},
						callback : function(){
							eventModel.title(oldWebinar.title());
							eventModel.description(oldWebinar.description());
							eventModel.is_public(oldWebinar.is_public());
							eventModel.enableRecord(oldWebinar.enableRecord());
							// нужно исключить себя
							var user_id = application.root().currentUser().id();
							var participants = oldWebinar.participantsCollection().models().filter(function(participant){
								return participant.user().id() !== user_id;
							});
							oldWebinar.participantsCollection().models(participants);
							eventModel.participantsCollection(oldWebinar.participantsCollection());
							eventModel.isExpress(oldWebinar.isExpress());
							eventModel.startTimestamp(oldWebinar.startTimestamp());//!!!!!!очень важно
						}
					});
				});
			}

			if (editWebinarId){
				eventModel.editMode(true);

				eventModel.load(editWebinarId, function () {
					eventModel.reloadTimeLine();
					eventModel.participantsCollection().id = editWebinarId;// todo need ref eventmodel create

					eventModel.participantsCollection().fetch({
						setGETParameters: {
							//showAuthor: 1
							inviteLevel: 3
						}
					});
				});
			}


			application.$body.eventRegister('colleagueRefresh', application.root().colleagues().fetch ); // TODO colleagueRefresh
			application.$document.on('tabShow', '#participantsTab', resetSearchAll);
			application.$document.on('tabShow', '#infoWebinarTab', resetSearchAll);
			application.$document.on('tabShow', '#timelineTab', resetSearchAll);
			application.mediator.subscribe('page_scrolled_bottom', lazyFetchForActiveTab);

			// todo вынести прелоадер отдельно от адаптера, rc для прелоадера
			eventModel.isCreateProcess.subscribe(function(value){
				if (value === true){
					ajaxAdapter.glbPreloadShow();
				} else if (value === false){
					ajaxAdapter.glbPreloadHide();
				}
			}, this);
		},

		dispose: function(){
			application.$body.eventUnRegister('colleagueRefresh');
			application.$document.off('tabShow');
			application.mediator.unsubscribe('page_scrolled_bottom');
		}
	};

	return { viewModel: Component, template: template }
});