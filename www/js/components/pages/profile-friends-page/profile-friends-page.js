define([
	'knockout',
	'text!components/pages/profile-friends-page/profile-friends-page.html',
	'application',
	'UserModel'
], function (
	ko,
	template,
	application,
	UserModel
) {

	"use strict";

	function Component(params) {
		var id = params.route().userId;

		// it's my page
		if (id == appConfig.auth.user.info.id ){
			application.router.redirectToMyProfile();
			return;
		}

		this.afterRender(id);

		this.activeTabIndex = ko.observable();

		var alienUser = new UserModel({id:id});

		this.alienUser = ko.observable(alienUser);

		alienUser.fetch();

		application.root().alienUser(alienUser);// todo remove
	}

	Component.prototype = {
		constructor: Component,


		afterRender: function(id){
			var that = this;

			application.$document.on('tabShow', '#userTab', function (){
					that.activeTabIndex(0);
			});

			application.$document.on('tabShow', '#libraryTab', function (){
					that.activeTabIndex(1);
					application.mediator.trigger('componentTabLibraryFriends', 'command_reset_to_catalog');
			});

			application.$document.on('tabShow', '#colleaguesTab', function(){
				that.activeTabIndex(2);
				application.mediator.trigger('componentTabColleaguesFriends', 'command:tab:reset');
			});
			application.$document.on('tabShow', '#webinarsTab', function(){
				that.activeTabIndex(3);
				application.mediator.trigger('componentTabWebinarsFriends', 'command:tab:reset');
			});

			application.mediator.subscribe('page_scrolled_top', function lazyFetchChat(){
				if (application.root().chat && application.root().chat()){
					application.root().chat().lazyFetch();
				}
			});
		},

		dispose: function(){
			application.mediator.unsubscribe('page_scrolled_top');
			application.$document.off();

			application.root().colleagues('');
			application.root().catalogViewModel('');
			application.root().webinarsCollection('');

			delete application.api.tabs.tabComponents['#otherProfileTabsComponent']; // todo
		}
	};

	return { viewModel: Component, template: template }
});