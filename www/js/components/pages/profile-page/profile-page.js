/**
 * Created by Orlov on 12.01.15.
 *
 * @comments
 * конструкция $uploadNode.replaceWith( $uploadNode = $uploadNode.clone( true ) );
 * должна быть заменена на подобную FileAPI.reset($uploadNode[0]);
 */

define([
	'knockout',
	'text!components/pages/profile-page/profile-page.html',
	'application',
	'site_effects'
], function (
	ko,
	template,
	application
) {

	"use strict";

	function Component(params) {
		this.afterRender();

		this.activeTabIndex = ko.observable();

		this.currentUser = application.root().currentUser;
	}

	Component.prototype = {
		constructor: Component,

		afterRender: function(){
			var that = this;

			application.$document.on('tabShow', '#myProfileTab', function (){
				that.activeTabIndex(1);
			});

			application.$document.on('tabShow', '#myLibraryTab', function (){
				that.activeTabIndex(1);
				application.mediator.trigger('componentTabLibrary', 'command_reset_to_catalog');
			});

			application.$document.on('tabShow', '#myColleaguesTab', function(){
				that.activeTabIndex(2);
				application.mediator.trigger('componentTabColleagues', 'command:tab:reset');
			});
			application.$document.on('tabShow', '#myWebinarsTab', function(){
				that.activeTabIndex(3);
				application.mediator.trigger('componentTabWebinars', 'command:tab:reset');
			});
			application.$document.on('tabShow', '#myUserSettingsTab', function _handler(){
				that.activeTabIndex(4);
			});

			application.$body.eventRegister('chat_message', function(){
				console.log(arguments)
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

			delete application.api.tabs.tabComponents['#myProfileTabsComponent']; // todo
		}
	};

	return { viewModel: Component, template: template }
});

