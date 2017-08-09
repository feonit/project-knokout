define([
	'knockout',
	'text!components/pages/dialogs-page/dialogs-page.html',
	'application',
	'DialogsCollection',
], function (
	ko,
	template,
	application,
	DialogsCollection
) {

	"use strict";

	function lazyFetchChat(){
		if (application.root().chat && application.root().chat()){
			application.root().chat().lazyFetch();
		}
	}

	function Component(params) {
		this.afterRender(params);
	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(params){
			var app = application.root();
			app.dialogs(new DialogsCollection());

			app.currentUser().onLoad(function () {
				//app.dialogs().load();
			});

			ko.utils.arrayForEach(app.dialogs(), function(dialog){
				dialog.read.subscribe(function resetCounters(isRead){
					if (isRead) {
						application.root().countersModel().dialogsCount(dialog_count);
					}
				}, dialog);
			});

			application.$document.on('tabShow', '#dialogs_list', function(){app.dialogs().load()});
			application.$document.on('tabShow', '#new_dialog', function(){app.colleagues().fetch()});
			application.$body.eventRegister('chat_message', function(){app.dialogs().load()});//todo
			application.mediator.subscribe('page_scrolled_top', lazyFetchChat);
		},

		dispose: function(){
			application.mediator.unsubscribe('page_scrolled_top', lazyFetchChat);

		}
	};

	return { viewModel: Component, template: template }
});